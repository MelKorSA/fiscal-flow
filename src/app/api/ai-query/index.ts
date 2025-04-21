import { NextRequest, NextResponse } from 'next/server';
import { getFinancialAnswer } from '@/ai/flows/financial-qa';
import { prisma } from '@/lib/db';

// Validate API key availability
const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const isAIConfigured = !!GOOGLE_GENAI_API_KEY;

// Functions to fetch data from the database
async function fetchAccountsFromDB() {
  try {
    const accounts = await prisma.account.findMany();
    return accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance !== null ? parseFloat(account.balance.toString()) : undefined,
      ...(account.startDate && { startDate: account.startDate.toISOString() }),
      ...(account.tenureMonths && { tenureMonths: account.tenureMonths }),
      ...(account.interestRate && { interestRate: parseFloat(account.interestRate.toString()) }),
    }));
  } catch (error) {
    console.error("Error fetching accounts from database:", error);
    throw error;
  }
}

async function fetchExpensesFromDB() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    });
    
    return expenses.map(expense => ({
      id: expense.id,
      accountId: expense.accountId,
      amount: parseFloat(expense.amount.toString()),
      date: expense.date.toISOString(),
      description: expense.description || '',
      category: expense.category,
    }));
  } catch (error) {
    console.error("Error fetching expenses from database:", error);
    throw error;
  }
}

async function fetchIncomeFromDB() {
  try {
    const income = await prisma.income.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    });
    
    return income.map(inc => ({
      id: inc.id,
      accountId: inc.accountId,
      amount: parseFloat(inc.amount.toString()),
      date: inc.date.toISOString(),
      description: inc.description || '',
      source: inc.source,
    }));
  } catch (error) {
    console.error("Error fetching income from database:", error);
    throw error;
  }
}

// Mock response generator for when AI is not configured
function generateMockResponse(query: string, accounts: any[], expenses: any[], income: any[]) {
  // Create a simple response based on the data
  const totalAccounts = accounts.length;
  const totalExpenses = expenses.length;
  const totalIncome = income.length;
  
  const totalBalance = accounts.reduce((sum, acc) => 
    sum + (acc.balance || 0), 0).toFixed(2);
  
  const totalExpenseAmount = expenses.reduce((sum, exp) => 
    sum + exp.amount, 0).toFixed(2);
  
  const totalIncomeAmount = income.reduce((sum, inc) => 
    sum + inc.amount, 0).toFixed(2);

  return {
    answer: `I found ${totalAccounts} accounts with a total balance of $${totalBalance}, 
    ${totalExpenses} expense transactions totaling $${totalExpenseAmount}, 
    and ${totalIncome} income transactions totaling $${totalIncomeAmount}. 
    
    Note: The AI service is currently in demo mode as no API key is configured.`,
    success: true
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Check if AI service is configured
    if (!isAIConfigured) {
      console.warn("AI Service not configured: GOOGLE_GENAI_API_KEY is missing");
      
      try {
        // Fetch data but use mock response instead of AI
        const accounts = await fetchAccountsFromDB();
        const expenses = await fetchExpensesFromDB();
        const income = await fetchIncomeFromDB();
        
        const mockResult = generateMockResponse(query, accounts, expenses, income);
        
        return NextResponse.json({
          response: mockResult.answer,
          success: mockResult.success,
          mode: "demo"
        });
      } catch (error) {
        console.error("Error in mock response generation:", error);
        return NextResponse.json(
          { 
            error: "AI service not configured and failed to generate mock response",
            details: error instanceof Error ? error.message : String(error)
          },
          { status: 500 }
        );
      }
    }

    // Fetch data from database
    let accounts, expenses, income;
    
    try {
      accounts = await fetchAccountsFromDB();
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      return NextResponse.json(
        { error: "Failed to fetch accounts from database", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
    
    try {
      expenses = await fetchExpensesFromDB();
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      return NextResponse.json(
        { error: "Failed to fetch expenses from database", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
    
    try {
      income = await fetchIncomeFromDB();
    } catch (error) {
      console.error("Failed to fetch income:", error);
      return NextResponse.json(
        { error: "Failed to fetch income from database", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }

    // Real AI processing with robust error handling
    try {
      const result = await getFinancialAnswer(query, accounts, expenses, income);
      
      if (!result || !result.answer) {
        throw new Error("Empty response received from AI service");
      }
      
      return NextResponse.json({
        response: result.answer,
        success: result.success
      });
    } catch (error) {
      console.error("Error in AI financial answer generation:", error);
      
      // Fallback to mock response if AI fails
      try {
        const mockResult = generateMockResponse(query, accounts, expenses, income);
        return NextResponse.json({
          response: `AI service error: ${error instanceof Error ? error.message : String(error)}. 
                    Falling back to basic response: ${mockResult.answer}`,
          success: false,
          fallback: true
        });
      } catch (fallbackError) {
        return NextResponse.json(
          { 
            error: "AI service failed and fallback also failed",
            details: error instanceof Error ? error.message : String(error)
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error in AI query:", error);
    return NextResponse.json(
      { 
        error: "Failed to process AI query",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}