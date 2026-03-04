// app/student/explore/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";

export default function ExploreEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- DEMO STUDENT PROFILE ---
  // Hardcoded for the hackathon demo so registration works instantly!
  const studentDemoDetails = {
    student_name: "Sneha",
    department: "AIML",
    year: "3rd Year"
  };

  // --- DYNAMIC IMAGE MAPPER ---
  const getCategoryImage = (category: string) => {
    const images: Record<string, string> = {
      "Hackathon": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
      "Workshop": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
      "Seminar": "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=800",
      "Cultural": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
      "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800"
    };
    return images[category] || images["Hackathon"]; // Default fallback
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      // Get today's date in YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // 1. Fetch all events
      const eventsSnap = await getDocs(collection(db, "events"));
      const fetchedEvents: any[] = [];
      eventsSnap.forEach((doc) => {
        const data = doc.data();
        // ONLY show events happening today or in the future!
        if (data.event_date >= today) {
          fetchedEvents.push({ id: doc.id, ...data });
        }
      });

      // Sort by soonest upcoming date
      fetchedEvents.sort((a, b) => a.event_date.localeCompare(b.event_date));
      setEvents(fetchedEvents);

      // 2. Fetch existing registrations so we can disable the button if already registered
      const q = query(collection(db, "registrations"), where("student_name", "==", studentDemoDetails.student_name));
      const regsSnap = await getDocs(q);
      const userRegs = new Set<string>();
      regsSnap.forEach((doc) => userRegs.add(doc.data().event_id));
      
      setRegisteredIds(userRegs);

    } catch (error) {
      console.error("Error fetching events:", error);
    }
    setLoading(false);
  }

  const handleRegister = async (event: any) => {
    setProcessingId(event.id);
    try {
      // Generate a random ticket ID
      const ticketId = "TKT-" + Math.floor(1000 + Math.random() * 9000);
      
      await addDoc(collection(db, "registrations"), {
        event_id: event.id,
        event_title: event.title,
        student_name: studentDemoDetails.student_name,
        department: studentDemoDetails.department,
        year: studentDemoDetails.year,
        ticket_id: ticketId,
        attended: false,
        points: 0
      });

      // Update UI instantly
      setRegisteredIds(prev => new Set(prev).add(event.id));
      alert(`✅ Successfully registered for ${event.title}! Your E-Ticket ID is ${ticketId}`);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("❌ Failed to register. Please try again.");
    }
    setProcessingId(null);
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading upcoming events...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Explore Events</h1>
        <p className="text-slate-500">Discover and register for upcoming campus activities.</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No upcoming events found. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isRegistered = registeredIds.has(event.id);
            const isProcessing = processingId === event.id;

            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
                
                {/* --- DYNAMIC IMAGE HEADER --- */}
                <div 
                  className="h-48 w-full bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${getCategoryImage(event.category)})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 shadow-sm">
                    {event.category}
                  </span>
                </div>

                {/* --- CARD BODY --- */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1" title={event.title}>
                    {event.title}
                  </h3>
                  
                  <p className="text-sm text-slate-500 mb-5 line-clamp-2 flex-1">
                    {event.description || "Join us for this exciting campus event!"}
                  </p>

                  <div className="space-y-2 mb-6 text-sm font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500 text-base">📅</span>
                      {event.event_date}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500 text-base">⏰</span>
                      {event.start_time} - {event.end_time}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-500 text-base">📍</span>
                      {event.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-base">👥</span>
                      {event.max_participants} Spots Total
                    </div>
                  </div>

                  {/* --- REGISTRATION BUTTON --- */}
                  <button 
                    onClick={() => handleRegister(event)}
                    disabled={isRegistered || isProcessing}
                    className={`w-full py-3 rounded-xl font-bold transition-all duration-200 shadow-sm flex justify-center items-center gap-2 ${
                      isRegistered 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md"
                    }`}
                  >
                    {isProcessing ? "Processing..." : isRegistered ? "✅ Registered" : "Register Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}