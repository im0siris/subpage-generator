import { NextRequest, NextResponse } from 'next/server';

// Enhanced job storage structure for database-driven content
interface JobData {
  job_id: string;
  domain: string;
  branche?: string;
  description?: string;
  cities: Array<{
    name: string;
    postcode: string;
    country: string;
    generated_html?: string; // HTML content for this specific city
  }>;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

// Enhanced in-memory storage (replace with database in production)
const jobDatabase = new Map<string, JobData>();

export async function GET(request: NextRequest) {
  console.log('Job data endpoint called');

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing job_id parameter' },
      { status: 400 }
    );
  }

  const jobData = jobDatabase.get(jobId);

  if (!jobData) {
    return NextResponse.json({
      status: 'pending',
      message: 'Job not found or still processing...'
    });
  }

  return NextResponse.json({
    success: true,
    data: jobData
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Job data creation/update endpoint called');

    const body = await request.json();
    console.log('Received job data:', body);

    // Handle job creation
    if (body.action === 'create') {
      const jobData: JobData = {
        job_id: body.job_id,
        domain: body.domain,
        branche: body.branche,
        description: body.description,
        cities: body.cities.map((city: any) => ({
          name: city.name,
          postcode: city.postcode,
          country: city.country
        })),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      jobDatabase.set(body.job_id, jobData);
      console.log(`Created job ${body.job_id}`);

      return NextResponse.json({
        success: true,
        job_id: body.job_id,
        message: 'Job created successfully'
      });
    }

    // Handle job completion with generated HTML
    if (body.action === 'complete') {
      const existingJob = jobDatabase.get(body.job_id);

      if (!existingJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      // Update job with generated HTML for specific city
      const updatedJob: JobData = {
        ...existingJob,
        status: 'completed',
        completed_at: new Date().toISOString(),
        cities: existingJob.cities.map(city => {
          if (city.name === body.city) {
            return {
              ...city,
              generated_html: body.generated_html
            };
          }
          return city;
        })
      };

      jobDatabase.set(body.job_id, updatedJob);
      console.log(`Updated job ${body.job_id} for city ${body.city}`);

      return NextResponse.json({
        success: true,
        message: 'Job updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create" or "complete"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error handling job data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the database for other modules if needed
export { jobDatabase };

// Handle CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}