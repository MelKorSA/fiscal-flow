import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/accounts - Get all accounts
export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST /api/accounts - Create a new account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, balance, startDate, tenureMonths, interestRate } = body;
    
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const newAccount = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance !== undefined ? parseFloat(balance.toString()) : null,
        startDate: startDate ? new Date(startDate) : null,
        tenureMonths: tenureMonths ? parseInt(tenureMonths.toString()) : null,
        interestRate: interestRate ? parseFloat(interestRate.toString()) : null,
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}