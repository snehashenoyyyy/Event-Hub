// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Manage College Events<br/>Like Never Before</h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Streamline venue bookings, automate notifications, track participation, and gamify the entire experience. All in one beautiful platform.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Organizer Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-80 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
            👨‍💼
          </div>
          <h2 className="text-xl font-bold mb-2">Login as Organizer</h2>
          <p className="text-sm text-slate-500 mb-8 flex-grow">
            Create events, book venues, and manage everything from your dashboard.
          </p>
          <Link href="/organizer" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors">
            Enter as Organizer →
          </Link>
        </div>

        {/* Student Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-80 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-2xl">
            🎓
          </div>
          <h2 className="text-xl font-bold mb-2">Login as Student</h2>
          <p className="text-sm text-slate-500 mb-8 flex-grow">
            Discover events, register with one click, and compete on the leaderboard.
          </p>
          <Link href="/student" className="w-full bg-slate-500 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors">
            Enter as Student →
          </Link>
        </div>
      </div>
    </div>
  );
}