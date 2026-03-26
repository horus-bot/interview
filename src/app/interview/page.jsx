'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Code2, 
  User, 
  ArrowRight, 
  ChevronLeft, 
  TerminalSquare, 
  MessageSquare,
  Sparkles,
  Cpu
} from 'lucide-react';
import { withAuth } from '@/context/auth-context';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const theme = {
  primary: '#4F46E5',    // Indigo 600
  secondary: '#10B981',  // Emerald 500
  bg: '#020617',         // Slate 950
  surface: '#0F172A',    // Slate 900
  surfaceLight: '#1E293B',// Slate 800
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8'
};

const INTERVIEW_TYPES = [
  {
    id: 'coding',
    title: 'Technical & Coding',
    description: 'Face a strict AI engineering manager. Write code, explain your time complexities, and tackle system design.',
    icon: <TerminalSquare size={40} />,
    color: theme.primary,
    href: '/interview/coding',
    badge: 'Engineering'
  },
  {
    id: 'behavioral',
    title: 'Behavioral & Leadership',
    description: 'Practice the STAR method. Answer cultural, leadership, and conflict-resolution questions with our HR AI.',
    icon: <User size={40} />,
    color: theme.secondary,
    href: '/interview/behavioral',
    badge: 'HR / Soft Skills'
  }
];

function InterviewHubPage() {
  const container = useRef(null);
  const router = useRouter();

  useGSAP(() => {
    // Staggered entry animation for the entire page
    gsap.fromTo('.anim-item', 
      { opacity: 0, y: 40 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    );
  }, { scope: container });

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    body {
      background-color: ${theme.bg};
      color: ${theme.textPrimary};
      font-family: 'Inter', sans-serif;
      margin: 0;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .nav-header {
      height: 80px;
      display: flex;
      align-items: center;
      padding: 0 2rem;
      border-bottom: 1px solid ${theme.border};
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: ${theme.textSecondary};
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: ${theme.textPrimary};
    }

    .hub-card {
      background: ${theme.surface};
      border: 1px solid ${theme.border};
      border-radius: 20px;
      padding: 2.5rem 2rem;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
    }

    .hub-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .hub-card:hover {
      transform: translateY(-8px);
      border-color: var(--card-color);
      box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px var(--card-glow);
    }
    .hub-card:hover::before { opacity: 1; }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      background: var(--icon-bg);
      color: var(--card-color);
      transition: transform 0.4s ease;
    }

    .hub-card:hover .icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }

    .card-badge {
      position: absolute;
      top: 2rem;
      right: 2rem;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: var(--icon-bg);
      color: var(--card-color);
      border: 1px solid var(--card-glow);
    }

    .btn-action {
      margin-top: auto;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 24px;
      background: var(--card-color);
      color: #020617;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      width: fit-content;
    }
    
    .hub-card:hover .btn-action {
      transform: translateX(10px);
      box-shadow: 0 0 15px var(--card-glow);
    }
  `;

  return (
    <div ref={container} style={{ minHeight: '100vh', background: theme.bg, position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* Ambient Background Blur */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}></div>

      <header className="nav-header anim-item">
         <Link href="/my-analyses" className="back-link">
            <ChevronLeft size={20} /> Return to Dashboard
         </Link>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 2rem' }}>
         
         <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div className="anim-item" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, borderRadius: '100px', color: theme.textSecondary, fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
               <Cpu size={14} /> AI SIMULATION MODULE
            </div>
            <h1 className="anim-item" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, fontFamily: 'Inter Tight', letterSpacing: '-0.03em', color: theme.textPrimary, marginBottom: '1.5rem', lineHeight: 1.1 }}>
               Select Interview <span style={{ color: theme.primary }}>Matrix</span>
            </h1>
            <p className="anim-item" style={{ fontSize: '1.25rem', color: theme.textSecondary, maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
               Our AI avatars replicate real-world tech/HR screening environments. Choose your track to begin establishing vocal, structural, and technical dominance.
            </p>
         </div>

         <div className="anim-item" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {INTERVIEW_TYPES.map(type => (
               <div 
                 key={type.id} 
                 className="hub-card"
                 onClick={() => router.push(type.href)}
                 style={{ 
                   '--card-color': type.color,
                   '--card-glow': `${type.color}40`,
                   '--icon-bg': `${type.color}15`
                 }}
               >
                  <div className="card-badge">{type.badge}</div>
                  <div className="icon-wrapper">
                     {type.icon}
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '1rem', color: theme.textPrimary }}>
                     {type.title}
                  </h2>
                  <p style={{ fontSize: '1.1rem', color: theme.textSecondary, lineHeight: 1.6, marginBottom: '3rem' }}>
                     {type.description}
                  </p>
                  <button className="btn-action">
                     Initiate Protocol <ArrowRight size={18} />
                  </button>
               </div>
            ))}
         </div>

      </main>
    </div>
  );
}

export default withAuth(InterviewHubPage);