// app/student/explore/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import QRCode from "react-qr-code";

export default function ExploreEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalState, setModalState] = useState<"closed" | "form" | "processing" | "success">("closed");
  const [regData, setRegData] = useState({ name: "Alex Mitchell", department: "Computer Science", year: "3rd Year" });
  const [ticketId, setTicketId] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsList: any[] = [];
        querySnapshot.forEach((doc) => {
          eventsList.push({ id: doc.id, ...doc.data() });
        });
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const openRegistration = (event: any) => {
    setSelectedEvent(event);
    setModalState("form");
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setModalState("processing");

    const newTicketId = "TKT-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    try {
      // Save Registration to Firebase
      await addDoc(collection(db, "registrations"), {
        event_id: selectedEvent.id,
        event_title: selectedEvent.title, // Storing title directly to make leaderboard easier later
        student_name: regData.name,
        department: regData.department,
        year: regData.year,
        ticket_id: newTicketId,
        attended: false,
        points: 0
      });

      setTimeout(() => {
        setTicketId(newTicketId);
        setModalState("success");
      }, 1500);
    } catch (error) {
      alert("Registration failed. Please try again.");
      setModalState("form");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto relative">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Explore Events</h1>
      <p className="text-slate-500 mb-8">Discover and register for upcoming college events</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="h-32 bg-slate-100 relative">
              <span className="absolute top-4 left-4 bg-white/90 text-xs font-bold px-3 py-1 rounded-full text-indigo-700 shadow-sm">{event.category}</span>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h2>
              <div className="space-y-2 mb-6 flex-1 text-sm text-slate-500">
                <p>📅 {event.event_date}</p>
                <p>⏰ {event.start_time} - {event.end_time}</p>
                <p>📍 {event.venue}</p>
                <p>👥 {event.max_participants} Spots</p>
              </div>
              <button onClick={() => openRegistration(event)} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 rounded-xl transition-colors">
                Register Now
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="col-span-full bg-white p-8 rounded-xl text-center text-slate-500 border border-slate-100">No events found. Go create one!</div>}
      </div>

      {/* MODAL */}
      {modalState !== "closed" && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button onClick={() => setModalState("closed")} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">✕</button>

            {modalState === "form" && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Complete Registration</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                    <input type="text" required value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <select value={regData.department} onChange={(e) => setRegData({...regData, department: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg">
                      <option>Computer Science</option><option>Electrical</option><option>Mechanical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                    <select value={regData.year} onChange={(e) => setRegData({...regData, year: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg">
                      <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold mt-4">Confirm Registration</button>
                </form>
              </div>
            )}

            {modalState === "processing" && (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-slate-500 font-medium">Processing...</p>
              </div>
            )}

            {modalState === "success" && (
              <div>
                <div className="bg-green-500 text-white p-4 text-center font-bold">✅ Registration successful!</div>
                <div className="p-8 flex flex-col items-center">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">E-Ticket</h3>
                  <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm mb-6 mt-4">
                    <QRCode value={ticketId} size={150} fgColor="#1e1b4b" />
                  </div>
                  <p className="font-mono text-indigo-600 font-bold text-lg">{ticketId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}