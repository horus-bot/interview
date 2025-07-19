
'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight, Bot, UploadCloud, ArrowLeft, FileVideo } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { reasoningAnalysis } from '@/ai/flows/reasoning-analysis';
import { withAuth } from '@/context/auth-context';

const formSchema = z.object({
  video: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'A video file is required.')
    .refine((files) => files?.[0]?.type.startsWith('video/'), 'Please upload a valid video file.')
    .refine((files) => files?.[0]?.size <= 100 * 1024 * 1024, 'Video file must be less than 100MB.'),
});

type FormValues = z.infer<typeof formSchema>;

function UploadPage() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
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
    defaultValues: {},
  });

  const videoFile = form.watch('video');
  const uploadedFileName = useMemo(() => videoFile?.[0]?.name, [videoFile]);

  const onSubmit = async (data: FormValues) => {
    setStatus('processing');
    setProgress(10);
    setProgressMessage('please have some patience respected jury of suprathon');

    const videoFile = data.video[0];

    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    setProgress(30);

    reader.onload = async () => {
      try {
        const videoDataUri = reader.result as string;
        setProgress(50);

        const analysisResult = await reasoningAnalysis({ videoDataUri });
        setProgress(90);

        const videoUrl = URL.createObjectURL(videoFile);
        sessionStorage.setItem('videoUrl', videoUrl);
        sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
        sessionStorage.setItem('analysisType', 'behavioral'); // Set type for dashboard

        setProgress(100);
        router.push('/analysis');
      } catch (error) {
        console.error('Analysis failed:', error);
        setStatus('error');
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Something went wrong. The model may be unavailable, or the file may be too large.',
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
    <main ref={container} className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 lg:p-8">
      <div className="absolute top-4 left-4 animate-in">
          <Button asChild variant="outline" className="bg-card/80 backdrop-blur-sm">
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
                Provide your interview recording to get instant, AI-powered feedback.
            </p>
        </div>

        <Card className="shadow-2xl animate-in bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Bot className="h-8 w-8 text-primary" />
              Analyze Your Interview
            </CardTitle>
            <CardDescription>
              Your data is processed securely and is not stored on our servers. Max file size: 100MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'processing' ? (
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                    <p className="text-primary font-medium">{progressMessage}</p>
                    <Progress value={progress} className="w-full" />
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
                            <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {uploadedFileName ? (
                                        <>
                                            <FileVideo className="w-8 h-8 mb-3 text-primary" />
                                            <p className="font-semibold text-primary">{uploadedFileName}</p>
                                            <p className="text-xs text-muted-foreground">Click to choose a different file</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">MP4, WebM, etc. (Max 100MB)</p>
                                        </>
                                    )}
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

export default withAuth(UploadPage);
