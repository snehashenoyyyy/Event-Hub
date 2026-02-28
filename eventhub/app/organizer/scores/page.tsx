// app/organizer/scores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function ManageScores() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const querySnapshot = await getDocs(collection(db, "registrations"));
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching scores:", error);
    }
    setLoading(false);
  }

  const handleUpdate = async (id: string, field: string, value: any) => {
    setRegistrations((prev) => 
      prev.map((reg) => reg.id === id ? { ...reg, [field]: value } : reg)
    );
    try {
      const regRef = doc(db, "registrations", id);
      await updateDoc(regRef, { [field]: value });
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  // --- NEW: EXPORT TO CSV FUNCTION ---
  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert("No data to export!");
      return;
    }

    // 1. Create the CSV headers
    const headers = ["Student Name,Department,Year,Event Title,Attended,Points"];
    
    // 2. Map the data into rows
    const rows = registrations.map(reg => {
      return `"${reg.student_name}","${reg.department}","${reg.year}","${reg.event_title || 'Unknown'}","${reg.attended ? 'Yes' : 'No'}","${reg.points || 0}"`;
    });

    // 3. Combine and trigger download
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Event_Scores_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading participants...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Updated Header with Export Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Manage Scores</h1>
          <p className="text-slate-500">Award points to participants after events</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 px-4 rounded-lg transition-colors border border-emerald-200"
        >
          <span>📊</span> Export to Excel/CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500">
              <th className="p-4 font-medium">Participant</th>
              <th className="p-4 font-medium">Event</th>
              <th className="p-4 font-medium text-center">Attended</th>
              <th className="p-4 font-medium text-center">Points</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">No registrations yet.</td></tr>
            )}
            {registrations.map((reg) => (
              <tr key={reg.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{reg.student_name}</p>
                  <p className="text-xs text-slate-500">{reg.department} • {reg.year}</p>
                </td>
                <td className="p-4 text-sm text-slate-600 font-medium">
                  {reg.event_title || "Unknown Event"}
                </td>
                <td className="p-4 text-center">
                  <input type="checkbox" checked={reg.attended || false} onChange={(e) => handleUpdate(reg.id, "attended", e.target.checked)} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer" />
                </td>
                <td className="p-4 text-center">
                  <input type="number" value={reg.points || 0} onChange={(e) => handleUpdate(reg.id, "points", parseInt(e.target.value) || 0)} className="w-20 p-2 text-center border border-slate-200 rounded-lg font-bold text-indigo-700 bg-indigo-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}