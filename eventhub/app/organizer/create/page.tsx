// app/organizer/create/page.tsx
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
// NEW: Import the Google AI library
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function CreateEvent() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [checkingVenue, setCheckingVenue] = useState(false);
  const [venueStatus, setVenueStatus] = useState<"idle" | "available" | "conflict">("idle");
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Hackathon",
    max_participants: 50,
    event_date: "",
    start_time: "09:00",
    end_time: "17:00",
    venue: "Seminar Hall B",
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

  // --- 🚀 REAL AI GENERATOR FUNCTION ---
  const generateDescription = async () => {
    if (!formData.title) {
      alert("Please enter an Event Title first so the AI knows what to write about!");
      return;
    }
    
    setIsGenerating(true);

    try {
      // 1. Initialize Gemini (PASTE YOUR ACTUAL API KEY HERE)
      const genAI = new GoogleGenerativeAI("AIzaSyCdjwjSDSeLrEIUCcdPjdjCc6SdhwOI5EQ");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // 2. Give the AI a specific prompt based on what you typed
      const prompt = `Write an exciting, professional, and engaging 3-sentence event description for a college ${formData.category} titled "${formData.title}". Make it sound appealing to engineering students. Do not use hashtags.`;

      // 3. Call the API and wait for it to think
      const result = await model.generateContent(prompt);
      const generatedText = result.response.text();

      // 4. Update the text box!
      setFormData(prev => ({ ...prev, description: generatedText.trim() }));
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI Generation failed. Did you paste your API key?");
    } finally {
      setIsGenerating(false);
    }
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

      // Trigger n8n Webhook for Email
      await fetch("https://snehashenoy.app.n8n.cloud/webhook-test/b3dba974-2b58-4948-8438-4f293973d020", {
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
            
            {/* REAL AI GENERATOR BUTTON */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <button 
                  type="button" 
                  onClick={generateDescription}
                  disabled={isGenerating}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? "🤖 AI is thinking..." : "✨ Auto-Generate with AI"}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
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