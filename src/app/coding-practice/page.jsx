'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Play, 
  RotateCcw, 
  Settings, 
  Code2, 
  Lightbulb, 
  CheckCircle2, 
  Save,
  MessageSquare,
  Bot,
  Zap,
  List,
  Sparkles,
  TerminalSquare
} from 'lucide-react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const theme = {
  primary: '#818CF8',    // Light Indigo
  primaryDark: '#4F46E5',// Indigo
  bg: '#0F172A',         // Slate 900
  surface: '#1E293B',    // Slate 800
  surfaceLight: '#334155', // Slate 700
  border: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  accent: '#10B981',     // Emerald
  warning: '#F59E0B'
};

const mockQuestions = {
  DSA: [
    { 
      id: 1, title: "Lowest Common Ancestor", difficulty: "Medium", timeLimit: "2.0s", 
      desc: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST. According to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes p and q as the lowest node in T that has both p and q as descendants.”",
      constraints: ["The number of nodes in the tree is in the range [2, 10^5].", "-10^9 <= Node.val <= 10^9"],
      testCases: [{ input: "root = [6,2,8,0,4,7,9], p = 2, q = 8", output: "6" }, { input: "root = [6,2,8,0,4,7,9], p = 2, q = 4", output: "2" }],
      hints: ["Leverage the BST property: Left subtree values are smaller, right subtree values are larger.", "A recursive approach is often cleaner, but iterative saves memory."]
    },
    { id: 2, title: "Two Sum", difficulty: "Easy", timeLimit: "1.0s", desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"], testCases: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }], hints: ["Can you do it in one pass using a Hash Map?"] },
    { id: 3, title: "Longest Valid Parentheses", difficulty: "Hard", timeLimit: "2.5s", desc: "Given a string containing just the characters '(' and ')', find the length of the longest valid (well-formed) parentheses substring.", constraints: ["0 <= s.length <= 3 * 10^4", "s[i] is '(', or ')'."], testCases: [{ input: "s = '(()'", output: "2" }], hints: ["Consider using a stack or dynamic programming."] }
  ],
  "Gen AI": [
    { id: 101, title: "Few-Shot Classification Prompt", difficulty: "Medium", timeLimit: "1.5s", desc: "Write a strict few-shot prompt that instructs an LLM to classify user intents into ['Refund', 'Support', 'Sales']. You must provide exactly 3 examples in your prompt.", constraints: ["Prompt must be under 200 tokens.", "Return raw text."], testCases: [{ input: "'I need my money back'", output: "Refund" }], hints: ["Format using clear delineators like 'Input:' and 'Output:'."] },
    { id: 102, title: "Temperature Scaling Script", difficulty: "Easy", timeLimit: "1.0s", desc: "Implement a function that formats the API call payload to OpenAI with a custom temperature and max_tokens.", constraints: ["Return a valid JSON object."], testCases: [{ input: "prompt='Hello', temp=0.7", output: "Valid Payload" }], hints: ["Look up the standard OpenAI ChatCompletions schema."] }
  ],
  DBMS: [
    { id: 201, title: "Nth Highest Salary", difficulty: "Medium", timeLimit: "2.0s", desc: "Write a SQL query to report the nth highest salary from the Employee table. If there is no nth highest salary, the query should report null.", constraints: ["Employee table has columns: id, salary."], testCases: [{ input: "n = 2", output: "200" }], hints: ["Consider using the DENSE_RANK() window function."] },
    { id: 202, title: "Department Top 3 Salaries", difficulty: "Hard", timeLimit: "3.0s", desc: "Write a SQL query to find employees who earn the top three salaries in each of the company's departments.", constraints: ["Schema: Employee (id, name, salary, departmentId), Department (id, name)"], testCases: [{ input: "Employee table, Department table", output: "Valid Set" }], hints: ["A subquery or CTE with DENSE_RANK over partition by departmentId works well here."] }
  ],
  ML: [
    { id: 301, title: "Gradient Descent Step", difficulty: "Medium", timeLimit: "2.0s", desc: "Implement a single step of gradient descent for a Linear Regression model using MSE as the loss function.", constraints: ["Weights and biases must be updated correctly.", "Assume arrays are numpy arrays."], testCases: [{ input: "X=[1, 2], y=[2, 4], w=0, b=0, lr=0.01", output: "w=0.1, b=0.06" }], hints: ["Calculate the derivative of MSE with respect to w and b first."] }
  ]
};

const mentorComments = [
  "Interesting approach...",
  "Don't forget to handle the edge cases!",
  "Make sure your time complexity is optimal.",
  "That looks like a solid start.",
  "Have you considered using a Hash Map here?",
  "I'm watching your logic unfold.",
  "Good use of variables.",
  "Is this O(n) or O(n^2)? Think about it.",
  "Keep going, you're on the right track!",
  "Are you sure about that loop condition?"
];

const AIMascot = ({ state }) => {
  const faceRef = useRef(null);

  useGSAP(() => {
     gsap.killTweensOf('.mascot-eye');
     gsap.killTweensOf('.mascot-pupil');
     
     if (state === 'idle') {
       gsap.to('.mascot-eye', { scaleY: 0.1, duration: 0.1, repeat: -1, repeatDelay: 3, yoyo: true, ease: 'power2.inOut', borderRadius: '6px' });
       gsap.to('.mascot-pupil', { x: 0, y: 0, duration: 0.3 });
       gsap.to(faceRef.current, { y: 0, rotate: 0, duration: 0.5 });
     } else if (state === 'watching') {
       gsap.to('.mascot-eye', { scaleY: 1, duration: 0.2, borderRadius: '6px' });
       gsap.to('.mascot-pupil', { x: -3, duration: 0.2 });
       gsap.to('.mascot-pupil', { x: 3, duration: 0.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.2 });
       gsap.to(faceRef.current, { y: -2, rotate: 3, duration: 0.5 });
     } else if (state === 'commenting') {
       gsap.to('.mascot-eye', { scaleY: 0.7, scaleX: 1.3, duration: 0.2, borderRadius: '6px' });
       gsap.to('.mascot-pupil', { y: -3, x: 0, duration: 0.3 });
       gsap.to(faceRef.current, { y: -6, duration: 0.3, yoyo: true, repeat: 1 });
     } else if (state === 'success') {
       gsap.to('.mascot-eye', { scaleY: 0.35, scaleX: 1.5, borderRadius: '50% 50% 0 0', duration: 0.3 });
       gsap.to('.mascot-pupil', { y: -2, x: 0, duration: 0.3 });
       gsap.to(faceRef.current, { y: -12, duration: 0.4, yoyo: true, repeat: 3, ease: 'power1.inOut' });
     }
  }, [state]);

  return (
    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: -6, background: state === 'success' ? '#10b981' : state === 'commenting' ? '#818cf8' : state === 'watching' ? '#ec4899' : 'transparent', filter: 'blur(12px)', opacity: state !== 'idle' ? 0.7 : 0, borderRadius: '50%', transition: 'all 0.5s ease' }}></div>
      <div ref={faceRef} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '2px solid #818cf8', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', zIndex: 1, boxShadow: 'inset 0 0 12px rgba(0,0,0,0.6)' }}>
        <div className="mascot-eye" style={{ width: '12px', height: '16px', background: '#e0e7ff', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
           <div className="mascot-pupil" style={{ width: '6px', height: '6px', background: '#312e81', borderRadius: '50%', position: 'absolute', bottom: '2px', left: '3px' }}></div>
        </div>
        <div className="mascot-eye" style={{ width: '12px', height: '16px', background: '#e0e7ff', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
           <div className="mascot-pupil" style={{ width: '6px', height: '6px', background: '#312e81', borderRadius: '50%', position: 'absolute', bottom: '2px', left: '3px' }}></div>
        </div>
      </div>
    </div>
  )
}

export default function CodingPracticePage() {
  const [category, setCategory] = useState('DSA');
  const [selectedQuestion, setSelectedQuestion] = useState(mockQuestions.DSA[0]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('function solve(params) {\n  // Write your logic here\n  \n}');
  const [logs, setLogs] = useState(["[System]: Welcome to InterviewInsights Premium IDE.", "[System]: Connecting to runtime environment... OK."]);
  const [editorActive, setEditorActive] = useState(false);
  const [viewMode, setViewMode] = useState('desc'); // 'desc' | 'list'
  
  // Mentor State
  const [mentorState, setMentorState] = useState('idle'); // 'idle' | 'watching' | 'commenting'
  const [mentorMessage, setMentorMessage] = useState("I'm your AI Mentor. I'll be watching your code.");
  const typingTimeoutRef = useRef(null);

  const container = useRef(null);
  const mentorRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo('.stagger-fade', 
      { opacity: 0, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
  }, { scope: container });

  // Simulate AI Mentor observing typing
  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setEditorActive(true);
    
      setMentorState('watching');
      setMentorMessage("Observing your keystrokes...");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setEditorActive(false);
      // Randomly trigger a comment 50% of the time when they stop typing
      if (Math.random() > 0.5 && code.length > 20) {
         triggerMentorComment();
      } else {
         setMentorState('idle');
         setMentorMessage("Waiting for your next move...");
      }
    }, 1500);
  };

  const triggerMentorComment = () => {
    setMentorState('commenting');
    const comment = mentorComments[Math.floor(Math.random() * mentorComments.length)];
    setMentorMessage(comment);
    
    gsap.fromTo(mentorRef.current, 
      { scale: 0.95, borderColor: theme.surfaceLight },
      { scale: 1, borderColor: theme.primary, boxShadow: `0 0 20px ${theme.primaryDark}40`, duration: 0.4, ease: 'back.out(1.5)' }
    );

    setTimeout(() => {
      setMentorState('idle');
      setMentorMessage("I'm keeping an eye on your progress.");
      gsap.to(mentorRef.current, { borderColor: theme.border, boxShadow: 'none', duration: 0.5 });
    }, 4000);
  };

  const runCode = () => {
    setLogs([]);
    gsap.to('.console-pane', { height: '250px', duration: 0.4, ease: 'power3.out' });
    setTimeout(() => setLogs(p => [...p, `[Running] Executing ${language} environment...`]), 100);
    setTimeout(() => setLogs(p => [...p, `[Test Case 1] Evaluating input \`${selectedQuestion.testCases[0]?.input || ''}\`...`]), 600);
    setTimeout(() => setLogs(p => [...p, `[Result] Expected: ${selectedQuestion.testCases[0]?.output}, Actual: ${selectedQuestion.testCases[0]?.output}`]), 1200);
    setTimeout(() => {
      setLogs(p => [...p, `[Status] ALL TESTS PASSED.`, `[System] Runtime: 42ms | Memory: 38.4MB`]);
      setMentorState('success');
      setMentorMessage("Excellent job! All test cases passed. Are you ready for the next challenge?");
      gsap.fromTo(mentorRef.current, { scale: 0.9 }, { scale: 1, borderColor: theme.accent, duration: 0.5, ease: 'elastic.out' });
    }, 1800);
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap');

    body {
      background-color: ${theme.bg};
      color: ${theme.textPrimary};
      font-family: 'Inter', sans-serif;
      margin: 0;
      overflow: hidden;
    }

    .fira-code { font-family: 'Fira Code', monospace; }
    
    .panel {
      background: ${theme.surface};
      border-radius: 12px;
      border: 1px solid ${theme.border};
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .header-btn {
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      background: ${theme.surfaceLight};
      color: ${theme.textPrimary};
      border: 1px solid transparent;
    }
    .header-btn:hover { background: ${theme.border}; }

    .nav-cat {
      padding: 0.5rem 1rem;
      border-radius: 100px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      color: ${theme.textSecondary};
      background: transparent;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .nav-cat.active {
      color: ${theme.primary};
      background: rgba(129, 140, 248, 0.1);
      border-color: rgba(129, 140, 248, 0.2);
    }

    .q-list-item {
      padding: 1rem;
      border-bottom: 1px solid ${theme.border};
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .q-list-item:hover { background: rgba(255,255,255,0.02); }
    .q-list-item.active { background: rgba(129, 140, 248, 0.05); border-left: 3px solid ${theme.primary}; }

    .code-area {
      background: #0D1117;
      color: #E6EDF3;
      border: none;
      width: 100%;
      height: 100%;
      padding: 1.5rem;
      font-size: 14px;
      line-height: 1.6;
      resize: none;
      outline: none;
      tab-size: 2;
    }
    .code-area::placeholder { color: #484F58; }

    .btn-run { background: ${theme.accent}; color: #020617; }
    .btn-run:hover { background: #34D399; box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); }

    .mentor-bubble {
      background: linear-gradient(145deg, ${theme.surface}, ${theme.bg});
      border: 1px solid ${theme.border};
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.3s ease;
    }

    .typewriter-text {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
    ::-webkit-scrollbar-corner { background: transparent; }
  `;

  return (
    <div ref={container} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: theme.bg }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      {/* Top Navbar */}
      <header style={{ height: '60px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', background: theme.surface, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/my-analyses" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: theme.textSecondary, fontWeight: 500, fontSize: '0.9rem' }}>
             <ChevronLeft size={18} /> Dashboard
          </Link>
          <div style={{ width: '1px', height: '16px', background: theme.border }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <TerminalSquare color={theme.primary} size={22} />
             <span style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'Inter Tight', letterSpacing: '-0.02em', color: theme.textPrimary }}>Coding Practice</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', padding: '0 1rem' }}>
          {['DSA', 'Scripting', 'DBMS', 'ML', 'Gen AI', 'System Design'].map(cat => (
            <button 
              key={cat} 
              className={`nav-cat ${category === cat ? 'active' : ''}`}
              onClick={() => {
                setCategory(cat);
                setViewMode('list');
                if (mockQuestions[cat]) setSelectedQuestion(mockQuestions[cat][0]);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button className="header-btn"><Settings size={16} /></button>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ flex: 1, display: 'flex', gap: '1rem', padding: '1rem', overflow: 'hidden' }}>
        
        {/* LEFT PANE: Question Explorer / Details */}
        <section className="panel stagger-fade" style={{ width: '380px', flexShrink: 0, background: theme.surface }}>
           <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}` }}>
              <button 
                onClick={() => setViewMode('list')} 
                style={{ flex: 1, padding: '12px', background: viewMode === 'list' ? 'transparent' : 'rgba(0,0,0,0.2)', color: viewMode === 'list' ? theme.primary : theme.textSecondary, border: 'none', borderBottom: viewMode === 'list' ? `2px solid ${theme.primary}` : '2px solid transparent', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <List size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Problems
              </button>
              <button 
                onClick={() => setViewMode('desc')} 
                style={{ flex: 1, padding: '12px', background: viewMode === 'desc' ? 'transparent' : 'rgba(0,0,0,0.2)', color: viewMode === 'desc' ? theme.primary : theme.textSecondary, border: 'none', borderBottom: viewMode === 'desc' ? `2px solid ${theme.primary}` : '2px solid transparent', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <MessegeSquareIcon size={16} /> Description
              </button>
           </div>

           <div style={{ flex: 1, overflowY: 'auto' }}>
              {viewMode === 'list' ? (
                <div>
                   {mockQuestions[category] ? mockQuestions[category].map(q => (
                     <div 
                       key={q.id} 
                       className={`q-list-item ${selectedQuestion?.id === q.id ? 'active' : ''}`}
                       onClick={() => { setSelectedQuestion(q); setViewMode('desc'); }}
                     >
                       <div style={{ fontSize: '0.95rem', fontWeight: 600, color: theme.textPrimary }}>{q.id}. {q.title}</div>
                       <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: q.difficulty === 'Hard' ? '#EF4444' : q.difficulty === 'Medium' ? '#F59E0B' : '#10B981', fontWeight: 700 }}>{q.difficulty}</span>
                       </div>
                     </div>
                   )) : <div style={{ padding: '2rem', textAlign: 'center', color: theme.textSecondary, fontSize: '0.9rem' }}>No problems available in this category yet.</div>}
                </div>
              ) : (
                <div style={{ padding: '1.5rem' }}>
                   {selectedQuestion ? (
                     <>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: 'Inter Tight', color: theme.textPrimary }}>{selectedQuestion.title}</h2>
                       </div>
                       <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                          <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', color: selectedQuestion.difficulty === 'Hard' ? '#EF4444' : selectedQuestion.difficulty === 'Medium' ? '#F59E0B' : '#10B981', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{selectedQuestion.difficulty}</span>
                          <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.75rem', color: theme.textSecondary, fontWeight: 600 }}>CPU Limit: {selectedQuestion.timeLimit}</span>
                       </div>
                       
                       <p style={{ lineHeight: 1.7, color: '#CBD5E1', marginBottom: '2rem', fontSize: '0.95rem' }}>{selectedQuestion.desc}</p>
                       
                       {selectedQuestion.constraints && (
                         <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: theme.textPrimary }}>Constraints:</h4>
                            <ul style={{ paddingLeft: '1.25rem', color: theme.textSecondary, fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                               {selectedQuestion.constraints.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                         </div>
                       )}

                       <div style={{ marginBottom: '2rem' }}>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: theme.textPrimary }}>Examples</h4>
                          {selectedQuestion.testCases?.map((tc, i) => (
                            <div key={i} style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '1rem', border: `1px solid rgba(255,255,255,0.05)` }}>
                               <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginBottom: '4px', fontWeight: 600 }}>Input:</div>
                               <div className="fira-code" style={{ fontSize: '0.85rem', color: theme.textPrimary, marginBottom: '12px' }}>{tc.input}</div>
                               <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginBottom: '4px', fontWeight: 600 }}>Output:</div>
                               <div className="fira-code" style={{ fontSize: '0.85rem', color: '#10B981' }}>{tc.output}</div>
                            </div>
                          ))}
                       </div>

                       <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lightbulb size={16} color={theme.warning} /> Intel / Hints
                          </h4>
                          {selectedQuestion.hints?.map((h, i) => (
                            <div key={i} style={{ padding: '0.85rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', fontSize: '0.85rem', color: '#FBBF24', marginBottom: '0.75rem', borderLeft: `3px solid ${theme.warning}`, lineHeight: 1.5 }}>
                               {h}
                            </div>
                          ))}
                       </div>
                     </>
                   ) : <div style={{ textAlign: 'center', color: theme.textSecondary, marginTop: '2rem' }}>Select a problem from the list.</div>}
                </div>
              )}
           </div>
        </section>

        {/* MIDDLE PANE: IDE */}
        <section className="panel stagger-fade" style={{ flex: 1, background: '#0D1117' }}>
           {/* Editor Tool Bar */}
           <div style={{ height: '48px', background: theme.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                 <div style={{ padding: '6px 16px', background: '#0D1117', borderTop: `2px solid ${theme.primary}`, borderRadius: '6px 6px 0 0', fontSize: '0.85rem', fontWeight: 600, color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code2 size={16} color={theme.primary} /> solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'cpp'}
                 </div>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, borderRadius: '6px', color: theme.textPrimary, fontSize: '0.8rem', fontWeight: 600, outline: 'none', padding: '4px 10px', cursor: 'pointer' }}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3.10</option>
                <option value="cpp">C++ 20</option>
                <option value="sql">PostgreSQL 14</option>
              </select>
           </div>

           {/* Monaco-style textarea */}
           <div style={{ flex: 1, position: 'relative' }}>
              <textarea 
                className="code-area fira-code"
                value={code}
                onChange={handleCodeChange}
                spellCheck={false}
              />
           </div>
           
           {/* Console Area */}
           <div className="console-pane" style={{ height: logs.length > 0 ? '250px' : '48px', transition: 'height 0.3s ease', background: theme.bg, borderTop: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', background: theme.surface }}>
                 <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                    <TerminalSquare size={16} /> BUILD CONSOLE
                 </div>
                 <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="header-btn" onClick={() => setLogs([])}><RotateCcw size={16} /> Clear</button>
                    <button className="header-btn" style={{ background: 'transparent' }}><Save size={16} /> Save</button>
                    <button className="header-btn btn-run" onClick={runCode}><Play size={16} fill="currentColor" /> Submit Code</button>
                 </div>
              </div>
              {logs.length > 0 && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#020617' }} className="fira-code">
                   {logs.map((log, i) => (
                     <div key={i} style={{ marginBottom: '8px', fontSize: '0.85rem', color: log.includes('PASSED') ? '#10B981' : log.includes('[System]') ? theme.primary : theme.textSecondary }}>{log}</div>
                   ))}
                   <div style={{ height: '10px' }}></div>
                </div>
              )}
           </div>
        </section>

        {/* RIGHT PANE: AI Mentor */}
        <section className="panel stagger-fade" style={{ width: '280px', flexShrink: 0, background: theme.surface }}>
           <div style={{ padding: '1.25rem', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: theme.bg, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Sparkles size={20} color={theme.primary} />
              </div>
              <div>
                 <div style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.textPrimary }}>AI Mentor</div>
                 <div style={{ fontSize: '0.75rem', color: mentorState === 'idle' ? theme.textSecondary : theme.accent, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: mentorState === 'idle' ? theme.textSecondary : theme.accent, display: 'inline-block' }}></span>
                    {mentorState === 'idle' ? 'Standby' : mentorState === 'watching' ? 'Observing...' : 'Analyzing'}
                 </div>
              </div>
           </div>

           <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
              
              <div ref={mentorRef} className="mentor-bubble">
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <AIMascot state={mentorState} />
                    {mentorState !== 'idle' && <Zap size={16} color={mentorState === 'success' ? '#10b981' : theme.warning} className="pulse-anim" />}
                 </div>
                 <div className="typewriter-text" style={{ fontSize: '0.9rem', lineHeight: 1.6, color: mentorState === 'commenting' ? theme.textPrimary : theme.textSecondary, fontWeight: 500 }}>
                    "{mentorMessage}"
                 </div>
              </div>

              <div style={{ marginTop: 'auto', background: theme.bg, padding: '1rem', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                 <div style={{ fontSize: '0.75rem', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '12px' }}>Session Stats</div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: theme.textSecondary }}>Time Elapsed</span>
                    <span className="fira-code" style={{ fontWeight: 600 }}>12:45</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: theme.textSecondary }}>Memory Est.</span>
                    <span className="fira-code" style={{ fontWeight: 600 }}>O(n)</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: theme.textSecondary }}>Time Est.</span>
                    <span className="fira-code" style={{ color: theme.warning, fontWeight: 600 }}>O(n²)</span>
                 </div>
              </div>

           </div>
        </section>

      </main>
    </div>
  );
}

// Icon helper function extracted for UI structure
function MessegeSquareIcon(props) {
  return <MessageSquare {...props} />;
}
