// src/app/api/job-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('job_id, domain, status, generated_html, cities')
      .eq('job_id', jobId)
      .single();

    if (error && error.code === 'PGRST116') {
      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'Job not found or still processing...',
      });
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        job_id: data.job_id,
        domain: data.domain,
        status: data.status,
        content: data.generated_html,
        // 👇 city is extracted from your JSON "cities" column
        city: data.cities?.name ?? null,
      },
    });
  } catch (err) {
    console.error('Error fetching job data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}