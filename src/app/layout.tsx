import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chat Past — Talk to the past | Interactive History Museum for Students',
  description:
    'Explore Indian and world history through age-appropriate, historically grounded AI simulations of 100 remarkable figures for students aged 8–16.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-bronze-500/20 selection:text-ink-900">
        {children}
      </body>
    </html>
  );
}
