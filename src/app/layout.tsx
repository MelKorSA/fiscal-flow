import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner'; // Import the Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Finance Dashboard', // Updated title
  description: 'Personal budget and expense tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Add suppressHydrationWarning for potential theme/extension conflicts */} 
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}> {/* Added font-sans */} 
        {/* You might want a ThemeProvider here later for dark mode */} 
        {children}
        <Toaster richColors position="top-right" /> {/* Add the Toaster component */}
      </body>
    </html>
  );
}
