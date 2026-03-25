
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Code, User, ArrowRight } from 'lucide-react';
import { withAuth } from '@/context/auth-context';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    padding: '2rem',
    fontFamily: 'system-ui, sans-serif',
    position: 'relative' as const,
  },
  backButton: {
    position: 'absolute' as const,
    top: '1rem',
    left: '1rem',
    padding: '0.5rem 1rem',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.375rem',
    background: 'transparent',
    color: 'hsl(var(--foreground))',
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
  },
  title: {
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    fontWeight: 800,
    color: 'hsl(var(--primary))',
    letterSpacing: '-0.05em',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: 'hsl(var(--muted-foreground))',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    width: '100%',
    maxWidth: '900px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1rem',
    padding: '2rem',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  iconWrapper: {
    background: 'hsla(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
    padding: '1.25rem',
    borderRadius: '50%',
    display: 'inline-flex',
    marginBottom: '1.5rem',
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '1rem',
  },
  cardDesc: {
    fontSize: '1rem',
    color: 'hsl(var(--muted-foreground))',
    textAlign: 'center' as const,
    lineHeight: 1.5,
    marginBottom: '2rem',
    flexGrow: 1,
  },
  startButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }
};

function InterviewCard({ type }: { type: any }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <Link 
      href={type.href} 
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-8px)' : 'none',
        borderColor: hovered ? 'hsl(var(--primary))' : 'hsl(var(--border))',
        boxShadow: hovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : styles.card.boxShadow
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.iconWrapper}>
          {type.icon}
      </div>
      <h2 style={styles.cardTitle}>{type.title}</h2>
      <p style={styles.cardDesc}>{type.description}</p>
      <div style={styles.startButton}>
        Start Practice <ArrowRight size={18} />
      </div>
    </Link>
  );
}

function InterviewHubPage() {
  const interviewTypes = [
    {
      title: 'Coding Interview',
      description: 'Solve technical problems in a simulated environment with a code editor and AI analysis.',
      icon: <Code size={48} />,
      href: '/interview/coding',
    },
    {
      title: 'Behavioral Interview',
      description: 'Practice answering common HR and behavioral questions with our AI interviewer.',
      icon: <User size={48} />,
      href: '/interview/behavioral',
    },
  ];

  return (
    <div style={styles.container}>
      <Link href="/" style={styles.backButton}>
        Back to Home
      </Link>
      
      <div style={styles.header}>
        <h1 style={styles.title}>Choose Your Interview Type</h1>
        <p style={styles.subtitle}>
          Select the type of interview you want to practice. Each path is tailored with specific questions and analysis.
        </p>
      </div>

      <div style={styles.grid}>
        {interviewTypes.map((type) => (
          <InterviewCard key={type.title} type={type} />
        ))}
      </div>
    </div>
  );
}

export default withAuth(InterviewHubPage);
