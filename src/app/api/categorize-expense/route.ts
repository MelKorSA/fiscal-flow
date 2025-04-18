import { NextResponse } from 'next/server';
import { categorizeTxnWithAI } from '@/ai/flows/transaction-categorization';
import { z } from 'zod';

// Input validation schema
const RequestBodySchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().optional(),
  date: z.string().optional(),
  // Add previousTransactions if you want to pass context
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = RequestBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { description, amount, date } = validation.data;

    // Call the AI flow on the server
    const result = await categorizeTxnWithAI(description, amount, date);

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
