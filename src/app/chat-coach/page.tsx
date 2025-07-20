'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

async function fetchChatReply(
  geminiData: any,
  history: { role: string; content: string }[],
  question: string
) {
  const systemPrompt = `You are a world-class interview analysis assistant. 
You have access to the following Gemini AI analysis data for this user's interview:
${JSON.stringify(geminiData)}
Answer user questions about their interview analysis in a concise, actionable, and friendly way.`;

  const res = await fetch('/api/groq-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: question },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default function ChatCoachPage() {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [geminiData, setGeminiData] = useState<any>(null);

  useEffect(() => {
    // Load Gemini analysis from sessionStorage (or wherever you store it)
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      setGeminiData(JSON.parse(stored));
    }
  }, []);

  const handleChatSend = async () => {
    if (!chatInput.trim() || !geminiData) return;
    setChatLoading(true);
    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    const reply = await fetchChatReply(geminiData, newHistory, chatInput);
    setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
    setChatInput('');
    setChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-pink-500" /> Interview Coach Chat (Llama 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 h-[32rem]">
              <div className="flex-1 overflow-y-auto bg-muted rounded p-3 mb-2" style={{ minHeight: '14rem', maxHeight: '20rem' }}>
                {chatHistory.length === 0 && (
                  <div className="text-muted-foreground text-center mt-8">Ask the coach anything about your interview performance!</div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] text-sm shadow ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-card border text-foreground'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="rounded-lg px-4 py-2 bg-card border text-foreground max-w-[80%] text-sm shadow flex items-center gap-2">
                      <Loader2 className="animate-spin h-4 w-4 mr-2 text-primary" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <form className="flex gap-2 mt-auto" onSubmit={e => { e.preventDefault(); handleChatSend(); }}>
                <input
                  className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder="Ask your interview coach..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  autoFocus
                />
                <Button type="submit" disabled={chatLoading || !chatInput.trim() || !geminiData} className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow">
                  Send
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
