import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for job results
const jobResults = new Map();

export async function POST(request: NextRequest) {
  try {
    console.log('Callback endpoint called');

    const body = await request.json();
    console.log('Received callback from n8n workflow:', body);

    // Validate the required fields
    if (!body.job_id || !body.content) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: job_id or content' },
        { status: 400 }
      );
    }

    // Store the result
    jobResults.set(body.job_id, {
      status: body.status || 'completed',
      content: body.content,
      timestamp: new Date().toISOString(),
      city: body.city,
      domain: body.domain
    });

    console.log(`Stored result for job ${body.job_id}`);

    return NextResponse.json({
      success: true,
      message: 'Callback received successfully'
    });

  } catch (error) {
    console.error('Error handling callback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the jobResults for the status endpoint
export { jobResults };

// Handle CORS for the callback
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}