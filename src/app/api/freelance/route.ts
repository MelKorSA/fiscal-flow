import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/freelance - Get all freelance income entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const client = searchParams.get('client');
    const category = searchParams.get('category');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build filter conditions
    let whereCondition: any = {};
    
    if (platform) {
      whereCondition.platform = platform;
    }
    
    if (client) {
      whereCondition.client = client;
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

    const freelanceIncome = await prisma.freelanceIncome.findMany({
      where: whereCondition,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(freelanceIncome);
  } catch (error) {
    console.error("Error fetching freelance income:", error);
    return NextResponse.json(
      { error: "Failed to fetch freelance income" },
      { status: 500 }
    );
  }
}

// POST /api/freelance - Create a new freelance income entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      platform, client, project, amount, currency, 
      date, paymentStatus, category, hoursWorked 
    } = body;
    
    // Validate required fields
    if (!platform || !client || !project || !amount || !date || !category || !hoursWorked) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate hourly rate
    const hourlyRate = parseFloat(amount.toString()) / parseFloat(hoursWorked.toString());

    // Create the freelance income entry
    const newFreelanceIncome = await prisma.freelanceIncome.create({
      data: {
        platform,
        client,
        project,
        amount: parseFloat(amount.toString()),
        currency: currency || "USD",
        date: new Date(date),
        paymentStatus: paymentStatus || "paid",
        category,
        hoursWorked: parseFloat(hoursWorked.toString()),
        hourlyRate,
      },
    });

    return NextResponse.json(newFreelanceIncome, { status: 201 });
  } catch (error) {
    console.error("Error creating freelance income:", error);
    return NextResponse.json(
      { error: "Failed to create freelance income" },
      { status: 500 }
    );
  }
}

// DELETE /api/freelance - Delete a freelance income entry
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing income ID" },
        { status: 400 }
      );
    }
    
    // Delete the freelance income entry
    await prisma.freelanceIncome.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting freelance income:", error);
    return NextResponse.json(
      { error: "Failed to delete freelance income" },
      { status: 500 }
    );
  }
}