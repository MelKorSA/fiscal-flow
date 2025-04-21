import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/goals - Get all financial goals
export async function GET() {
  try {
    const goals = await prisma.financialGoal.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching financial goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial goals" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new financial goal
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, category, targetAmount, currentAmount,
      priority, targetDate
    } = body;
    
    // Validate required fields
    if (!name || !category || !targetAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the financial goal
    const newGoal = await prisma.financialGoal.create({
      data: {
        name,
        category,
        targetAmount: parseFloat(targetAmount.toString()),
        currentAmount: currentAmount ? parseFloat(currentAmount.toString()) : 0,
        priority: priority || "medium",
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error("Error creating financial goal:", error);
    return NextResponse.json(
      { error: "Failed to create financial goal" },
      { status: 500 }
    );
  }
}

// PUT /api/goals - Update a financial goal
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing goal ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, category, targetAmount, currentAmount,
      priority, targetDate
    } = body;

    // Update the financial goal
    const updatedGoal = await prisma.financialGoal.update({
      where: { id },
      data: {
        name,
        category,
        targetAmount: parseFloat(targetAmount.toString()),
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount.toString()) : undefined,
        priority,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating financial goal:", error);
    return NextResponse.json(
      { error: "Failed to update financial goal" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals - Delete a financial goal
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing goal ID" },
        { status: 400 }
      );
    }
    
    // Delete the financial goal
    await prisma.financialGoal.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting financial goal:", error);
    return NextResponse.json(
      { error: "Failed to delete financial goal" },
      { status: 500 }
    );
  }
}