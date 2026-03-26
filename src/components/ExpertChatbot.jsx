'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AICharacter } from './AICharacter';
import gsap from 'gsap';
import { X, Send } from 'lucide-react';
import { Button } from './ui/button';

export function ExpertChatbot({ analysis }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi! I'm your AI Interview Expert. I've analyzed your performance. Wanna talk about it?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef(null);
  const containerRef = useRef(null);
  const characterRef = useRef(null);

  // Initial wave and floating animation
  useEffect(() => {
    if (!isOpen && containerRef.current) {
      // Entrance pop-up
      gsap.fromTo(
        containerRef.current,
        { y: 150, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.5)', delay: 1 }
      );
      
      // Floating animation
      gsap.to(containerRef.current, {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2
      });
      
      // Waving animation mapping via Character container parent rotation
      if (characterRef.current) {
        gsap.to(characterRef.current, {
          rotation: 10,
          duration: 0.4,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
          delay: 2.5,
          repeatDelay: 2
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/expert-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMessage], // Include all except initial generic greeting for context, or include it
          context: {
             score: analysis?.score,
             scoreBreakdown: analysis?.scoreBreakdown,
             feedback: analysis?.feedback,
             guidance: analysis?.guidance,
          } // We explicitly minimize context to avoid breaking limits
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "Oops, I encountered an error connecting to my brain." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100 }}>
      {!isOpen && (
        <div 
          ref={containerRef}
          onClick={() => setIsOpen(true)}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            position: 'relative'
          }}
        >
          {/* Chat Bubble Tooltip */}
          <div style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            padding: '0.8rem 1.2rem',
            borderRadius: '1.2rem 1.2rem 0 1.2rem',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            color: '#020617',
            fontWeight: 800,
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            transformOrigin: 'bottom right',
            position: 'absolute',
            top: '-50px',
            right: '25px',
            zIndex: 10,
            animation: 'pulseScale 2s infinite'
          }}>
            Wanna talk to the expert?
            {/* Triangle pointer */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '8px',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #059669',
            }} />
          </div>

          <div ref={characterRef} style={{ transform: 'scale(0.8)', transformOrigin: 'bottom center', margin: '-1rem -2rem -4rem -2rem' }}>
            <AICharacter isSpeaking={false} />
          </div>
        </div>
      )}

      {isOpen && (
        <div style={{
          width: '380px',
          height: '550px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '1.5rem',
          border: '1px solid #1E293B',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2, 6, 23, 0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <div style={{ transform: 'scale(0.35)', width: '50px', height: '50px', transformOrigin: 'center left', margin: '-1.5rem -1rem' }}>
                <AICharacter isSpeaking={isLoading || messages[messages.length-1].role === 'model'} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '1.1rem' }}>AI Interview Expert</div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', animation: 'blink 1.5s infinite' }} />
                  {isLoading ? 'Typing...' : 'Online & Ready'}
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#1E293B'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                position: 'relative',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                <div style={{
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #10B981, #059669)' : '#1E293B',
                  color: msg.role === 'user' ? '#020617' : '#F8FAFC',
                  padding: '0.85rem 1.1rem',
                  borderRadius: msg.role === 'user' ? '1.2rem 1.2rem 0 1.2rem' : '1.2rem 1.2rem 1.2rem 0',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  boxShadow: msg.role === 'user' ? '0 4px 15px -3px rgba(16, 185, 129, 0.3)' : '0 4px 15px -3px rgba(0, 0, 0, 0.2)'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', borderTop: '1px solid #1E293B', background: '#020617', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask for feedback or advice..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '1rem',
                padding: '0.85rem 1rem',
                color: '#F8FAFC',
                outline: 'none',
                fontSize: '0.95rem',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#10B981'}
              onBlur={e => e.currentTarget.style.borderColor = '#334155'}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()} style={{ background: '#10B981', color: '#020617', padding: '0 1rem', height: '100%', borderRadius: '1rem' }} className="hover:scale-105 transition-transform">
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); scale: 0.95; }
          to { opacity: 1; transform: translateY(0); scale: 1; }
        }
        @keyframes pulseScale {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}} />
    </div>
  );
}
