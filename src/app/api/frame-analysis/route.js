import { NextResponse } from 'next/server';

const LLAVA_ANALYSIS_API_URL = process.env.LLAVA_ANALYSIS_API_URL || 'http://127.0.0.1:8000/analyze';

function dataUriToBlob(frameDataUri) {
  if (!frameDataUri || typeof frameDataUri !== 'string') {
    throw new Error('Missing frameDataUri');
  }

  const parts = frameDataUri.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid frame data format');
  }

  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';
  const binary = Buffer.from(parts[1], 'base64');
  return new Blob([binary], { type: mimeType });
}

export async function POST(request) {
  try {
    const { frameDataUri, questionIndex = 0, trigger = 'runtime' } = await request.json();
    const imageBlob = dataUriToBlob(frameDataUri);

    const formData = new FormData();
    formData.append('file', imageBlob, `frame-q${questionIndex + 1}.jpg`);

    const response = await fetch(LLAVA_ANALYSIS_API_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Frame analysis API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      analysis: data?.analysis || 'No analysis returned from frame model.',
      questionIndex,
      trigger,
      respondedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Frame analysis route failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Frame analysis failed' },
      { status: 500 }
    );
  }
}
