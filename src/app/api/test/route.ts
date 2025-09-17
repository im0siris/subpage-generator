import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint works!' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'POST received successfully',
      data: body
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to parse JSON',
      details: String(error)
    }, { status: 400 });
  }
}