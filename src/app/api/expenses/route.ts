import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/expenses - Get all expenses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const category = searchParams.get('category');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build filter conditions
    let whereCondition: any = {};
    
    if (accountId) {
      whereCondition.accountId = accountId;
    }
    
    if (category) {
      whereCondition.category = category;
    }
    
    if (fromDate || toDate) {
      whereCondition.date = {};
      
      if (fromDate) {
        whereCondition.date.gte = new Date(fromDate);
      }
      
      if (toDate) {
        whereCondition.date.lte = new Date(toDate);
      }
    }

    const expenses = await prisma.expense.findMany({
      where: whereCondition,
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

// POST /api/expenses - Create a new expense
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, amount, category, date, description } = body;
    
    // Validate required fields
    if (!accountId || !amount || !category || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the expense
    const newExpense = await prisma.expense.create({
      data: {
        accountId,
        amount: parseFloat(amount.toString()),
        category,
        date: new Date(date),
        description: description || null,
      },
    });

    // Update the account balance (subtract the expense amount)
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          decrement: parseFloat(amount.toString())
        }
      }
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}