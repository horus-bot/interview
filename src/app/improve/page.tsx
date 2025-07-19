'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, MicVocal, PersonStanding, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const improvementAreas = [
  {
    icon: <PersonStanding className="h-8 w-8 text-primary" />,
    title: 'Improve Posture',
    description: 'Learn how to maintain a confident and professional posture during your interviews.',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>Sit Up Straight:</strong> Avoid slouching. Keep your back straight and shoulders relaxed.</p>
        <p><strong>Feet on the Floor:</strong> Plant both feet firmly on the ground to feel more grounded.</p>
        <p><strong>Hands Visible:</strong> Keep your hands on the table or in your lap. Avoid fidgeting.</p>
      </div>
    ),
  },
  {
    icon: <Eye className="h-8 w-8 text-primary" />,
    title: 'Improve Eye Contact',
    description: 'Master the art of engaging eye contact to build rapport with your interviewer.',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>Camera is Key:</strong> In a virtual interview, look directly at the camera, not at the screen.</p>
        <p><strong>The 50/70 Rule:</strong> Aim to maintain eye contact for 50% of the time while speaking and 70% while listening.</p>
        <p><strong>Soft Gaze:</strong> Don't stare intensely. Maintain a soft, friendly gaze.</p>
      </div>
    ),
  },
  {
    icon: <MicVocal className="h-8 w-8 text-primary" />,
    title: 'Improve Speaking Skills',
    description: 'Enhance your verbal communication for clearer and more impactful answers.',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>Pace Yourself:</strong> Speak at a moderate pace. Rushing can make you sound nervous.</p>
        <p><strong>Eliminate Fillers:</strong> Practice pausing instead of using filler words like "um," "ah," or "like."</p>
        <p><strong>Vary Your Tone:</strong> Use vocal variety to convey enthusiasm and keep your interviewer engaged.</p>
      </div>
    ),
  },
    {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: 'Structuring Answers (STAR Method)',
    description: 'Learn the STAR method to structure your answers to behavioral questions effectively.',
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><strong>S - Situation:</strong> Briefly describe the context and background.</p>
        <p><strong>T - Task:</strong> Explain what your responsibility was in that situation.</p>
        <p><strong>A - Action:</strong> Detail the specific actions you took to address the task.</p>
        <p><strong>R - Result:</strong> Conclude with the outcome of your actions, quantifying the results if possible.</p>
      </div>
    ),
  },
];

export default function ImprovePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-primary">Improve Yourself</h1>
            <div />
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Personalized Improvement Plan</h2>
            <p className="mt-2 text-lg text-muted-foreground">
                Focus on key areas to boost your interview performance. Here are some tips to get you started.
            </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
            {improvementAreas.map((area, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-xl hover:no-underline">
                        <div className="flex items-center gap-4">
                            {area.icon}
                            <span>{area.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-16">
                        <p className="mb-4 font-semibold text-base">{area.description}</p>
                        {area.content}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </main>
    </div>
  );
}
