// app/organizer/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export default function OrganizerDashboard() {
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalParticipants: 0 });
  const [loading, setLoading] = useState(true);
  
  // This shield prevents React Strict Mode from double-injecting the data!
  const hasRun = useRef(false); 

  useEffect(() => {
    if (hasRun.current) return; // If it already ran, stop!
    hasRun.current = true;      // Mark it as run
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Fetch events to check if database is empty
      let eventsSnap = await getDocs(collection(db, "events"));

      // 2. AUTO-SEEDER: If empty, inject data securely
      if (eventsSnap.empty) {
        console.log("Database empty. Safely auto-injecting demo data...");

        // --- PAST EVENTS (For Hall of Fame) ---
        const e1 = await addDoc(collection(db, "events"), {
          title: "HackAI: GenAI Hackathon 2026", description: "A 24-hour intense hackathon focusing on building real-world AI applications.",
          category: "Hackathon", event_date: "2026-02-20", start_time: "09:00", end_time: "18:00", venue: "Computer Lab 1", max_participants: 120
        });
        await addDoc(collection(db, "registrations"), {
          event_id: e1.id, event_title: "HackAI: GenAI Hackathon 2026", student_name: "Sneha", department: "AIML", year: "3rd Year", ticket_id: "TKT-DEMO1", attended: true, points: 200
        });

        const e2 = await addDoc(collection(db, "events"), {
          title: "Sinchana Cultural Fest", description: "The biggest cultural extravaganza of the year! Music, dance, and art.",
          category: "Cultural", event_date: "2026-02-28", start_time: "17:00", end_time: "22:00", venue: "Auditorium", max_participants: 500
        });
        await addDoc(collection(db, "registrations"), {
          event_id: e2.id, event_title: "Sinchana Cultural Fest", student_name: "Rahul Sharma", department: "Mechanical", year: "4th Year", ticket_id: "TKT-DEMO2", attended: true, points: 150
        });

        const e3 = await addDoc(collection(db, "events"), {
          title: "Sahyadri Tech Seminar", description: "Industry experts from top tech companies share insights on cloud computing.",
          category: "Seminar", event_date: "2026-03-01", start_time: "10:00", end_time: "13:00", venue: "Seminar Hall B", max_participants: 100
        });
        await addDoc(collection(db, "registrations"), {
          event_id: e3.id, event_title: "Sahyadri Tech Seminar", student_name: "Alex Mitchell", department: "Computer Science", year: "2nd Year", ticket_id: "TKT-DEMO3", attended: true, points: 50
        });

        // --- FUTURE EVENTS (For Explore Page) ---
        await addDoc(collection(db, "events"), {
          title: "Robotics Workshop: Build a Bot", description: "Learn the basics of Arduino, sensors, and motor controls to build your first robot.",
          category: "Workshop", event_date: "2026-03-20", start_time: "14:00", end_time: "17:00", venue: "Electronics Lab", max_participants: 40
        });
        await addDoc(collection(db, "events"), {
          title: "Web3 & Blockchain Ideathon", description: "Pitch your decentralized app ideas to a panel of blockchain investors.",
          category: "Hackathon", event_date: "2026-03-25", start_time: "10:00", end_time: "15:00", venue: "Seminar Hall B", max_participants: 80
        });
        await addDoc(collection(db, "events"), {
          title: "Open Source Contribution Drive", description: "Learn how to make your first pull request on GitHub and contribute to major projects.",
          category: "Workshop", event_date: "2026-04-05", start_time: "15:00", end_time: "18:00", venue: "Computer Lab 2", max_participants: 60
        });

        // Re-fetch now that we have safely added the data
        eventsSnap = await getDocs(collection(db, "events"));
      }

      const events: any[] = [];
      eventsSnap.forEach((doc) => events.push({ id: doc.id, ...doc.data() }));

      // 3. Fetch registrations
      const regSnap = await getDocs(collection(db, "registrations"));
      const regs: any[] = [];
      regSnap.forEach((doc) => regs.push(doc.data()));

      setStats({ totalEvents: events.length, totalParticipants: regs.length });

      // 4. Calculate Hall of Fame
      const past = events
        .filter(e => e.event_date && e.event_date < today)
        .map(event => {
          const eventRegs = regs.filter(r => r.event_id === event.id || r.event_title === event.title);
          let winner = null;
          if (eventRegs.length > 0) {
            winner = eventRegs.reduce((prev, current) => ((prev.points || 0) > (current.points || 0)) ? prev : current);
          }
          return { ...event, winner: winner && winner.points > 0 ? winner : null };
        })
        .sort((a, b) => b.event_date.localeCompare(a.event_date));

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