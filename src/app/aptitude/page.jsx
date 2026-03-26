'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Clock, 
  CheckCircle2, 
  Play,
  BrainCircuit,
  ArrowRight,
  Target,
  BarChart3,
  Award,
  Building2,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const theme = {
  primary: '#F59E0B',    // Amber 500
  primaryDark: '#D97706',
  bg: '#020617',         // Slate 950
  surface: '#0F172A',    // Slate 900
  surfaceLight: '#1E293B',// Slate 800
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  success: '#10B981',
  warning: '#EF4444'
};

const COMPANY_TESTS = [
  {
    id: 'google',
    name: 'Google SWE Logic',
    type: 'Software Engineering',
    color: '#3B82F6', // Blue
    duration: 30, // minutes
    questions: [
      { id: 1, section: 'Data Interpretation', text: "If Google's server load jumps by 40% every 2 hours, what is the net percentage increase after 4 hours?", options: ["80%", "96%", "16%", "40%"], correct: 1 },
      { id: 2, section: 'Logical Reasoning', text: "A frog falls into a 10m well. Every day it climbs 3m, but at night slips back 2m. How many days until it escapes?", options: ["10 days", "9 days", "8 days", "7 days"], correct: 2 },
      { id: 3, section: 'Quantitative', text: "What is the angle between the hour and minute hand of a clock at 3:15?", options: ["0 degrees", "7.5 degrees", "15 degrees", "22.5 degrees"], correct: 1 },
      { id: 4, section: 'Quantitative', text: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. Length of the train is?", options: ["120m", "150m", "180m", "200m"], correct: 1 },
      { id: 5, section: 'Pattern', text: "SCD, TEF, UGH, ____, WKL. Next?", options: ["CMN", "UJI", "VIJ", "IJT"], correct: 2 }
    ]
  },
  {
    id: 'amazon',
    name: 'Amazon Fulfillment Quant',
    type: 'Operations & Logistics',
    color: '#F59E0B', // Orange
    duration: 20,
    questions: [
      { id: 11, section: 'Quantitative', text: "A factory produces 500 widgets an hour. If a machine breaks, halving production for 3 hours, how many total widgets are produced in an 8-hour shift?", options: ["4000", "3250", "3500", "3000"], correct: 1 },
      { id: 12, section: 'Logical Reasoning', text: "If 5 machines make 5 items in 5 minutes, how long does it take 100 machines to make 100 items?", options: ["100 minutes", "5 minutes", "50 minutes", "10 minutes"], correct: 1 },
      { id: 13, section: 'Verbal Reasoning', text: "Antonym for 'EPHEMERAL':", options: ["Transient", "Permanent", "Ethereal", "Decaying"], correct: 1 },
      { id: 14, section: 'Data Interpretation', text: "A sum of money at simple interest amounts to $815 in 3 years and to $854 in 4 years. The sum is:", options: ["650", "698", "690", "700"], correct: 1 }
    ]
  },
  {
    id: 'jpmorgan',
    name: 'JP Morgan Quant',
    type: 'Finance & Analytics',
    color: '#10B981', // Green
    duration: 45,
    questions: [
      { id: 21, section: 'Data Interpretation', text: "A portfolio drops by 20% in week one. What percentage growth is required in week two to break even?", options: ["20%", "25%", "30%", "22.5%"], correct: 1 },
      { id: 22, section: 'Quantitative', text: "Probability of throwing a sum of 9 with two standard dice?", options: ["1/9", "1/12", "1/6", "1/8"], correct: 0 },
      { id: 23, section: 'Logical Reasoning', text: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", options: ["1/3", "1/8", "2/8", "1/16"], correct: 1 },
      { id: 24, section: 'Quantitative', text: "If x - y = 8 and xy = -15, find x^2 + y^2", options: ["34", "94", "64", "49"], correct: 0 },
      { id: 25, section: 'Quantitative', text: "What is 15% of 60% of 1000?", options: ["90", "150", "900", "60"], correct: 0 }
    ]
  },
  {
    id: 'mckinsey',
    name: 'McKinsey Case Logic',
    type: 'Consulting & Strategy',
    color: '#8B5CF6', // Purple
    duration: 40,
    questions: [
      { id: 31, section: 'Logical Reasoning', text: "All consultants are travelers. Some travelers are exhausted. Ergo:?", options: ["All exhausted are consultants", "Some consultants are exhausted", "Not strictly deducible", "All travelers are consultants"], correct: 2 },
      { id: 32, section: 'Data Interpretation', text: "A company's revenue scales squarely with its marketing budget. If budget triples, by what factor does revenue grow?", options: ["3", "6", "9", "27"], correct: 2 },
      { id: 33, section: 'Verbal Reasoning', text: "Odometer is to mileage as compass is to:", options: ["Speed", "Hiking", "Needle", "Direction"], correct: 3 },
      { id: 34, section: 'Quantitative', text: "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time to go 68 km downstream.", options: ["4 hours", "3 hours", "5 hours", "2 hours"], correct: 0 }
    ]
  }
];

export default function AptitudeTestPage() {
  const [testState, setTestState] = useState('company_select'); // 'company_select', 'intro', 'active', 'results'
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0); 
  
  const activeTest = COMPANY_TESTS.find(t => t.id === selectedCompanyId);
  const container = useRef(null);
  const questionRef = useRef(null);

  // Animations Dashboard
  useGSAP(() => {
    if (testState === 'company_select') {
      gsap.fromTo('.cmp-anim', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' });
    } else if (testState === 'intro') {
      gsap.fromTo('.intro-fade', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
    } else if (testState === 'active') {
      gsap.fromTo('.test-ui', { opacity: 0 }, { opacity: 1, duration: 0.5 });
    } else if (testState === 'results') {
      gsap.fromTo('.result-anim', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.2, ease: 'back.out(1.2)' });
    }
  }, [testState]);

  // Question Transition Animation
  useEffect(() => {
    if (testState === 'active' && questionRef.current) {
      gsap.fromTo(questionRef.current, 
        { opacity: 0, x: 20 }, 
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentQ, testState]);

  // Timer logic
  useEffect(() => {
    if (testState === 'active' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && testState === 'active') {
      setTestState('results');
    }
  }, [testState, timeLeft]);

  const selectCompany = (id) => {
    setSelectedCompanyId(id);
    const test = COMPANY_TESTS.find(t => t.id === id);
    setTimeLeft(test.duration * 60);
    setAnswers({});
    setFlagged(new Set());
    setCurrentQ(0);
    setTestState('intro');
  };

  const handleSelect = (qId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
    if (currentQ < activeTest.questions.length - 1) {
       setTimeout(() => setCurrentQ(prev => prev + 1), 400);
    }
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQ)) newSet.delete(currentQ);
      else newSet.add(currentQ);
      return newSet;
    });
  };

  const calculateScore = () => {
    let score = 0;
    activeTest.questions.forEach(q => {
      if (answers[q.id] === q.correct) score += 1;
    });
    return Math.round((score / activeTest.questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    body {
      background-color: ${theme.bg};
      color: ${theme.textPrimary};
      font-family: 'Inter', sans-serif;
      margin: 0;
      overflow-x: hidden;
    }

    .glass-nav {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid ${theme.border};
    }

    .btn-primary {
      background: ${theme.primary};
      color: #020617;
      border: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
      background: #FBBF24;
    }

    .cmp-card {
      background: ${theme.surface};
      border: 1px solid ${theme.border};
      border-radius: 16px;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .cmp-card:hover {
      background: ${theme.surfaceLight};
      border-color: #475569;
      transform: translateY(-5px);
      box-shadow: 0 15px 30px -10px rgba(0,0,0,0.5);
    }

    .option-card {
      background: ${theme.surface};
      border: 2px solid ${theme.border};
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .option-card:hover {
      border-color: rgba(245, 158, 11, 0.5);
      background: rgba(245, 158, 11, 0.05);
    }
    .option-card.selected {
      border-color: ${theme.primary};
      background: rgba(245, 158, 11, 0.1);
    }
    
    .option-letter {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: ${theme.surfaceLight};
      color: ${theme.textSecondary};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      transition: all 0.2s;
    }
    .option-card.selected .option-letter {
      background: ${theme.primary};
      color: #020617;
    }

    .nav-dot {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: 2px solid ${theme.border};
      background: ${theme.bg};
      color: ${theme.textSecondary};
      transition: all 0.2s;
      position: relative;
    }
    .nav-dot:hover { border-color: ${theme.textSecondary}; }
    .nav-dot.answered { background: rgba(16, 185, 129, 0.1); border-color: ${theme.success}; color: ${theme.success}; }
    .nav-dot.active { border-color: ${theme.primary}; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3); color: ${theme.textPrimary}; }
    .nav-dot.flagged::after {
      content: '';
      position: absolute;
      top: -4px;
      right: -4px;
      width: 12px;
      height: 12px;
      background: ${theme.warning};
      border-radius: 50%;
      border: 2px solid ${theme.bg};
    }

    .control-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      background: transparent;
      border: 1px solid ${theme.border};
      color: ${theme.textPrimary};
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .control-btn:hover:not(:disabled) {
      background: ${theme.surfaceLight};
    }
    .control-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .radial-progress { transform: rotate(-90deg); }
    .radial-progress circle { transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
  `;

  const renderCompanySelect = () => (
    <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: theme.bg }}>
       <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
             <Link href="/my-analyses" style={{ color: theme.textSecondary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.9rem' }}>
                <ChevronLeft size={16} /> Back to Dashboard
             </Link>
          </div>

          <h1 className="cmp-anim" style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '1rem', letterSpacing: '-0.02em', color: theme.textPrimary }}>
             Company Aptitude Tests
          </h1>
          <p className="cmp-anim" style={{ fontSize: '1.125rem', color: theme.textSecondary, marginBottom: '4rem', maxWidth: '700px', lineHeight: 1.6 }}>
             Select a company-specific aptitude assessment. These mock tests mimic real quantitative, logical, and data-interpretation modules used by top-tier recruiters.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
             {COMPANY_TESTS.map(cmp => (
               <div key={cmp.id} className="cmp-card cmp-anim" onClick={() => selectCompany(cmp.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                     <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `${cmp.color}20`, color: cmp.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={28} />
                     </div>
                     <div style={{ padding: '4px 10px', background: theme.surfaceLight, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> {cmp.duration}m
                     </div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '6px', color: theme.textPrimary }}>{cmp.name}</h3>
                  <div style={{ fontSize: '0.875rem', color: theme.textSecondary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2rem' }}>
                     <Briefcase size={14} /> {cmp.type}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${theme.border}`, paddingTop: '1.25rem' }}>
                     <span style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 500 }}>{cmp.questions.length} Modules</span>
                     <span style={{ fontSize: '0.875rem', color: cmp.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Start Assessment <ArrowRight size={16} />
                     </span>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );

  const renderIntro = () => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundImage: `radial-gradient(circle at 50% 0%, ${activeTest.color}15, transparent 50%)` }}>
       <div className="intro-fade" style={{ background: `${activeTest.color}15`, padding: '16px', borderRadius: '20px', marginBottom: '2rem', color: activeTest.color }}>
          <Building2 size={48} />
       </div>
       <h1 className="intro-fade" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '1rem', textAlign: 'center', letterSpacing: '-0.02em', color: theme.textPrimary }}>
         {activeTest.name}
       </h1>
       <p className="intro-fade" style={{ fontSize: '1.125rem', color: theme.textSecondary, maxWidth: '600px', textAlign: 'center', lineHeight: 1.6, marginBottom: '3rem' }}>
         This test evaluates {activeTest.type} skills. Answers are scored exactly matching the company's logical and quantitative grading matrix.
       </p>
       
       <div className="intro-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem', width: '100%', maxWidth: '500px' }}>
          <div style={{ padding: '1.5rem', background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <Clock color={theme.textSecondary} size={24} />
             <div>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, fontWeight: 600 }}>Duration</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{activeTest.duration} Minutes</div>
             </div>
          </div>
          <div style={{ padding: '1.5rem', background: theme.surface, borderRadius: '12px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <Target color={theme.textSecondary} size={24} />
             <div>
                <div style={{ fontSize: '0.875rem', color: theme.textSecondary, fontWeight: 600 }}>Questions</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{activeTest.questions.length} Modules</div>
             </div>
          </div>
       </div>

       <button className="intro-fade btn-primary" style={{ background: activeTest.color }} onClick={() => setTestState('active')}>
          Begin Assessment <ArrowRight size={20} />
       </button>
       <button onClick={() => setTestState('company_select')} className="intro-fade" style={{ marginTop: '2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textSecondary, fontWeight: 600, fontSize: '0.9rem' }}>
          Select a Different Company
       </button>
    </div>
  );

  const renderActive = () => {
    const question = activeTest.questions[currentQ];
    const isAnswered = answers[question.id] !== undefined;
    
    return (
      <div className="test-ui" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Superior Top Bar */}
        <header className="glass-nav" style={{ height: '70px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: activeTest.color, padding: '8px', borderRadius: '8px', color: '#000' }}>
                 <Building2 size={20} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Inter Tight', letterSpacing: '-0.02em', color: theme.textPrimary }}>{activeTest.name}</span>
           </div>
           
           {/* Live Timer */}
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.1)' : theme.surfaceLight, border: `1px solid ${timeLeft < 300 ? theme.warning : theme.border}`, padding: '8px 20px', borderRadius: '100px', color: timeLeft < 300 ? theme.warning : theme.textPrimary, transition: 'all 0.3s' }}>
              <Clock size={18} className={timeLeft < 300 ? "pulse-anim" : ""} />
              <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
           </div>

           <button onClick={() => setTestState('results')} style={{ background: 'transparent', color: theme.textSecondary, border: `1px solid ${theme.border}`, padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              Finish Test
           </button>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: 'calc(100vh - 70px)' }}>
           
           {/* Section & Question Navigator (Sidebar) */}
           <aside style={{ width: '320px', borderRight: `1px solid ${theme.border}`, background: theme.surface, padding: '2rem', overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ marginBottom: '2rem' }}>
                 <div style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Overall Progress</div>
                 <div style={{ height: '8px', background: theme.bg, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(Object.keys(answers).length / activeTest.questions.length) * 100}%`, background: activeTest.color, transition: 'width 0.4s ease' }}></div>
                 </div>
                 <div style={{ fontSize: '0.85rem', color: theme.textSecondary, marginTop: '8px', textAlign: 'right', fontWeight: 500 }}>{Object.keys(answers).length} / {activeTest.questions.length} Finished</div>
              </div>

              <div>
                 <div style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Modules</div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {activeTest.questions.map((q, idx) => (
                      <div 
                        key={q.id} 
                        className={`nav-dot ${idx === currentQ ? 'active' : ''} ${answers[q.id] !== undefined ? 'answered' : ''} ${flagged.has(idx) ? 'flagged' : ''}`}
                        onClick={() => setCurrentQ(idx)}
                      >
                         {idx + 1}
                      </div>
                    ))}
                 </div>
              </div>

              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: theme.textSecondary }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.success, opacity: 0.2, border: `1px solid ${theme.success}` }}></div> Answered</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.bg, border: `1px solid ${theme.border}` }}></div> Unanswered</div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.warning }}></div> Flagged for Review</div>
              </div>
           </aside>

           {/* Main Question Area */}
           <main style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', background: theme.bg, position: 'relative' }}>
              <div ref={questionRef} style={{ maxWidth: '800px', margin: '0 auto' }}>
                 
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ padding: '6px 12px', background: `${activeTest.color}20`, color: activeTest.color, borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                       {question.section}
                    </div>
                    <button onClick={toggleFlag} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: flagged.has(currentQ) ? theme.warning : theme.textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'color 0.2s' }}>
                       <Flag size={18} fill={flagged.has(currentQ) ? theme.warning : 'none'} /> {flagged.has(currentQ) ? 'Flagged' : 'Flag for review'}
                    </button>
                 </div>

                 <h2 style={{ fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '3rem', color: theme.textPrimary }}>
                    <span style={{ color: theme.textSecondary, marginRight: '1rem' }}>{currentQ + 1}.</span> 
                    {question.text}
                 </h2>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {question.options.map((opt, idx) => {
                      const isSelected = answers[question.id] === idx;
                      return (
                        <div 
                          key={idx} 
                          className={`option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(question.id, idx)}
                          style={{ borderColor: isSelected ? activeTest.color : theme.border, background: isSelected ? `${activeTest.color}10` : theme.surface }}
                        >
                           <div className="option-letter" style={{ display: 'flex', justifyContent: 'center', background: isSelected ? activeTest.color : theme.surfaceLight, color: isSelected ? '#000' : theme.textSecondary }}>
                              {String.fromCharCode(65 + idx)}
                           </div>
                           <div style={{ fontSize: '1.125rem', fontWeight: 500, flex: 1 }}>{opt}</div>
                           <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? activeTest.color : theme.textSecondary}`, padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isSelected && <div style={{ width: '10px', height: '10px', background: activeTest.color, borderRadius: '50%' }}></div>}
                           </div>
                        </div>
                      );
                    })}
                 </div>

              </div>
           </main>

           {/* Bottom Action Bar */}
           <div style={{ position: 'fixed', bottom: 0, left: '320px', right: 0, padding: '1.5rem 4rem', background: 'linear-gradient(to top, rgba(2,6,23,1) 60%, rgba(2,6,23,0))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <button 
                   className="control-btn" 
                   disabled={currentQ === 0}
                   onClick={() => setCurrentQ(p => p - 1)}
                 >
                    <ChevronLeft size={18} /> Previous
                 </button>
                 
                 {currentQ === activeTest.questions.length - 1 ? (
                   <button className="btn-primary" style={{ background: activeTest.color }} onClick={() => setTestState('results')}>
                      Submit Test <CheckCircle2 size={18} />
                   </button>
                 ) : (
                   <button 
                     className="control-btn" style={{ background: theme.surfaceLight, color: theme.textPrimary, border: 'none' }}
                     onClick={() => setCurrentQ(p => p + 1)}
                   >
                      Next Question <ChevronRight size={18} />
                   </button>
                 )}
           </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const score = calculateScore();
    const circumference = 2 * Math.PI * 60; // r=60
    const offset = circumference - (score / 100) * circumference;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundImage: `radial-gradient(circle at 50% -20%, ${activeTest.color}30, transparent 70%)` }}>
         
         <div className="result-anim" style={{ marginBottom: '2rem', position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="200" height="200" className="radial-progress" style={{ position: 'absolute', top: 0, left: 0 }}>
               <circle cx="100" cy="100" r="60" fill="transparent" stroke={theme.surfaceLight} strokeWidth="12" />
               <circle 
                 cx="100" cy="100" r="60" fill="transparent" stroke={score > 60 ? theme.success : theme.warning} 
                 strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" 
               />
            </svg>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Inter Tight', color: theme.textPrimary, lineHeight: 1 }}>{score}%</div>
               <div style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 600, letterSpacing: '0.05em', marginTop: '4px' }}>Accuracy</div>
            </div>
         </div>

         <h2 className="result-anim" style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Inter Tight', marginBottom: '1rem', color: theme.textPrimary }}>{activeTest.name} Complete</h2>
         <p className="result-anim" style={{ fontSize: '1.125rem', color: theme.textSecondary, maxWidth: '500px', textAlign: 'center', marginBottom: '3rem' }}>
           {score >= 80 ? "Outstanding performance! You are highly proficient in these logical and quantitative structures." : "Good attempt. Practice slightly more to hit the competitive benchmark for this company."}
         </p>

         <div className="result-anim" style={{ width: '100%', maxWidth: '800px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: theme.surface, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
               <BarChart3 size={24} color={activeTest.color} style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '0.875rem', color: theme.textSecondary, fontWeight: 600 }}>Questions Attempted</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: theme.textPrimary }}>{Object.keys(answers).length} / {activeTest.questions.length}</div>
            </div>
            <div style={{ background: theme.surface, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
               <Clock size={24} color={theme.accent || activeTest.color} style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '0.875rem', color: theme.textSecondary, fontWeight: 600 }}>Time Taken</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: theme.textPrimary }}>{formatTime((activeTest.duration * 60) - timeLeft)}</div>
            </div>
            <div style={{ background: theme.surface, padding: '1.5rem', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
               <Award size={24} color={score > 60 ? theme.success : theme.warning} style={{ marginBottom: '1rem' }} />
               <div style={{ fontSize: '0.875rem', color: theme.textSecondary, fontWeight: 600 }}>Percentile Rank (Est.)</div>
               <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: theme.textPrimary }}>Top {score > 80 ? '15%' : '45%'}</div>
            </div>
         </div>

         <button className="result-anim btn-primary" style={{ textDecoration: 'none', background: activeTest.color }} onClick={() => setTestState('company_select')}>
            Take Another Test <ArrowRight size={20} />
         </button>

      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {testState === 'company_select' && renderCompanySelect()}
      {testState === 'intro' && renderIntro()}
      {testState === 'active' && renderActive()}
      {testState === 'results' && renderResults()}
    </>
  );
}
