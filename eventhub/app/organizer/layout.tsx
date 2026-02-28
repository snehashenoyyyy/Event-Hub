// app/organizer/layout.tsx
import Sidebar from '@/components/Sidebar';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const organizerLinks = [
    { name: 'Dashboard', href: '/organizer' },
    { name: 'Create Event', href: '/organizer/create' },
    { name: 'Venue Booking', href: '/organizer/venues' },
    { name: 'Analytics', href: '/organizer/analytics' },
    { name: 'Manage Scores', href: '/organizer/scores' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar role="Organizer" userName="Dr. Sarah Johnson" links={organizerLinks} />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}