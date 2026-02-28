// app/organizer/venues/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

export default function VenueBooking() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("Seminar Hall B");
  
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "conflict">("idle");
  const [dayBookings, setDayBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (!date) return;
    
    async function fetchBookings() {
      setLoadingBookings(true);
      try {
        const q = query(collection(db, "events"), where("event_date", "==", date));
        const querySnapshot = await getDocs(q);
        const bookings: any[] = [];
        querySnapshot.forEach((doc) => bookings.push(doc.data()));
        
        // Sort by start time
        bookings.sort((a, b) => a.start_time.localeCompare(b.start_time));
        setDayBookings(bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
      setLoadingBookings(false);
    }
    
    fetchBookings();
  }, [date]);

  const handleCheck = () => {
    if (!date || !startTime || !endTime) {
      alert("Please fill in all fields");
      return;
    }
    setStatus("checking");
    const venueBookings = dayBookings.filter(b => b.venue === venue);
    const isConflict = venueBookings.some(b => startTime < b.end_time && endTime > b.start_time);
    setTimeout(() => setStatus(isConflict ? "conflict" : "available"), 500);
  };

  const handleConfirm = async () => {
    if (status !== "available") return;
    try {
      await addDoc(collection(db, "events"), {
        title: "Direct Venue Reservation",
        category: "Other",
        max_participants: 0,
        event_date: date,
        start_time: startTime,
        end_time: endTime,
        venue: venue
      });
      alert("✅ Venue successfully booked!");
      setStatus("idle");
      
      // Refresh the list
      const q = query(collection(db, "events"), where("event_date", "==", date));
      const querySnapshot = await getDocs(q);
      const bookings: any[] = [];
      querySnapshot.forEach((doc) => bookings.push(doc.data()));
      bookings.sort((a, b) => a.start_time.localeCompare(b.start_time));
      setDayBookings(bookings);
    } catch (error) {
      alert("Error booking venue.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Venue Booking</h1>
      <p className="text-slate-500 mb-8">Check availability and reserve venues directly</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" value={date} onChange={(e) => {setDate(e.target.value); setStatus("idle");}} className="w-full p-3 border border-slate-200 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => {setStartTime(e.target.value); setStatus("idle");}} className="w-full p-3 border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => {setEndTime(e.target.value); setStatus("idle");}} className="w-full p-3 border border-slate-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
                <select value={venue} onChange={(e) => {setVenue(e.target.value); setStatus("idle");}} className="w-full p-3 border border-slate-200 rounded-lg">
                  <option>Seminar Hall B</option>
                  <option>Computer Lab 1</option>
                  <option>Classroom 102</option>
                  <option>Auditorium</option>
                </select>
              </div>
              
              <button onClick={handleCheck} className="w-full py-3 border-2 border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition-colors mt-4">
                {status === "checking" ? "Checking..." : "Check Availability"}
              </button>

              {status === "available" && (
                <button onClick={handleConfirm} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors mt-2">
                  Confirm Booking
                </button>
              )}

              {status === "conflict" && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium mt-2 border border-red-200">
                  Venue is already booked at this time.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📅</span> Bookings for {date ? new Date(date).toLocaleDateString() : "Selected Date"}
            </h2>
            
            {!date ? (
              <div className="flex items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">Select a date to see the schedule</div>
            ) : loadingBookings ? (
              <div className="text-center text-slate-500 py-8">Loading schedule...</div>
            ) : dayBookings.length === 0 ? (
              <div className="text-center text-slate-500 py-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">No bookings for this date.</div>
            ) : (
              <div className="space-y-3">
                {dayBookings.map((booking, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xl">📍</div>
                      <div>
                        <h3 className="font-bold text-slate-800">{booking.venue}</h3>
                        <p className="text-sm text-slate-500">{booking.title}</p>
                      </div>
                    </div>
                    <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
                      {booking.start_time} - {booking.end_time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}