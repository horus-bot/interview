import React, { useEffect, useState } from 'react';

interface AICharacterProps {
  isSpeaking: boolean;
}

export function AICharacter({ isSpeaking }: AICharacterProps) {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking) {
      interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, Math.random() * 100 + 100); // 100-200ms random toggle for talking effect
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const floatAnimation = `
    @keyframes inline-float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
      100% { transform: translateY(0px); }
    }
    @keyframes inline-pulse {
      0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
      70% { box-shadow: 0 0 0 15px rgba(79, 70, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
    }
  `;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0' }}>
      <style>{floatAnimation}</style>
      <div 
        style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
          animation: 'inline-float 3s ease-in-out infinite',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...(isSpeaking ? { animation: 'inline-float 3s ease-in-out infinite, inline-pulse 1.5s infinite' } : {})
        }}
      >
        {/* Robot Head outline */}
        <div style={{ 
            position: 'relative', 
            width: '65px', 
            height: '55px', 
            backgroundColor: '#ffffff', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 2,
            boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.1)'
        }}>
          {/* Eyes */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <div style={{ 
                width: '12px', 
                height: isSpeaking ? '14px' : '12px', 
                backgroundColor: '#312e81', 
                borderRadius: '50%', 
                transition: 'all 0.2s',
                transform: isSpeaking ? 'scale(1.1)' : 'scale(1)'
            }}></div>
            <div style={{ 
                width: '12px', 
                height: isSpeaking ? '14px' : '12px', 
                backgroundColor: '#312e81', 
                borderRadius: '50%', 
                transition: 'all 0.2s',
                transform: isSpeaking ? 'scale(1.1)' : 'scale(1)'
            }}></div>
          </div>
          {/* Mouth */}
          <div 
            style={{
              width: mouthOpen ? '20px' : '10px',
              height: mouthOpen ? '8px' : '3px',
              backgroundColor: '#312e81',
              borderRadius: mouthOpen ? '6px' : '2px',
              transition: 'all 0.1s ease-in-out'
            }}
          ></div>
        </div>
        
        {/* Antennas */}
        <div style={{ position: 'absolute', top: '-10px', left: '20%', width: '3px', height: '15px', backgroundColor: '#a5b4fc', borderRadius: '2px' }}>
          <div style={{ position: 'absolute', top: '-5px', left: '-2.5px', width: '8px', height: '8px', backgroundColor: isSpeaking ? '#f59e0b' : '#c7d2fe', borderRadius: '50%', transition: 'background-color 0.3s', boxShadow: isSpeaking ? '0 0 5px #f59e0b' : 'none' }}></div>
        </div>
        <div style={{ position: 'absolute', top: '-10px', right: '20%', width: '3px', height: '15px', backgroundColor: '#a5b4fc', borderRadius: '2px' }}>
          <div style={{ position: 'absolute', top: '-5px', left: '-2.5px', width: '8px', height: '8px', backgroundColor: isSpeaking ? '#f59e0b' : '#c7d2fe', borderRadius: '50%', transition: 'background-color 0.3s', boxShadow: isSpeaking ? '0 0 5px #f59e0b' : 'none' }}></div>
        </div>
      </div>
    </div>
  );
}
