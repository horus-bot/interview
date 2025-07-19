
'use client';

import Link from 'next/link';
import { Bot, Code, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { withAuth } from '@/context/auth-context';

function InterviewHubPage() {
  const interviewTypes = [
    {
      title: 'Coding Interview',
      description: 'Solve technical problems in a simulated environment with a code editor and AI analysis.',
      icon: <Code className="w-12 h-12 text-primary" />,
      href: '/interview/coding',
    },
    {
      title: 'Behavioral Interview',
      description: 'Practice answering common HR and behavioral questions with our AI interviewer.',
      icon: <User className="w-12 h-12 text-primary" />,
      href: '/interview/behavioral',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <div className="absolute top-4 left-4">
          <Button asChild variant="outline">
              <Link href="/">
                  Back to Home
              </Link>
          </Button>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tighter text-primary">Choose Your Interview Type</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the type of interview you want to practice. Each path is tailored with specific questions and analysis.
        </p>
      </div>
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        {interviewTypes.map((type) => (
          <Link href={type.href} key={type.title} className="block group">
            <Card className="h-full flex flex-col hover:shadow-xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {type.icon}
                </div>
                <CardTitle className="text-2xl">{type.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow text-center">
                <CardDescription>{type.description}</CardDescription>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                 <Button className="w-full">
                    Start Practice <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default withAuth(InterviewHubPage);
