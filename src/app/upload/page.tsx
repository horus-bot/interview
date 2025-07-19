'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Bot, UploadCloud, ArrowLeft } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { reasoningAnalysis } from '@/ai/flows/reasoning-analysis';

const formSchema = z.object({
  video: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'A video file is required.')
    .refine((files) => files?.[0]?.type.startsWith('video/'), 'Please upload a valid video file.'),
  transcript: z.string().min(50, 'Transcript must be at least 50 characters long.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { toast } = useToast();
  const container = useRef(null);

  useGSAP(() => {
    gsap.from(".animate-in", {
        opacity: 0,
        y: 20,
        duration: 0.75,
        stagger: 0.2,
        ease: "power3.out",
      }
    );
  }, { scope: container });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transcript: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setStatus('processing');
    setProgress(10);

    const videoFile = data.video[0];
    const transcript = data.transcript;

    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    setProgress(30);

    reader.onload = async () => {
      try {
        const videoDataUri = reader.result as string;
        setProgress(50);

        const analysisResult = await reasoningAnalysis({ videoDataUri, transcript });
        setProgress(90);

        const videoUrl = URL.createObjectURL(videoFile);
        sessionStorage.setItem('videoUrl', videoUrl);
        sessionStorage.setItem('transcript', transcript);
        sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));

        setProgress(100);
        router.push('/analysis');
      } catch (error) {
        console.error('Analysis failed:', error);
        setStatus('error');
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Something went wrong. Please try again.',
        });
        setStatus('idle');
        setProgress(0);
      }
    };

    reader.onerror = () => {
      console.error('File reading failed');
      toast({
        variant: 'destructive',
        title: 'File Error',
        description: 'There was an error reading your video file.',
      });
      setStatus('idle');
      setProgress(0);
    };
  };
  
  return (
    <main ref={container} className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 lg:p-8">
      <div className="absolute top-4 left-4">
          <Button asChild variant="outline">
              <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
              </Link>
          </Button>
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                Upload & Analyze
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-in">
                Provide your interview recording and a transcript to get instant, AI-powered feedback.
            </p>
        </div>

        <Card className="shadow-lg animate-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bot className="h-8 w-8 text-primary" />
              Analyze Your Interview
            </CardTitle>
            <CardDescription>
              Your data is processed securely and is not stored on our servers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'processing' ? (
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                    <p className="text-primary font-medium">Analyzing, please wait...</p>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">This may take a few moments.</p>
                </div>
            ) : (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="video"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Video</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center justify-center w-full">
                            <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">MP4, WebM, or OGG</p>
                                </div>
                                <Input 
                                  id="video-upload" 
                                  type="file" 
                                  className="hidden" 
                                  accept="video/*"
                                  onChange={(e) => field.onChange(e.target.files)}
                                />
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transcript"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Transcript</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste the full transcript of your interview here..."
                            className="resize-y min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" size="lg" disabled={status === 'processing'}>
                    Analyze Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
