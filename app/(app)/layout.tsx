import type { Metadata } from 'next';
import { Sidebar } from '@/widgets/sidebar/sidebar';
import { Header } from '@/widgets/header/header';
import { auth } from '@/shared/lib/auth';

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
    <div className="min-h-screen flex flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header userName={userName ?? undefined} userEmail={userEmail} />
        <main className="flex-1 py-6 px-4 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
