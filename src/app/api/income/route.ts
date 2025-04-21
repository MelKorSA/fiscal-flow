import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/income - Get all income entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const source = searchParams.get('source');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build filter conditions
    let whereCondition: any = {};
    
    if (accountId) {
      whereCondition.accountId = accountId;
    }
    
    if (source) {
      whereCondition.source = source;
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

    const income = await prisma.income.findMany({
      where: whereCondition,
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error("Error fetching income:", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

// POST /api/income - Create a new income entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, amount, source, date, description } = body;
    
    // Validate required fields
    if (!accountId || !amount || !source || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the income entry
    const newIncome = await prisma.income.create({
      data: {
        accountId,
        amount: parseFloat(amount.toString()),
        source,
        date: new Date(date),
        description: description || null,
      },
    });

    // Update the account balance (add the income amount)
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: parseFloat(amount.toString())
        }
      }
    });

    return NextResponse.json(newIncome, { status: 201 });
  } catch (error) {
    console.error("Error creating income:", error);
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}