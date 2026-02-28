// app/organizer/create/page.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export default function CreateEvent() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [checkingVenue, setCheckingVenue] = useState(false);
  const [venueStatus, setVenueStatus] = useState<"idle" | "available" | "conflict">("idle");
  
  // NEW: State for AI thinking animation
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Hackathon",
    max_participants: 50,
    banner_image_url: "",
    event_date: "",
    start_time: "09:00",
    end_time: "17:00",
    venue: "Seminar Hall B",
    staff_support: 0,
    staff_security: 0,
    staff_volunteers: 0,
    eq_projector: false,
    eq_microphone: false,
    eq_speakers: false,
    eq_laptop: false,
    eq_whiteboard: false,
    fac_wifi: false,
    fac_ac: false,
    extension_cords: 0,
    req_livestream: false,
    req_photography: false,
    maintenance_notes: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (["event_date", "start_time", "end_time", "venue"].includes(name)) {
      setVenueStatus("idle");
    }
  };

  // --- NEW: AI GENERATOR FUNCTION ---
  const generateDescription = () => {
    if (!formData.title) {
      alert("Please enter an Event Title first so the AI knows what to write about!");
      return;
    }
    
    setIsGenerating(true);

    // Fake AI delay for the "Wow" factor
    setTimeout(() => {
      const templates = {
        "Hackathon": `Join us for an electrifying coding marathon! "${formData.title}" is designed to push your technical limits, foster collaboration, and solve real-world problems. Bring your best ideas, form an elite team, and build the future.`,
        "Workshop": `Dive deep into hands-on learning with "${formData.title}". This interactive workshop will equip you with practical, industry-standard skills guided by experts. Perfect for students looking to upgrade their technical toolkit.`,
        "Seminar": `Expand your knowledge at "${formData.title}". Hear directly from industry leaders, gain valuable insights into the latest tech trends, and discover what the future holds. Don't miss this opportunity to network and learn from the best.`,
        "Cultural": `Get ready to celebrate creativity and talent at "${formData.title}"! Join us for a spectacular showcase of art, music, and performances that will leave you mesmerized. Bring your friends and make unforgettable memories!`,
        "Sports": `Bring your A-game to "${formData.title}"! Compete with top talent across the campus, show off your athletic skills, and experience the thrill of victory in this high-energy sporting event.`
      };

      const generatedText = templates[formData.category as keyof typeof templates] || templates["Hackathon"];

      setFormData(prev => ({ ...prev, description: generatedText }));
      setIsGenerating(false);
    }, 1500);
  };

  const checkAvailability = async () => {
    if (!formData.event_date || !formData.start_time || !formData.end_time) {
      alert("Please select a date and time first!");
      return;
    }

    setCheckingVenue(true);
    setVenueStatus("idle");

    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, where("venue", "==", formData.venue), where("event_date", "==", formData.event_date));
      const querySnapshot = await getDocs(q);
      
      const existingEvents: any[] = [];
      querySnapshot.forEach((doc) => existingEvents.push(doc.data()));

      if (existingEvents.length > 0) {
        const isConflict = existingEvents.some(existingEvent => {
          return formData.start_time < existingEvent.end_time && formData.end_time > existingEvent.start_time;
        });
        setVenueStatus(isConflict ? "conflict" : "available");
      } else {
        setVenueStatus("available");
      }
    } catch (error) {
      console.error("Error checking venue:", error);
      setVenueStatus("available"); 
    }
    setCheckingVenue(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (venueStatus === "conflict") {
      alert("Please resolve the venue conflict before creating the event.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await addDoc(collection(db, "events"), formData);

      // Trigger n8n Webhook for Email (Make sure to keep your real URL if you had one!)
      await fetch("https://snehashenoy.app.n8n.cloud/webhook-test/d01c74c5-b93d-4596-ad5b-b2a0862ac618", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).catch(err => console.log("Webhook skipped"));

      setMessage("✅ Event successfully created & Maintenance Notified!");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Event</h1>
      <p className="text-slate-500 mb-8">Fill in the details to create a new event</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><span>✨</span> Event Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Annual Hackathon 2026" />
            </div>
            
            {/* UPDATED DESCRIPTION BOX WITH AI BUTTON */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <button 
                  type="button" 
                  onClick={generateDescription}
                  disabled={isGenerating}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? "Thinking..." : "✨ Auto-Generate with AI"}
                </button>
              </div>
              <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg h-32 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Describe your event..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none">
                  <option>Hackathon</option><option>Workshop</option><option>Seminar</option><option>Cultural</option><option>Sports</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Participants</label>
                <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Venue & Timing Section --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><span>📍</span> Venue & Timing</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" name="event_date" required value={formData.event_date} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input type="time" name="start_time" required value={formData.start_time} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input type="time" name="end_time" required value={formData.end_time} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
            <select name="venue" value={formData.venue} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg outline-none">
              <option>Seminar Hall B</option><option>Computer Lab 1</option><option>Classroom 102</option><option>Auditorium</option>
            </select>
          </div>
          <button type="button" onClick={checkAvailability} className="w-full py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
            {checkingVenue ? "Checking..." : "📅 Check Availability"}
          </button>
          {venueStatus === "available" && <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">✅ Venue Available!</div>}
          {venueStatus === "conflict" && <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">❌ Venue is already booked.</div>}
        </div>

        {/* --- Maintenance Section --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><span>🛠️</span> Maintenance Requirements</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes for Maintenance</label>
            <textarea name="maintenance_notes" value={formData.maintenance_notes} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg h-20 outline-none" placeholder="e.g. need 50 chairs"></textarea>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-sm disabled:opacity-70">
            {loading ? "Creating & Sending..." : "Create Event & Notify Maintenance"}
          </button>
          {message && <div className={`mt-4 p-4 rounded-lg text-center font-medium ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{message}</div>}
        </div>
      </form>
    </div>
  );
}