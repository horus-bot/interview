'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

async function fetchChatReply(
geminiData,
history,
question)
{
  const systemPrompt = `You are a world-class interview analysis assistant. 
You have access to the following Gemini AI analysis data for this user's interview:
${JSON.stringify(geminiData)}
Answer user questions about their interview analysis in a concise, actionable, and friendly way.`;

  const res = await fetch('/api/groq-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: question }],

      model: 'llama-3.3-70b-versatile'
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default function ChatCoachPage() {
  const router = useRouter();
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [geminiData, setGeminiData] = useState(null);

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
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', padding: '1.5rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto', display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card style={{ overflow: 'hidden' }}>
          <CardHeader>
            <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'hsl(var(--primary))' }} /> Interview Coach Chat (Llama 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div
                style={{
                  height: '32rem',
                  overflowY: 'auto',
                  backgroundColor: 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  padding: '0.75rem'
                }}>
                
                {chatHistory.length === 0 &&
                <div style={{ color: 'hsl(var(--muted-foreground))', textAlign: 'center', padding: '2rem 1rem' }}>
                    Ask the coach anything about your interview performance.
                  </div>
                }

                {chatHistory.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          maxWidth: '80%',
                          borderRadius: '0.75rem',
                          padding: '0.75rem 1rem',
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                          boxShadow: '0 8px 16px rgba(0,0,0,0.08)',
                          backgroundColor: isUser ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                          color: isUser ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                          border: isUser ? 'none' : '1px solid hsl(var(--border))',
                          whiteSpace: 'pre-wrap'
                        }}>
                        
                        {msg.content}
                      </div>
                    </div>);

                })}

                {chatLoading &&
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
                    <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))'
                    }}>
                    
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Thinking…
                    </div>
                  </div>
                }
              </div>

              <form
                style={{ display: 'flex', gap: '0.5rem' }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleChatSend();
                }}>
                
                <input
                  type="text"
                  placeholder={geminiData ? 'Ask your interview coach…' : 'Run an analysis first (upload/interview), then come back.'}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading || !geminiData}
                  autoFocus
                  style={{
                    flex: 1,
                    borderRadius: '0.5rem',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    outline: 'none'
                  }} />
                
                <Button type="submit" disabled={chatLoading || !chatInput.trim() || !geminiData}>
                  Send
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}