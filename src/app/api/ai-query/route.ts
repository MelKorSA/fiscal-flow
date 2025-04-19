import { NextResponse } from 'next/server';
import { getFinancialAnswer } from '@/ai/flows/financial-qa'; // Import the new helper
import { z } from 'zod';

// Define schema for expected request body
const RequestBodySchema = z.object({
  query: z.string(),
  accounts: z.array(z.any()), // Use z.any() for now, refine if specific schema is available client-side
  expenses: z.array(z.any()),
  income: z.array(z.any()),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = RequestBodySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.errors }, { status: 400 });
    }

    const { query, accounts, expenses, income } = validation.data;

    // Call the financial QA flow helper function
    const result = await getFinancialAnswer(query, accounts, expenses, income);

    if (result.success) {
      return NextResponse.json({ response: result.answer });
    } else {
      // Return the error message from the flow if it failed
      return NextResponse.json({ error: result.answer }, { status: 500 });
    }

  } catch (error) {
    console.error("AI Query API Error:", error);
    let errorMessage = 'Failed to process AI query.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
