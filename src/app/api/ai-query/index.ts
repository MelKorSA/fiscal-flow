import { NextRequest, NextResponse } from 'next/server';
import { getFinancialAnswer } from '@/ai/flows/financial-qa';
import { prisma } from '@/lib/db';

// Functions to fetch data from the database
async function fetchAccountsFromDB() {
  try {
    const accounts = await prisma.account.findMany();
    return accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type,
      balance: account.balance !== null ? parseFloat(account.balance.toString()) : undefined,
      ...(account.startDate && { startDate: account.startDate }),
      ...(account.tenureMonths && { tenureMonths: account.tenureMonths }),
      ...(account.interestRate && { interestRate: parseFloat(account.interestRate.toString()) }),
    }));
  } catch (error) {
    console.error("Error fetching accounts from database:", error);
    return [];
  }
}

async function fetchExpensesFromDB() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
      take: 100, // Limit to recent expenses
    });
    
    return expenses.map(expense => ({
      id: expense.id,
      accountId: expense.accountId,
      amount: parseFloat(expense.amount.toString()),
      date: expense.date.toISOString(),
      description: expense.description,
      category: expense.category,
    }));
  } catch (error) {
    console.error("Error fetching expenses from database:", error);
    return [];
  }
}

async function fetchIncomeFromDB() {
  try {
    const income = await prisma.income.findMany({
      orderBy: { date: 'desc' },
      take: 100, // Limit to recent income entries
    });
    
    return income.map(inc => ({
      id: inc.id,
      accountId: inc.accountId,
      amount: parseFloat(inc.amount.toString()),
      date: inc.date.toISOString(),
      description: inc.description,
      source: inc.source,
    }));
  } catch (error) {
    console.error("Error fetching income from database:", error);
    return [];
  }
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

    // Fetch data from database instead of using the data passed in the request
    const accounts = await fetchAccountsFromDB();
    const expenses = await fetchExpensesFromDB();
    const income = await fetchIncomeFromDB();

    const result = await getFinancialAnswer(query, accounts, expenses, income);

    return NextResponse.json({
      response: result.answer,
      success: result.success,
    });

  } catch (error) {
    console.error("Error in AI query:", error);
    return NextResponse.json(
      { error: "Failed to process AI query" },
      { status: 500 }
    );
  }
}