// app/organizer/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function OrganizerDashboard() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalParticipants: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Get today's date to separate past events from future events
      const today = new Date().toISOString().split('T')[0];

      // Fetch all events from Firebase
      const eventsSnap = await getDocs(collection(db, "events"));
      const events: any[] = [];
      eventsSnap.forEach((doc) => events.push({ id: doc.id, ...doc.data() }));

      // Fetch all registrations from Firebase
      const regSnap = await getDocs(collection(db, "registrations"));
      const regs: any[] = [];
      regSnap.forEach((doc) => regs.push(doc.data()));

      setStats({
        totalEvents: events.length,
        totalParticipants: regs.length,
      });

      // Filter events that happened before today and find the highest scorer
      const past = events
        .filter(e => e.event_date && e.event_date < today)
        .map(event => {
          // Find everyone registered for THIS specific event
          const eventRegs = regs.filter(r => r.event_id === event.id || r.event_title === event.title);
          
          let winner = null;
          if (eventRegs.length > 0) {
            // Find the person with the highest points
            winner = eventRegs.reduce((prev, current) => ((prev.points || 0) > (current.points || 0)) ? prev : current);
          }

          return {
            ...event,
            winner: winner && winner.points > 0 ? winner : null
          };
        })
        .sort((a, b) => b.event_date.localeCompare(a.event_date)); // Sort to show most recent first

      setPastEvents(past);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, Organizer!</h1>
      <p className="text-slate-500 mb-8">Here's what's happening with your events</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl">📅</div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Events</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalEvents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">👥</div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Participants</p>
            <p className="text-3xl font-bold text-slate-800">{stats.totalParticipants}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span>🏆</span> Hall of Fame: Past Events
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastEvents.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl text-center text-slate-500 border-2 border-dashed border-slate-200">
            No past events found. When an event's date passes, it will appear here!
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
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Event Winner</p>
                      <p className="font-bold text-slate-800 text-lg">{event.winner.student_name}</p>
                      <p className="text-sm font-bold text-indigo-600">⭐ {event.winner.points} Points</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 text-sm py-2">
                    Scores haven't been published for this event yet.
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