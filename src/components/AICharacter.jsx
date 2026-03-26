import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export function AICharacter({ isSpeaking }) {
  const containerRef = useRef(null);
  const coreRef = useRef(null);
  const outerRingRef = useRef(null);
  const middleRingRef = useRef(null);
  const innerRingRef = useRef(null);
  const eyesContainerRef = useRef(null);
  const eyeLeftRef = useRef(null);
  const eyeRightRef = useRef(null);
  const mouthRef = useRef(null);

  useEffect(() => {
    // Floating hover animation
    gsap.to(containerRef.current, {
      y: -15,
      rotationX: 5,
      rotationY: -5,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    // Continuous smooth spinning for the 3D rings
    gsap.to(outerRingRef.current, { rotationZ: 360, rotationX: 360, duration: 20, repeat: -1, ease: 'linear' });
    gsap.to(middleRingRef.current, { rotationZ: -360, rotationY: 360, duration: 15, repeat: -1, ease: 'linear' });
    gsap.to(innerRingRef.current, { rotationZ: 360, rotationX: -360, duration: 10, repeat: -1, ease: 'linear' });

    // Periodic organic eye blinking
    const blinkTl = gsap.timeline({ repeat: -1, repeatDelay: 4 });
    blinkTl.to([eyeLeftRef.current, eyeRightRef.current], { scaleY: 0.1, duration: 0.1, ease: 'power2.in' })
           .to([eyeLeftRef.current, eyeRightRef.current], { scaleY: 1, duration: 0.1, ease: 'power2.out' })
           .to([eyeLeftRef.current, eyeRightRef.current], { scaleY: 0.1, duration: 0.1, ease: 'power2.in', delay: 0.1 })
           .to([eyeLeftRef.current, eyeRightRef.current], { scaleY: 1, duration: 0.1, ease: 'power2.out' });

    // Eye looking around
    const lookTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    lookTl.to(eyesContainerRef.current, { x: 8, duration: 0.5, ease: 'power2.inOut', delay: 2 })
          .to(eyesContainerRef.current, { x: -8, duration: 0.5, ease: 'power2.inOut', delay: 2 })
          .to(eyesContainerRef.current, { x: 0, duration: 0.5, ease: 'power2.inOut', delay: 1 });

  }, []);

  useEffect(() => {
    if (isSpeaking) {
      // High energy speaking state
      gsap.to(coreRef.current, {
        boxShadow: '0 0 50px rgba(16, 185, 129, 0.8), inset 0 0 30px rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      
      gsap.to([outerRingRef.current, middleRingRef.current, innerRingRef.current], {
        borderColor: 'rgba(16, 185, 129, 0.6)',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
        duration: 0.5
      });

      // Eyes get slightly excited
      gsap.to([eyeLeftRef.current, eyeRightRef.current], {
        scaleY: 1.1,
        scaleX: 1.1,
        backgroundColor: '#10B981',
        boxShadow: '0 0 15px #10B981',
        duration: 0.3
      });

      // Mouth talking animation
      if (mouthRef.current) {
        gsap.killTweensOf(mouthRef.current);
        gsap.to(mouthRef.current, {
          height: () => 14 + Math.random() * 12 + 'px',
          width: () => 20 + Math.random() * 8 + 'px',
          borderRadius: '12px 12px 24px 24px',
          backgroundColor: '#10B981',
          boxShadow: '0 0 15px #10B981',
          duration: 0.15,
          repeat: -1,
          yoyo: true,
          ease: 'power2.inOut'
        });
      }

    } else {
      // Calm idle state
      gsap.to(coreRef.current, {
        boxShadow: '0 0 20px rgba(79, 70, 229, 0.5), inset 0 0 20px rgba(79, 70, 229, 0.5)',
        borderColor: '#4F46E5',
        duration: 1,
        ease: 'power2.out'
      });

      gsap.to([outerRingRef.current, middleRingRef.current, innerRingRef.current], {
        borderColor: 'rgba(79, 70, 229, 0.3)',
        boxShadow: '0 0 10px rgba(79, 70, 229, 0.1)',
        duration: 1
      });

      // Normal cute eyes
      gsap.to([eyeLeftRef.current, eyeRightRef.current], {
        scaleY: 1,
        scaleX: 1,
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#F8FAFC',
        boxShadow: '0 0 10px #ffffff',
        duration: 0.5
      });

      // Cute smile idle
      if (mouthRef.current) {
        gsap.killTweensOf(mouthRef.current);
        gsap.to(mouthRef.current, {
          height: '12px',
          width: '24px',
          borderRadius: '0 0 24px 24px',
          backgroundColor: '#F8FAFC',
          boxShadow: '0 0 10px #ffffff',
          duration: 0.5,
          ease: 'power2.out'
        });
      }
    }
  }, [isSpeaking]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '3rem 0', perspective: '1200px' }}>
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          width: '160px',
          height: '160px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Orbital Rings for High-Tech Feel */}
        <div 
          ref={outerRingRef} 
          style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', border: '2px dashed rgba(79, 70, 229, 0.3)', transformStyle: 'preserve-3d' }} 
        />
        <div 
          ref={middleRingRef} 
          style={{ position: 'absolute', inset: '-5px', borderRadius: '50%', border: '2px solid rgba(79, 70, 229, 0.2)', borderTopColor: 'transparent', borderBottomColor: 'transparent', transformStyle: 'preserve-3d' }} 
        />
        <div 
          ref={innerRingRef} 
          style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '1px solid rgba(79, 70, 229, 0.4)', borderRightColor: 'transparent', borderLeftColor: 'transparent', transformStyle: 'preserve-3d' }} 
        />

        {/* Core Glowing Orb */}
        <div 
          ref={coreRef}
          style={{
            position: 'absolute',
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(30, 41, 59, 0.9) 0%, rgba(2, 6, 23, 1) 100%)',
            border: '2px solid #4F46E5',
            boxShadow: '0 0 20px rgba(79, 70, 229, 0.5), inset 0 0 20px rgba(79, 70, 229, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          {/* Eyes and Cheeks Container */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20, marginBottom: '8px' }}>
            <div ref={eyesContainerRef} style={{ display: 'flex', gap: '22px', zIndex: 20 }}>
               <div ref={eyeLeftRef} style={{ width: '16px', height: '16px', background: '#F8FAFC', borderRadius: '50%', boxShadow: '0 0 10px #ffffff' }}></div>
               <div ref={eyeRightRef} style={{ width: '16px', height: '16px', background: '#F8FAFC', borderRadius: '50%', boxShadow: '0 0 10px #ffffff' }}></div>
            </div>
            
            {/* Cute Blush Under Eyes */}
            <div style={{ display: 'flex', gap: '30px', position: 'absolute', top: '14px', zIndex: 15, opacity: 0.5 }}>
               <div style={{ width: '12px', height: '6px', background: '#F43F5E', filter: 'blur(2px)', borderRadius: '50%' }}></div>
               <div style={{ width: '12px', height: '6px', background: '#F43F5E', filter: 'blur(2px)', borderRadius: '50%' }}></div>
            </div>
          </div>

          {/* Cute Animated Mouth */}
          <div 
            ref={mouthRef} 
            style={{ 
              width: '24px', 
              height: '12px', 
              backgroundColor: '#F8FAFC', 
              borderRadius: '0 0 24px 24px',
              zIndex: 20,
              boxShadow: '0 0 10px #ffffff',
            }}
          />

          {/* Subtle Inner Glow Element */}
          <div style={{ position: 'absolute', bottom: '-20px', width: '80%', height: '40%', background: isSpeaking ? 'rgba(16, 185, 129, 0.2)' : 'rgba(79, 70, 229, 0.2)', filter: 'blur(10px)', borderRadius: '50%', transition: 'background 0.5s' }} />
        </div>
      </div>
    </div>
  );
}