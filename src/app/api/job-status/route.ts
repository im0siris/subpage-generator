import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for job results (shared between routes)
const jobResults = new Map();

export async function GET(request: NextRequest) {
  console.log('Job status endpoint called');

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');

  console.log(`Checking status for job: ${jobId}`);

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing job_id parameter' },
      { status: 400 }
    );
  }

  // Get the stored results
  const result = jobResults.get(jobId);

  if (!result) {
    console.log(`Job ${jobId} not found, returning pending`);
    return NextResponse.json({
      status: 'pending',
      message: 'Job is still processing...'
    });
  }

  console.log(`Job ${jobId} found with status: ${result.status}`);
  return NextResponse.json({
    status: result.status,
    content: result.content,
    city: result.city,
    domain: result.domain,
    timestamp: result.timestamp
  });
}

// Export the jobResults so other modules can import it
export { jobResults };

// Handle CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}