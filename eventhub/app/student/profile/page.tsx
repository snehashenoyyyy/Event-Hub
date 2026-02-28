// app/student/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function StudentProfile() {
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studentName = "Alex Mitchell"; 

  useEffect(() => {
    async function fetchMyProfileData() {
      try {
        const q = query(collection(db, "registrations"), where("student_name", "==", studentName));
        const querySnapshot = await getDocs(q);
        const regs: any[] = [];
        querySnapshot.forEach((doc) => regs.push({ id: doc.id, ...doc.data() }));
        setMyRegistrations(regs);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    }
    fetchMyProfileData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const totalPoints = myRegistrations.reduce((sum, reg) => sum + (reg.points || 0), 0);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white mb-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl border-4 border-white/30 backdrop-blur-sm shadow-inner">👨‍🎓</div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Hey, {studentName}!</h1>
            <div className="flex gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium border border-white/10">Computer Science</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium border border-white/10">3rd Year</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">🏆</div>
          <p className="text-3xl font-bold text-slate-800">{totalPoints}</p>
          <p className="text-sm text-slate-500 font-medium">Total Points</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">⭐</div>
          <p className="text-3xl font-bold text-slate-800">{myRegistrations.length}</p>
          <p className="text-sm text-slate-500 font-medium">Events Registered</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">📋 My Registrations</h2>
        <div className="space-y-4">
          {myRegistrations.length === 0 ? (
            <div className="text-center text-slate-500 py-8 border-2 border-dashed border-slate-100 rounded-xl">You haven't registered for any events yet.</div>
          ) : (
            myRegistrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl">📅</div>
                  <div>
                    <h3 className="font-bold text-slate-800">{reg.event_title || "Unknown Event"}</h3>
                    <p className="text-sm text-slate-500">Ticket: <span className="font-mono text-xs">{reg.ticket_id}</span></p>
                  </div>
                </div>
                {reg.points > 0 ? (
                  <div className="flex items-center gap-1 text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100"><span>⭐</span> {reg.points}</div>
                ) : (
                  <div className="text-sm text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-lg">Upcoming</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}