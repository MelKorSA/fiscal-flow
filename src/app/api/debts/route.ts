import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/debts - Get all debt entries
export async function GET() {
  try {
    const debts = await prisma.debt.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }
}

// POST /api/debts - Create a new debt entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, type, amount, interestRate, minimumPayment,
      dueDate, paymentDate, remainingPayments, isPaid
    } = body;
    
    // Validate required fields
    if (!name || !type || !amount || interestRate === undefined || !minimumPayment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the debt entry
    const newDebt = await prisma.debt.create({
      data: {
        name,
        type,
        amount: parseFloat(amount.toString()),
        interestRate: parseFloat(interestRate.toString()),
        minimumPayment: parseFloat(minimumPayment.toString()),
        dueDate: dueDate ? new Date(dueDate) : null,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        remainingPayments: remainingPayments ? parseInt(remainingPayments.toString()) : null,
        isPaid: isPaid || false,
      },
    });

    return NextResponse.json(newDebt, { status: 201 });
  } catch (error) {
    console.error("Error creating debt:", error);
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }
}

// PUT /api/debts/:id - Update a debt entry
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing debt ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, type, amount, interestRate, minimumPayment,
      dueDate, paymentDate, remainingPayments, isPaid
    } = body;

    // Update the debt entry
    const updatedDebt = await prisma.debt.update({
      where: { id },
      data: {
        name,
        type,
        amount: parseFloat(amount.toString()),
        interestRate: parseFloat(interestRate.toString()),
        minimumPayment: parseFloat(minimumPayment.toString()),
        dueDate: dueDate ? new Date(dueDate) : null,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        remainingPayments: remainingPayments ? parseInt(remainingPayments.toString()) : null,
        isPaid: isPaid || false,
      },
    });

    return NextResponse.json(updatedDebt);
  } catch (error) {
    console.error("Error updating debt:", error);
    return NextResponse.json(
      { error: "Failed to update debt" },
      { status: 500 }
    );
  }
}

// DELETE /api/debts - Delete a debt
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing debt ID" },
        { status: 400 }
      );
    }
    
    // Delete the debt entry
    await prisma.debt.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting debt:", error);
    return NextResponse.json(
      { error: "Failed to delete debt" },
      { status: 500 }
    );
  }
}