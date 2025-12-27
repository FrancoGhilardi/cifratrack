import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CifraTrack - Dashboard',
  description: 'Control personal de finanzas',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto py-6 px-4 max-w-7xl">{children}</main>
    </div>
  );
}
