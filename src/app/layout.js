import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FarmProvider } from '@/context/FarmContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'AgriMitra AI — From Farm to Market, Made Simple',
  description:
    'Your Farm. Your Transport. Your AI Agriculture Assistant. Complete digital agriculture ecosystem, agricultural logistics system, and AI farming assistant.',
  keywords: [
    'AgriMitra',
    'Agriculture AI',
    'Farm Management',
    'Agricultural Transportation',
    'Kisan Logistics',
    'Smart Farming India',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased font-sans min-h-screen">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <FarmProvider>
                <AppShell>{children}</AppShell>
              </FarmProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
