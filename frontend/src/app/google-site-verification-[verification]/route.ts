import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ verification?: string }> }
) {
  const { verification } = await params;
  
  if (!verification) {
    return new NextResponse('Verification parameter required', { status: 400 });
  }
  
  // Return the verification content that Google expects
  const verificationContent = `google-site-verification: google-site-verification-${verification}.html`;
  
  return new NextResponse(verificationContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
