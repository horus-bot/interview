'use client';

import { useRef, useEffect } from 'react';
import { withAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  Play, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  LayoutDashboard, 
  ArrowRight, 
  Bot,
  User,
  Settings,
  Bell,
  Search,
  BookOpen,
  GraduationCap,
  BrainCircuit
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const theme = {
  primary: '#4338CA',    // Indigo 700
  secondary: '#10B981',  // Emerald 500
  accent: '#3B82F6',     // Blue 500
  bg: '#0F172A',         // Slate 900
  surface: '#1E293B',    // Slate 800
  surfaceLight: '#334155', // Slate 700
  border: '#334155',     // Slate 700
  textPrimary: '#F8FAFC',// Slate 50
  textSecondary: '#94A3B8'// Slate 400
};

function MyAnalysesPage() {
  const router = useRouter();
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo('.dashboard-sidebar', { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
      .fromTo('.dashboard-nav', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, '-=0.4')
      .fromTo('.dashboard-main > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power3.out' }, '-=0.2');

    // Skill bars animation
    gsap.fromTo('.skill-fill', 
      { width: '0%' },
      { width: (i, el) => el.getAttribute('data-width'), duration: 1.5, stagger: 0.2, ease: 'power3.out', delay: 1 }
    );
  }, { scope: container });

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

    body {
      background-color: ${theme.bg};
      color: ${theme.textPrimary};
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    .glass {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid ${theme.border};
    }

    .card-hover:hover {
      transform: translateY(-4px);
      background: ${theme.surfaceLight};
      border-color: #475569;
      box-shadow: 0 15px 30px -10px rgba(0,0,0,0.5);
    }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      color: ${theme.textSecondary};
      text-decoration: none;
      transition: all 0.2s;
      font-weight: 500;
    }

    .sidebar-link:hover, .sidebar-link.active {
      background: ${theme.surfaceLight};
      color: ${theme.textPrimary};
    }

    .sidebar-link.active {
      background: ${theme.primary};
      color: white;
    }

    .action-button {
      background: ${theme.primary};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .action-button:hover {
      background: #3730A3;
      transform: scale(1.02);
    }

    .search-input {
      background: ${theme.bg};
      border: 1px solid ${theme.border};
      color: ${theme.textPrimary};
      padding: 8px 16px 8px 40px;
      border-radius: 8px;
      width: 100%;
      outline: none;
    }

    .search-input:focus {
      border-color: ${theme.primary};
      box-shadow: 0 0 0 2px rgba(67, 56, 202, 0.2);
    }
  `;

  return (
    <div ref={container} style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ width: '260px', borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', padding: '1.5rem', background: '#0F172A' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: theme.textPrimary, marginBottom: '2.5rem' }}>
          <div style={{ background: theme.primary, padding: '6px', borderRadius: '8px', display: 'flex' }}>
             <LayoutDashboard size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'Inter Tight' }}>InterviewInsights</span>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <Link href="/my-analyses" className="sidebar-link active"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link href="/interview" className="sidebar-link"><Play size={20} /> Mock Interview</Link>
          <Link href="/improve" className="sidebar-link"><GraduationCap size={20} /> Skills Lab</Link>
          <Link href="#" className="sidebar-link"><TrendingUp size={20} /> My Progress</Link>
          <Link href="#" className="sidebar-link"><BookOpen size={20} /> Learning Hub</Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: `1px solid ${theme.border}` }}>
          <Link href="#" className="sidebar-link"><Settings size={20} /> Settings</Link>
          <Link href="/logout" className="sidebar-link"><User size={20} /> Logout</Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main" style={{ flex: 1, overflowY: 'auto', background: '#020617', padding: '0 2rem 2rem' }}>
        
        {/* Top Nav */}
        <nav className="dashboard-nav" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'sticky', top: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} size={18} />
            <input type="text" placeholder="Search exercises..." className="search-input" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <button style={{ background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer', position: 'relative' }}>
                <Bell size={22} />
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: `2px solid #020617` }}></span>
             </button>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '1.5rem', borderLeft: `1px solid ${theme.border}` }}>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Alex Student</div>
                   <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>Free Plan</div>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme.surface, border: `2px solid ${theme.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <User size={20} />
                </div>
             </div>
          </div>
        </nav>

        {/* Content */}
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* Welcome Section */}
          <div style={{ marginBottom: '2.5rem' }}>
             <h1 style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '0.5rem' }}>Good Afternoon, Alex!</h1>
             <p style={{ color: theme.textSecondary, fontSize: '1.125rem' }}>Ready to conquer your next interview? Your performance is up 12% this week.</p>
          </div>

          {/* Core Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
             <div onClick={() => router.push('/interview')} className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(67, 56, 202, 0.2)', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Bot size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Inter Tight' }}>Mock Interview</h3>
                  <p style={{ color: theme.textSecondary, lineHeight: 1.6 }}>Engage in a full technical or behavioral session with our AI. Get real-time feedback and scoring.</p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: theme.primary, fontWeight: 700 }}>
                   Start Session <ArrowRight size={18} />
                </div>
             </div>

             <div onClick={() => router.push('/coding-practice')} className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <BarChart3 size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Inter Tight' }}>Technical Skills</h3>
                  <p style={{ color: theme.textSecondary, lineHeight: 1.6 }}>Master DSA, DBMS, ML, and System Design through interactive coding challenges and automated scoring.</p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: theme.accent, fontWeight: 700 }}>
                   Practice Coding <ArrowRight size={18} />
                </div>
             </div>

             <div onClick={() => router.push('/improve')} className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: theme.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Sparkles size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Inter Tight' }}>Improve Yourself</h3>
                  <p style={{ color: theme.textSecondary, lineHeight: 1.6 }}>Target specific weaknesses. Practice STAR method answers, filler word elimination, and tone control.</p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: theme.secondary, fontWeight: 700 }}>
                   Explore Exercises <ArrowRight size={18} />
                </div>
             </div>

             <div onClick={() => router.push('/aptitude')} className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <BrainCircuit size={32} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'Inter Tight' }}>Aptitude Tests</h3>
                  <p style={{ color: theme.textSecondary, lineHeight: 1.6 }}>Sharpen your logical reasoning, data interpretation, and quantitative skills with timed assessments.</p>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: 700 }}>
                   Start Assessment <ArrowRight size={18} />
                </div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
            {/* Stats & Progress */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Competency Analysis</h3>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary }}>Based on last 5 sessions</div>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { label: 'Technical Accuracy', score: 85, color: theme.primary },
                    { label: 'Communication Clarity', score: 72, color: theme.accent },
                    { label: 'Problem Solving', score: 92, color: theme.secondary },
                    { label: 'Confidence & Delivery', score: 64, color: '#F59E0B' }
                  ].map((stat, i) => (
                    <div key={i}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 500 }}>{stat.label}</span>
                          <span style={{ fontWeight: 700 }}>{stat.score}%</span>
                       </div>
                       <div style={{ height: '8px', background: theme.bg, borderRadius: '4px', overflow: 'hidden' }}>
                          <div className="skill-fill" data-width={`${stat.score}%`} style={{ height: '100%', background: stat.color, borderRadius: '4px' }}></div>
                       </div>
                    </div>
                  ))}
               </div>

               <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                     <Clock size={24} style={{ marginBottom: '8px', color: theme.textSecondary }} />
                     <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>12.4h</div>
                     <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>Practice Time</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                     <Target size={24} style={{ marginBottom: '8px', color: theme.textSecondary }} />
                     <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>8</div>
                     <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>Sessions Completed</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                     <Award size={24} style={{ marginBottom: '8px', color: theme.textSecondary }} />
                     <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>92</div>
                     <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>Highest Score</div>
                  </div>
               </div>
            </div>

            {/* History / Recent Activity */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
               <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Recent Attempts</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { type: 'Technical', role: 'Frontend Eng.', date: '2 hours ago', score: 88, status: 'Completed' },
                    { type: 'Behavioral', role: 'System Design', date: 'Yesterday', score: 76, status: 'Completed' },
                    { type: 'Exercise', role: 'STAR Method', date: '2 days ago', score: 94, status: 'Excellent' },
                    { type: 'Technical', role: 'General Soft.', date: '3 days ago', score: 71, status: 'Completed' }
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary }}>
                             <BarChart3 size={18} />
                          </div>
                          <div>
                             <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.role}</div>
                             <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>{item.type} • {item.date}</div>
                          </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: item.score > 80 ? theme.secondary : theme.textPrimary }}>{item.score}%</div>
                          <div style={{ fontSize: '0.7rem', color: theme.textSecondary }}>{item.status}</div>
                       </div>
                    </div>
                  ))}
               </div>
               <button style={{ width: '100%', marginTop: '1.5rem', padding: '10px', background: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.textSecondary, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  View All History
               </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default withAuth(MyAnalysesPage);