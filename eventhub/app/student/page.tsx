// app/student/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function StudentDashboard() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPastEvents() {
      try {
        const today = new Date().toISOString().split('T')[0];

        const eventsSnap = await getDocs(collection(db, "events"));
        const events: any[] = [];
        eventsSnap.forEach((doc) => events.push({ id: doc.id, ...doc.data() }));

        const regSnap = await getDocs(collection(db, "registrations"));
        const regs: any[] = [];
        regSnap.forEach((doc) => regs.push(doc.data()));

        const past = events
          .filter(e => e.event_date < today)
          .map(event => {
            const eventRegs = regs.filter(r => r.event_id === event.id || r.event_title === event.title);
            let winner = null;
            if (eventRegs.length > 0) {
              winner = eventRegs.reduce((prev, current) => ((prev.points || 0) > (current.points || 0)) ? prev : current);
            }
            return {
              ...event,
              winner: winner && winner.points > 0 ? winner : null
            };
          })
          .sort((a, b) => b.event_date.localeCompare(a.event_date));

        setPastEvents(past);
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
      setLoading(false);
    }
    fetchPastEvents();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading your dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Top Stats Banner */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className="w-20 h-20 bg-indigo-400/30 rounded-full flex items-center justify-center text-3xl border-4 border-indigo-400/50">👨‍🎓</div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Hey, Student! 👋</h1>
            <span className="bg-indigo-500/50 px-3 py-1 rounded-full text-sm font-medium">Ready to compete?</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">🚀</div>
          <div>
            <p className="text-xl font-bold text-slate-800">Find Events</p>
            <Link href="/student/explore" className="text-sm text-indigo-600 font-medium hover:underline">Explore Now &rarr;</Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center text-xl">🏆</div>
          <div>
            <p className="text-xl font-bold text-slate-800">Check Rank</p>
            <Link href="/student/leaderboard" className="text-sm text-indigo-600 font-medium hover:underline">View Leaderboard &rarr;</Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">📋</div>
          <div>
            <p className="text-xl font-bold text-slate-800">My Tickets</p>
            <Link href="/student/profile" className="text-sm text-indigo-600 font-medium hover:underline">Go to Profile &rarr;</Link>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span>🌟</span> Hall of Fame: Recent Winners
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastEvents.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl text-center text-slate-500 border-2 border-dashed border-slate-200">
            No events have finished yet. Check back soon to see the winners!
          </div>
        ) : (
          pastEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="text-xs font-bold text-indigo-600 mb-2">{event.event_date}</div>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{event.title}</h3>
                <p className="text-sm text-slate-500">{event.category}</p>
              </div>
              <div className="p-6 bg-white flex-1 flex flex-col justify-center">
                {event.winner ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl shadow-inner border-2 border-white">👑</div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{event.winner.student_name}</p>
                      <p className="text-sm font-bold text-indigo-600">⭐ {event.winner.points} Points</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 text-sm py-2">
                    Scores pending...
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}