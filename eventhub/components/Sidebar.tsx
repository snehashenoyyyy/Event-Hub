// components/Sidebar.tsx
import Link from 'next/link';

type SidebarProps = {
  role: 'Organizer' | 'Student';
  links: { name: string; href: string }[];
  userName: string;
};

export default function Sidebar({ role, links, userName }: SidebarProps) {
  return (
    <div className="w-64 bg-indigo-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-indigo-800">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🟣</span> EventHub
        </h2>
        <p className="text-indigo-300 text-sm mt-1">College Events</p>
      </div>
      
      <div className="p-6 flex items-center gap-4 border-b border-indigo-800">
        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
          {userName.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{userName}</p>
          <p className="text-xs text-indigo-300">{role}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            className="block px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <Link href="/" className="block px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors text-indigo-300">
          Logout
        </Link>
      </div>
    </div>
  );
}