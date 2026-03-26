import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { messages, context } = await request.json();
    
    const formattedContext = `
You are an expert interview coach. Below is the summary of the user's interview analysis. 
Use this context to provide personalized, constructive feedback. Be encouraging but precise.
Keep responses concise unless asked for a detailed breakdown.

Interview Analysis Context:
${JSON.stringify(context, null, 2)}
    `;

    // Convert to Gemini format
    const contents = [
      {
        role: 'user',
        parts: [{ text: formattedContext }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I will act as the interview expert and use this context to help the user." }]
      }
    ];

    messages.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    
    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error('Error in Expert chat API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
