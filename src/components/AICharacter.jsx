import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function AICharacter({ isSpeaking }) {
  const containerRef = useRef(null);
  const coreRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const innerHeadRef = useRef(null);

  useEffect(() => {
    // Continuous hover animation
    gsap.to(containerRef.current, {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    if (isSpeaking) {
      // Speaking animations: Pulse rings and shift colors
      gsap.to(ring1Ref.current, {
        scale: 1.4,
        opacity: 0,
        duration: 1.2,
        repeat: -1,
        ease: 'power1.out'
      });
      gsap.to(ring2Ref.current, {
        scale: 1.8,
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
        repeat: -1,
        ease: 'power1.out'
      });
      gsap.to(coreRef.current, {
        boxShadow: '0 0 40px #10B981, inset 0 0 20px #10B981',
        borderColor: '#10B981',
        duration: 0.5,
        repeat: -1,
        yoyo: true
      });
      gsap.to(innerHeadRef.current, {
        scale: 1.1,
        duration: 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'bounce.out'
      });
    } else {
      // Idle animations
      gsap.killTweensOf([ring1Ref.current, ring2Ref.current, coreRef.current, innerHeadRef.current]);
      
      gsap.to([ring1Ref.current, ring2Ref.current], {
        scale: 1,
        opacity: 0.2,
        duration: 0.5
      });
      gsap.to(coreRef.current, {
        boxShadow: '0 0 15px #4F46E5, inset 0 0 15px #4F46E5',
        borderColor: '#4F46E5',
        duration: 1
      });
      gsap.to(innerHeadRef.current, {
        scale: 1,
        duration: 0.5
      });
    }
  }, [isSpeaking]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '2rem 0', perspective: '1000px' }}>
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Animated Audio Rings */}
        <div ref={ring1Ref} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #10B981', opacity: 0.2 }}></div>
        <div ref={ring2Ref} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #10B981', opacity: 0.2 }}></div>

        {/* Core Glowing Orb */}
        <div 
          ref={coreRef}
          style={{
            position: 'absolute',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(2,6,23,1) 100%)',
            border: '2px solid #4F46E5',
            boxShadow: '0 0 15px #4F46E5, inset 0 0 15px #4F46E5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Inner Abstract Hologram representing Voice */}
          <div 
            ref={innerHeadRef}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: isSpeaking ? 'linear-gradient(45deg, #10B981, #34D399)' : 'linear-gradient(45deg, #4F46E5, #818CF8)',
              filter: 'blur(4px)',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          ></div>

          {/* Eye elements overlay */}
          <div style={{ position: 'absolute', display: 'flex', gap: '15px', zIndex: 10 }}>
             <div style={{ width: '12px', height: isSpeaking ? '4px' : '12px', background: '#F8FAFC', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 0 10px #ffffff' }}></div>
             <div style={{ width: '12px', height: isSpeaking ? '4px' : '12px', background: '#F8FAFC', borderRadius: '50%', transition: 'all 0.2s', boxShadow: '0 0 10px #ffffff' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}