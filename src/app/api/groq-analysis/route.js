import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, prompt, model = 'llama-3.3-70b-versatile', maxTokens = 2000 } = await request.json();

    const messages = [
    {
      role: 'system',
      content: prompt || 'Analyze the following text and provide insights.'
    },
    {
      role: 'user',
      content: text
    }];


    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model,
        temperature: 0.4,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Groq analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}