
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata = {
  title: 'Interview Insights',
  description: 'Get AI-powered feedback on your interview skills.'
};

export default function RootLayout({
  children


}) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ margin: "0px", height: "100%", padding: "0px", fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
      </body>
    </html>);

}