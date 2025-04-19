import { NextResponse } from 'next/server';
import { getFinancialAnswer } from '@/ai/flows/financial-qa'; // Re-add the import
import { z } from 'zod';

// Force Node.js runtime for better compatibility
export const runtime = 'nodejs';

// Define schema for expected request body
const RequestBodySchema = z.object({
  query: z.string(),
  accounts: z.array(z.any()), // Use z.any() for now, refine if specific schema is available client-side
  expenses: z.array(z.any()),
  income: z.array(z.any()),
});

export async function POST(request: Request) {
  try {
    // Check content type before parsing JSON
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Invalid content type, expected application/json' }, { status: 415 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("API JSON Parse Error:", parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Validate request body
    const validation = RequestBodySchema.safeParse(body);
    if (!validation.success) {
      // Log the detailed validation error for debugging
      console.error("API Request Body Validation Error:", validation.error.errors);
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.format() }, { status: 400 });
    }

    const { query, accounts, expenses, income } = validation.data;
    const result = await getFinancialAnswer(query, accounts, expenses, income);

    if (result.success) {
      return NextResponse.json({ response: result.answer });
    } else {
      console.error("Financial QA Flow Error (reported by helper):", result.answer);
      return NextResponse.json({ error: result.answer }, { status: 500 });
    }

  } catch (error) {
    // This catch block handles unexpected errors *outside* the getFinancialAnswer helper's try/catch
    // or errors during request processing before calling the helper.
    console.error("Unhandled AI Query API Error:", error);

    let errorMessage = 'An unexpected error occurred while processing your request.';
    let statusCode = 500;

    // Add more specific error handling if needed
    if (error instanceof Error) {
      errorMessage = `Server Error: ${error.message}`;
    }
    // You could add checks for specific error types if known issues arise

    // Ensure a JSON response is always sent
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
