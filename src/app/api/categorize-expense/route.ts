import { NextResponse } from 'next/server';
import { categorizeTxnWithAI } from '@/ai/flows/transaction-categorization';
import { z } from 'zod';

// Input validation schema
const RequestBodySchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().optional(),
  date: z.string().optional(),
  // Add previousTransactions to the schema
  previousTransactions: z.array(
    z.object({
      description: z.string(),
      category: z.string(),
      amount: z.number().optional(),
    })
  ).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = RequestBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    // Destructure previousTransactions as well
    const { description, amount, date, previousTransactions } = validation.data;

    // Call the AI flow on the server, passing previousTransactions
    const result = await categorizeTxnWithAI(description, amount, date, previousTransactions);

    if (!result.success) {
      // Log the error server-side
      console.error('AI categorization failed for:', description);
      // Return a generic error or the default category
      return NextResponse.json({ category: 'Other', confidence: 0 }, { status: 500 });
    }

    return NextResponse.json({ category: result.category, confidence: result.confidence });

  } catch (error) {
    console.error('Error in /api/categorize-expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
