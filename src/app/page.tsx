'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Upload, BarChart2, Smile, LogIn } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const container = useRef(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useGSAP(
    () => {
      gsap.from('.animate-in', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });
    },
    { scope: container }
  );

  return (
    <div ref={container}>
      <header className="absolute inset-x-0 top-0 z-50 p-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">Interview Insights</span>
          </Link>
          <div className="flex items-center gap-4">
             {loading ? (
              <div />
            ) : user ? (
              <>
                 <Button asChild variant="ghost">
                    <Link href="/analysis">My Analysis</Link>
                </Button>
                <Button onClick={() => router.push('/logout')}>Logout</Button>
              </>
            ) : (
                <>
                <Button asChild variant="ghost">
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">
                        Sign Up <LogIn className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 lg:p-8">
        <div className="w-full max-w-5xl text-center">
          <div className="mb-12 animate-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-primary">
              Ace Your Next Interview
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Leverage AI to practice your interview skills, analyze your performance, and get personalized feedback to land your dream job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              href="/interview"
              icon={<Bot className="h-10 w-10" />}
              title="Mock Interview"
              description="Practice a live interview with our friendly AI assistant."
            />
            <FeatureCard
              href="/upload"
              icon={<Upload className="h-10 w-10" />}
              title="Upload & Analyze"
              description="Upload a past interview recording for in-depth analysis."
            />
            <FeatureCard
              href="/improve"
              icon={<Smile className="h-10 w-10" />}
              title="Improve Yourself"
              description="Get targeted exercises to improve your communication skills."
            />
          </div>
        </div>
        <footer className="absolute bottom-4 text-center text-muted-foreground text-sm animate-in">
            Powered by AI. Built for humans.
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
  return (
    <Link href={href} className="block group animate-in">
      <Card className="h-full hover:border-primary/80 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="items-center text-center">
          <div className="p-4 bg-secondary rounded-full mb-4 text-primary group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
