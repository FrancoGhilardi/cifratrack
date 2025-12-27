import type { Metadata } from 'next';
import { auth } from '@/shared/lib/auth';
import { AppShell } from '@/widgets/layout';

export const metadata: Metadata = {
  title: 'CifraTrack - Dashboard',
  description: 'Control personal de finanzas',
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name ?? 'Usuario';
  const userEmail = session?.user?.email ?? undefined;

  return (
    <AppShell userName={userName ?? undefined} userEmail={userEmail}>
      {children}
    </AppShell>
  );
}
