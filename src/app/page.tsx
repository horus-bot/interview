
'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Upload, Smile, UserPlus } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

const styles = {
  container: {
    minHeight: '100vh',
    overflowX: 'hidden' as const,
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    fontFamily: 'system-ui, sans-serif',
    position: 'relative' as const,
  },
  header: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    padding: '1rem',
    borderBottom: '1px solid hsl(var(--border))',
    backgroundColor: 'rgba(hsl(var(--background)), 0.8)',
    backdropFilter: 'blur(8px)',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: 'hsl(var(--primary))',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    letterSpacing: '-0.025em',
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  btnGhost: {
    background: 'transparent',
    border: 'none',
    color: 'hsl(var(--foreground))',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid hsl(var(--border))',
    color: 'hsl(var(--foreground))',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
  },
  btnSolid: {
    background: 'hsl(var(--primary))',
    border: 'none',
    color: 'hsl(var(--primary-foreground))',
    padding: '0.5rem 1.25rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  main: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative' as const,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '1100px',
    textAlign: 'center' as const,
    zIndex: 1,
    marginTop: '4rem',
  },
  heading: {
    fontSize: 'clamp(3rem, 8vw, 5rem)',
    fontWeight: 800,
    letterSpacing: '-0.05em',
    color: 'hsl(var(--primary))',
    lineHeight: 1.1,
    marginBottom: '1rem',
  },
  subheading: {
    fontSize: '1.25rem',
    color: 'hsl(var(--muted-foreground))',
    maxWidth: '800px',
    margin: '0 auto 3rem auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '1rem',
    padding: '2rem',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  cardIcon: {
    background: 'hsla(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
    padding: '1rem',
    borderRadius: '50%',
    display: 'inline-flex',
    marginBottom: '1rem',
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
  },
  cardDesc: {
    fontSize: '1rem',
    color: 'hsl(var(--muted-foreground))',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute' as const,
    bottom: '1rem',
    textAlign: 'center' as const,
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.875rem',
    opacity: 0.8,
  },
};

export default function Home() {
  const container = useRef(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useGSAP(
    () => {
      gsap.from('.animate-in', {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
      });
    },
    { scope: container }
  );

  return (
    <div ref={container} style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link href="/" style={styles.logoLink}>
            <Bot size={32} />
            <span style={styles.logoText}>Interview Insights</span>
          </Link>
          <div style={styles.navButtons}>
            {loading ? (
              <div style={{ width: 100, height: 40, backgroundColor: 'hsl(var(--muted))', borderRadius: 6 }} />
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push('/my-analyses')}
                  style={styles.btnGhost}
                >
                  My Analyses
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/logout')}
                  style={styles.btnOutline}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={styles.btnGhost}>
                  Login
                </Link>
                <Link href="/signup" style={styles.btnSolid}>
                  Sign Up <UserPlus size={16} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      
      <main style={styles.main}>
        <div style={styles.contentWrapper}>
          <div >
            <h1 style={styles.heading}>Ace Your Next Interview</h1>
            <p style={styles.subheading}>
              Leverage AI to practice your interview skills, analyze your performance, and get personalized feedback.
            </p>
          </div>

          <div style={styles.grid}>
            <FeatureCard
              href="/interview"
              icon={<Bot size={40} />}
              title="Mock Interview"
              description="Practice a live interview with our friendly AI assistant in real-time."
            />
            <FeatureCard
              href="/upload"
              icon={<Upload size={40} />}
              title="Upload & Analyze"
              description="Upload a past interview recording for an in-depth, multi-modal analysis."
            />
            <FeatureCard
              href="/improve"
              icon={<Smile size={40} />}
              title="Improve Yourself"
              description="Get targeted exercises and coaching to improve your communication."
            />
          </div>
        </div>
        <footer  style={styles.footer}>
          Powered by SAKSHaM. Built for Everyone.
        </footer>
      </main>
    </div>
  );
}

interface FeatureCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ href, icon, title, description }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link 
      href={href} 
       
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-8px)' : 'none',
        borderColor: hovered ? 'hsl(var(--primary))' : 'hsl(var(--border))',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={styles.cardIcon}>
          {icon}
        </div>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardDesc}>{description}</p>
      </div>
      <div>
        <span style={{ ...styles.btnGhost, color: 'hsl(var(--primary))', padding: '0.5rem 0' }}>
          Get Started <ArrowRight size={16} style={{ marginLeft: 8 }} />
        </span>
      </div>
    </Link>
  );
}
