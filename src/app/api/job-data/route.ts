// src/app/api/job-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      .eq('job_id', jobId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'Job not found or still processing...',
      });
    }

    // Return array of results
    return NextResponse.json({
      success: true,
      data: data.map((row) => ({
        job_id: row.job_id,
        domain: row.domain,
        status: row.status,
        content: row.generated_html,
        city: row.cities?.name ?? null,
        cities: Array.isArray(row.cities)
          ? row.cities
          : row.cities?.name
          ? [row.cities]
          : [],
      })),
    });
  } catch (err) {
    console.error('Error fetching job data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}