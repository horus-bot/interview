
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
  video: z.
  custom().
  refine((files) => files?.length === 1, 'A video file is required.').
  refine((files) => files?.[0]?.type.startsWith('video/'), 'Please upload a valid video file.').
  refine((files) => files?.[0]?.size <= 100 * 1024 * 1024, 'Video file must be less than 100MB.')
});



function UploadPage() {
  const [status, setStatus] = useState('idle');
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
      ease: "power3.out"
    }
    );
  }, { scope: container });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  });

  const videoFile = form.watch('video');
  const uploadedFileName = useMemo(() => videoFile?.[0]?.name, [videoFile]);

  const onSubmit = async (data) => {
    setStatus('processing');
    setProgress(10);
    setProgressMessage('please have some patience respected jury of suprathon');

    const videoFile = data.video[0];

    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    setProgress(30);

    reader.onload = async () => {
      try {
        const videoDataUri = reader.result;
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
          description: 'Something went wrong. The model may be unavailable, or the file may be too large.'
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
        description: 'There was an error reading your video file.'
      });
      setStatus('idle');
      setProgress(0);
    };
  };

  return (
    <main ref={container} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--background))', padding: '2rem', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <Button asChild variant="outline">
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                  <ArrowLeft size={16} />
                  Back to Home
              </Link>
          </Button>
      </div>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'hsl(var(--primary))', letterSpacing: '-0.05em', marginBottom: '1rem' }}>
                Upload & Analyze
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'hsl(var(--muted-foreground))' }}>
                Provide your interview recording to get instant, AI-powered feedback.
            </p>
        </div>

        <Card style={{ padding: '2rem', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <CardHeader style={{ textAlign: 'center', paddingBottom: '2rem' }}>
            <CardTitle style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.5rem', color: 'hsl(var(--foreground))' }}>
              <Bot size={28} style={{ color: 'hsl(var(--primary))' }} />
              Analyze Your Interview
            </CardTitle>
            <CardDescription style={{ fontSize: '0.95rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>
              Your data is processed securely and is not stored on our servers. Max file size: 100MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'processing' ?
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', padding: '2rem 0' }}>
                    <p style={{ fontSize: '1.125rem', fontWeight: 500, color: 'hsl(var(--foreground))' }}>{progressMessage}</p>
                    <Progress value={progress} style={{ height: '0.75rem', width: '100%' }} />
                </div> :

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <FormField
                  control={form.control}
                  name="video"
                  render={({ field }) =>
                  <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <FormLabel style={{ fontWeight: 600 }}>Interview Video</FormLabel>
                        <FormControl>
                          <div style={{ position: 'relative' }}>
                            <label htmlFor="video-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '16rem', border: '2px dashed hsl(var(--border))', borderRadius: '0.75rem', backgroundColor: 'hsl(var(--muted))', cursor: 'pointer', transition: 'border-color 0.2s ease' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', padding: '2rem' }}>
                                    {uploadedFileName ?
                            <>
                                            <FileVideo size={48} style={{ color: 'hsl(var(--primary))', marginBottom: '1rem' }} />
                                            <p style={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}>{uploadedFileName}</p>
                                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Click to choose a different file</p>
                                        </> :

                            <>
                                            <UploadCloud size={48} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }} />
                                            <p style={{ fontSize: '1.125rem', color: 'hsl(var(--foreground))' }}><span style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>Click to upload</span> or drag and drop</p>
                                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>MP4, WebM, etc. (Max 100MB)</p>
                                        </>
                            }
                                </div>
                                <Input
                            id="video-upload"
                            type="file"
                            style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}
                            accept="video/*"
                            onChange={(e) => field.onChange(e.target.files)} />
                          
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage style={{ color: 'hsl(var(--destructive))' }} />
                      </FormItem>
                  } />
                
                  
                  <Button type="submit" size="lg" disabled={form.formState.isSubmitting} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', fontSize: '1.125rem' }}>
                    Analyze Now
                    <ArrowRight size={20} style={{ marginLeft: '0.75rem' }} />
                  </Button>
                </form>
              </Form>
            }
          </CardContent>
        </Card>
      </div>
    </main>);

}

export default withAuth(UploadPage);