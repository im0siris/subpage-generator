import { NextRequest, NextResponse } from 'next/server';

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

  // For now, return pending status since we don't have persistent storage
  const result = null;

  // Since we don't have persistent storage, always return pending
  console.log(`Job ${jobId} status check - returning pending`);
  return NextResponse.json({
    status: 'pending',
    message: 'Job is still processing...'
  });
}


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