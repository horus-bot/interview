'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ArrowRight, Bot, Building2, User, BarChart3, Presentation, Users, Briefcase, Sparkles, CheckCircle2, LayoutDashboard, Play } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const theme = {
  primary: '#4338CA',    // Indigo 700
  primaryHover: '#3730A3', // Indigo 800
  secondary: '#10B981',  // Emerald 500
  bg: '#0F172A',         // Slate 900
  surface: '#1E293B',    // Slate 800
  surfaceLight: '#334155', // Slate 700
  border: '#334155',     // Slate 700
  textPrimary: '#F8FAFC',// Slate 50
  textSecondary: '#94A3B8',// Slate 400
  accent: '#3B82F6'      // Blue 500
};

const SplitTextHelper = ({ text, className, wordClass }) => {
  const words = text.split(' ');
  return (
    <span className={className} style={{ display: 'inline-block' }}>
      {words.map((word, i) => (
        <span key={i} className={`split-word ${wordClass || ''}`} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
          {word.split('').map((char, j) => (
            <span key={j} className="split-char" style={{ display: 'inline-block' }}>{char}</span>
          ))}
          {i !== words.length - 1 && <span style={{ display: 'inline-block' }}>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
};

export default function Home() {
  const container = useRef(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useGSAP(() => {
    // Hero Timeline
    const tl = gsap.timeline();
    tl.fromTo('.badge-pill', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo('.split-char', 
      { opacity: 0, y: 30, rotateX: -60 }, 
      { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.015, ease: 'power3.out', transformOrigin: "0% 50% -50" },
      '-=0.4'
    )
    .fromTo('.hero-subtext',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.hero-ctas',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo('.hero-ui-mockup',
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.2'
    );

    // Mockup internals
    gsap.fromTo('.mock-item', 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 1, ease: 'power2.out' }
    );
    gsap.fromTo('.mock-bar',
      { width: '0%' },
      { width: (i, el) => el.getAttribute('data-width'), duration: 1.2, stagger: 0.15, delay: 1.5, ease: 'power3.out' }
    );
    gsap.to('.mock-wave', {
      scaleY: () => gsap.utils.random(0.3, 1),
      duration: 0.2,
      repeat: -1,
      yoyo: true,
      stagger: 0.05,
      ease: 'power1.inOut',
      transformOrigin: 'bottom'
    });
    
    // Counting score
    const scoreObj = { val: 0 };
    gsap.to(scoreObj, {
      val: 92,
      duration: 2,
      delay: 1.2,
      ease: 'power3.out',
      onUpdate: () => {
        const el = document.querySelector('.mock-score');
        if(el) el.innerText = Math.round(scoreObj.val) + '%';
      }
    });

    // Marquee
    gsap.to('.trust-marquee', {
      xPercent: -50,
      ease: 'none',
      duration: 40,
      repeat: -1
    });

    // Scroll Sections
    const sections = gsap.utils.toArray('.scroll-section');
    sections.forEach((sec) => {
      const isReverse = sec.classList.contains('reverse-layout');
      const content = sec.querySelector('.scroll-content');
      const visual = sec.querySelector('.scroll-visual');
      
      const stl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top 75%',
        }
      });

      stl.fromTo(visual,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )
      .fromTo(content,
        { opacity: 0, x: isReverse ? -40 : 40 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      );
    });
  }, { scope: container });

  const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

    body {
      background-color: ${theme.bg};
      color: ${theme.textPrimary};
      font-family: 'Inter', sans-serif;
      margin: 0;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, h4 {
      font-family: 'Inter Tight', sans-serif;
    }

    .bg-grid {
      position: absolute;
      inset: 0;
      z-index: -10;
      background-image: 
        linear-gradient(to right, ${theme.border} 1px, transparent 1px),
        linear-gradient(to bottom, ${theme.border} 1px, transparent 1px);
      background-size: 4rem 4rem;
      mask-image: linear-gradient(to bottom, black 30%, transparent 80%);
      -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 80%);
      opacity: 0.4;
      pointer-events: none;
    }

    .navbar-container {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      padding: 1rem 2rem;
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid ${theme.border};
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-btn {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: ${theme.textPrimary};
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
    }
    .btn-ghost:hover { background: ${theme.surface}; border-color: ${theme.border}; }

    .nav-cta {
      background: ${theme.textPrimary};
      color: ${theme.bg};
      border: none;
    }
    .nav-cta:hover { background: #e2e8f0; transform: translateY(-1px); }

    .btn-solid-primary {
      background: ${theme.primary};
      color: white;
    }
    .btn-solid-primary:hover {
      background: ${theme.primaryHover};
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(67, 56, 202, 0.4);
    }

    .btn-solid-secondary {
      background: ${theme.surface};
      color: ${theme.textPrimary};
      border: 1px solid ${theme.border};
    }
    .btn-solid-secondary:hover {
      background: ${theme.surfaceLight};
      border-color: #475569;
      transform: translateY(-2px);
    }

    .marquee-wrapper {
      overflow: hidden;
      white-space: nowrap;
      position: relative;
      padding: 2.5rem 0;
      border-top: 1px solid ${theme.border};
      border-bottom: 1px solid ${theme.border};
      background: ${theme.surface};
    }
    .trust-marquee {
      display: inline-flex;
      gap: 5rem;
      align-items: center;
      width: max-content;
    }

    .ui-shadow {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px ${theme.border};
    }
  `;

  return (
    <div ref={container} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <header className="navbar-container">
        <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: theme.textPrimary }}>
            <div style={{ background: theme.primary, padding: '6px', borderRadius: '8px', display: 'flex' }}>
               <LayoutDashboard size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Inter Tight, sans-serif' }}>InterviewInsights</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? null : user ? (
              <>
                <button onClick={() => router.push('/my-analyses')} className="nav-btn btn-ghost">Dashboard</button>
                <button onClick={() => router.push('/logout')} className="nav-btn btn-ghost" style={{ border: `1px solid ${theme.border}` }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-btn btn-ghost">Sign In</Link>
                <Link href="/signup" className="nav-btn nav-cta" style={{ marginLeft: '0.5rem' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flexGrow: 1 }}>
        <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '140px', paddingBottom: '4rem' }}>
          <div className="bg-grid"></div>
          
          {/* MASSIVE HERO */}
          <div style={{ padding: '0 2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ textAlign: 'center', maxWidth: '950px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
              <div className="badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(67, 56, 202, 0.1)', border: `1px solid rgba(67, 56, 202, 0.4)`, color: '#818cf8', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
                <Building2 size={16} /> B2B & B2C AI Interview Infrastructure
              </div>
              
              <h1 style={{ fontSize: 'clamp(3.5rem, 6.5vw, 6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1.5rem', color: theme.textPrimary }}>
                 <span style={{ display: 'block' }}><SplitTextHelper className="hero-headline" text="The Intelligent Way" /></span>
                 <span style={{ display: 'block', color: '#818cf8' }}><SplitTextHelper className="hero-headline" text="To Interview." /></span>
              </h1>
              <p className="hero-subtext" style={{ fontSize: '1.25rem', color: theme.textSecondary, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto 3rem', fontWeight: 400 }}>
                The unified AI platform where high-growth companies scale their screening with automated technical interviews, and ambitious candidates master their delivery to secure offers.
              </p>
              
              <div className="hero-ctas" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/signup?type=company" className="btn-solid-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 600, fontSize: '1.125rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                   For Companies <ArrowRight size={20} />
                </Link>
                <Link href="/my-analyses" className="btn-solid-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 600, fontSize: '1.125rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                   For Candidates
                </Link>
              </div>
            </div>

            {/* HIGH-END ANIMATED UI MOCKUP */}
            <div className="hero-ui-mockup ui-shadow" style={{ 
              width: '100%', maxWidth: '1000px', margin: '5rem auto 0', 
              background: theme.bg, position: 'relative',
              borderRadius: '12px', zIndex: 5
            }}>
              <div style={{ background: theme.surface, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Mock Menu Bar */}
                <div style={{ height: '48px', background: theme.surfaceLight, display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '8px', borderBottom: `1px solid ${theme.border}` }}>
                   <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
                   <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                   <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
                   <div style={{ borderLeft: `1px solid ${theme.border}`, height: '24px', margin: '0 1rem' }}></div>
                   <div style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LayoutDashboard size={14} /> Evaluation Dashboard
                   </div>
                </div>
                
                <div style={{ display: 'flex', minHeight: '450px' }}>
                   {/* Mock Sidebar */}
                   <div style={{ width: '220px', borderRight: `1px solid ${theme.border}`, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: theme.textSecondary, fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Interview Stages</div>
                      <div className="mock-item" style={{ height: '36px', background: theme.surfaceLight, borderRadius: '6px', width: '100%', display: 'flex', alignItems: 'center', padding: '0 12px', border: `1px solid #4338CA` }}>
                         <span style={{ width: '8px', height: '8px', background: '#818cf8', borderRadius: '50%', marginRight: '10px' }}></span>
                         <span style={{ fontSize: '0.875rem', color: theme.textPrimary, fontWeight: 500 }}>Technical Q&A</span>
                      </div>
                      <div className="mock-item" style={{ height: '36px', borderRadius: '6px', width: '100%', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                         <span style={{ width: '8px', height: '8px', background: theme.textSecondary, borderRadius: '50%', marginRight: '10px' }}></span>
                         <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>System Design</span>
                      </div>
                      <div className="mock-item" style={{ height: '36px', borderRadius: '6px', width: '100%', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                         <span style={{ width: '8px', height: '8px', background: theme.textSecondary, borderRadius: '50%', marginRight: '10px' }}></span>
                         <span style={{ fontSize: '0.875rem', color: theme.textSecondary }}>Behavioral</span>
                      </div>
                   </div>
                   
                   {/* Mock Main Content */}
                   <div style={{ flex: 1, padding: '2rem', display: 'flex', gap: '2rem' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Candidate: Alex Johnson</h3>
                              <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginTop: '4px' }}>Role: Senior Frontend Engineer</div>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: theme.secondary, padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid rgba(16, 185, 129, 0.3)` }}>
                               <Bot size={14} /> Tracking Analytics
                            </div>
                         </div>
                         
                         <div className="ui-shadow" style={{ flex: 1, background: theme.bg, borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: `1px solid ${theme.border}` }}>
                            <div className="mock-item" style={{ background: theme.surfaceLight, padding: '1rem', borderRadius: '8px', width: '90%', border: `1px solid ${theme.border}` }}>
                               <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginBottom: '8px', fontWeight: 600 }}>AI Interviewer</div>
                               <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>"Explain how you would optimize a React application that experiences severe performance degradation due to heavy re-renders in a large data table."</div>
                            </div>
                            <div className="mock-item" style={{ background: theme.primary, padding: '1rem', borderRadius: '8px', width: '90%', alignSelf: 'flex-end', boxShadow: '0 10px 15px -3px rgba(67, 56, 202, 0.3)' }}>
                               <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 600 }}>Alex (Candidate)</div>
                               <div style={{ fontSize: '0.875rem', lineHeight: 1.5, color: '#fff' }}>"I would implement row virtualization using a library like React Window. Additionally, I'd apply useMemo for heavy calculations..."</div>
                            </div>
                            
                            <div style={{ marginTop: 'auto', display: 'flex', gap: '4px', height: '40px', alignItems: 'flex-end', borderTop: `1px solid ${theme.surfaceLight}`, paddingTop: '1.5rem' }}>
                               {[...Array(38)].map((_, i) => <div key={i} className="mock-wave" style={{ flex: 1, background: '#818cf8', borderRadius: '2px' }}></div>)}
                            </div>
                         </div>
                      </div>
                      
                      {/* Mock Stats */}
                      <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                         <div className="mock-item ui-shadow" style={{ background: theme.surfaceLight, padding: '1.5rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem', fontWeight: 600 }}>Global Technical Score</div>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#818cf8', fontFamily: 'Inter Tight', lineHeight: 1, textShadow: '0 0 20px rgba(67, 56, 202, 0.5)' }} className="mock-score">0%</div>
                         </div>
                         
                         <div className="mock-item ui-shadow" style={{ flex: 1, background: theme.surfaceLight, padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '0.5rem', fontWeight: 600 }}>Evaluation Matrix</div>
                            {[
                               { label: 'React.js Mastery', val: '95%' },
                               { label: 'Architecture', val: '80%' },
                               { label: 'Clarity', val: '88%' },
                               { label: 'Confidence', val: '92%' }
                            ].map((item, i) => (
                               <div key={i}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', fontWeight: 500 }}>
                                    <span>{item.label}</span>
                                    <span style={{ color: theme.textSecondary }}>{item.val}</span>
                                  </div>
                                  <div style={{ height: '6px', background: theme.bg, borderRadius: '3px', overflow: 'hidden' }}>
                                     <div className="mock-bar" data-width={item.val} style={{ height: '100%', background: theme.primaryHover, borderRadius: '3px' }}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST SECTION */}
        <section style={{ paddingBottom: '4rem' }}>
          <p style={{ textAlign: 'center', color: theme.textSecondary, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', fontWeight: 700 }}>
            Trusted by Engineering Teams & Thousands of Candidates
          </p>
          <div className="marquee-wrapper">
            <div className="trust-marquee">
               {[...Array(3)].map((_, j) => (
                 <div key={j} style={{ display: 'flex', gap: '6rem', alignItems: 'center' }}>
                    {['Stripe', 'Rippling', 'Vercel', 'Linear', 'OpenAI', 'Ramp', 'Notion', 'Scale'].map((company, i) => (
                      <span key={i} style={{ fontSize: '1.75rem', fontWeight: 800, color: theme.textSecondary, opacity: 0.5, fontFamily: 'Inter Tight' }}>{company}</span>
                    ))}
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* B2B SECTION */}
        <section className="scroll-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '5rem', alignItems: 'center', padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="scroll-content">
            <div style={{ color: theme.primary, fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
              <Building2 size={18} /> FOR STARTUPS & ENTERPRISES
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              Scale your screening. Reclaim engineering hours.
            </h2>
            <p style={{ fontSize: '1.125rem', color: theme.textSecondary, marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Stop wasting hundreds of hours on first-round technical screens. Deploy our AI interviewer to assess coding logic, architectural knowledge, and communication skills precisely and consistently.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                'Standardized, totally unbiased scoring rubrics.',
                'AI asks dynamic technical follow-ups based on responses.',
                'Instantly identifies high-signal vs low-signal candidates.'
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: theme.textPrimary, fontWeight: 500 }}>
                  <CheckCircle2 size={20} color={theme.primary} style={{ flexShrink: 0, marginTop: '2px' }} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="scroll-visual ui-shadow" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '2rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '1rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Final Recommendation</span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: theme.secondary, padding: '6px 16px', borderRadius: '6px', fontWeight: 700 }}>Strong Proceed</span>
               </div>
               <div style={{ background: theme.bg, padding: '1.5rem', borderRadius: '8px', border: `1px solid ${theme.surfaceLight}` }}>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '8px', fontWeight: 600 }}>Executive Abstract:</div>
                  <div style={{ fontWeight: 500, marginBottom: '1.5rem', lineHeight: 1.6, color: theme.textPrimary }}>"The candidate demonstrated exceptional knowledge of React internals. They accurately described the reconciliation process and proactively suggested optimization techniques."</div>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary, marginBottom: '8px', fontWeight: 600 }}>Core Competencies Detected:</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                     {['System Architecture', 'React Internals', 'Communication', 'Performance'].map(tag => (
                       <span key={tag} style={{ background: theme.surfaceLight, border: `1px solid ${theme.border}`, padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{tag}</span>
                     ))}
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* B2C SECTION */}
        <section className="scroll-section reverse-layout" style={{ background: theme.surface, borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '5rem', alignItems: 'center', padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="scroll-visual ui-shadow" style={{ background: theme.surfaceLight, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '3rem 2rem', order: typeof window !== 'undefined' && window.innerWidth <= 768 ? 2 : 1 }}>
               <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', border: `2px solid ${theme.accent}`, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem', color: theme.accent, boxShadow: `0 0 30px rgba(59, 130, 246, 0.2)` }}>
                     <Bot size={40} />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'Inter Tight', color: theme.textPrimary }}>"Tell me about a time you had to pivot a project mid-way."</div>
               </div>
               <div style={{ height: '80px', background: theme.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: `1px solid ${theme.border}`, overflow: 'hidden', padding: '0 2rem' }}>
                  {[...Array(30)].map((_, i) => <div key={i} className="mock-wave" style={{ width: '4px', height: `${Math.abs(Math.sin(i * 1.5)) * 60 + 10}px`, background: theme.accent, borderRadius: '2px' }}></div>)}
               </div>
            </div>
            <div className="scroll-content" style={{ order: 2 }}>
              <div style={{ color: theme.accent, fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                <User size={18} /> FOR CANDIDATES (PRACTICE)
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                Master your pitch before the real event.
              </h2>
              <p style={{ fontSize: '1.125rem', color: theme.textSecondary, marginBottom: '2.5rem', lineHeight: 1.6 }}>
                Nervous about your upcoming interview? Our AI simulates real interviews tailored to your target company and role. Get comfortable speaking under pressure, receive brutal but productive feedback.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'Immersive, conversational AI that adapts intelligently.',
                  'Live feedback on pacing, tone, and confidence.',
                  'Targeted exercises to permanently eliminate filler words.'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: theme.textPrimary, fontWeight: 500 }}>
                    <CheckCircle2 size={20} color={theme.accent} style={{ flexShrink: 0, marginTop: '2px' }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section style={{ padding: '8rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.2, fontFamily: 'Inter Tight' }}>
            Transform the way you interview today.
          </h2>
          <p style={{ fontSize: '1.25rem', color: theme.textSecondary, marginBottom: '3rem' }}>
            Join the agile startups and smart candidates making data-driven decisions.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
             <Link href="/signup?type=company" className="btn-solid-primary" style={{ padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.125rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Get Started for Business <ArrowRight size={20} />
             </Link>
             <Link href="/my-analyses" className="btn-solid-secondary" style={{ padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.125rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Start Practicing Free
             </Link>
          </div>
        </section>


      </main>
      
      <footer style={{ background: theme.surface, textAlign: 'center', padding: '3rem 2rem', color: theme.textSecondary, fontSize: '0.875rem', borderTop: `1px solid ${theme.border}` }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.textPrimary, fontWeight: 600 }}>
               <LayoutDashboard size={18} color={theme.primary} /> InterviewInsights
            </div>
            <div>&copy; 2026 InterviewInsights. All rights reserved.</div>
         </div>
      </footer>
    </div>
  );
}