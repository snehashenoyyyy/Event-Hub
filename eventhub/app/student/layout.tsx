// app/student/layout.tsx
import Sidebar from '@/components/Sidebar';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const studentLinks = [
    { name: 'Dashboard', href: '/student' },
    { name: 'Explore Events', href: '/student/explore' },
    { name: 'Leaderboard', href: '/student/leaderboard' },
    { name: 'My Profile', href: '/student/profile' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="Student" userName="Alex Mitchell" links={studentLinks} />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}