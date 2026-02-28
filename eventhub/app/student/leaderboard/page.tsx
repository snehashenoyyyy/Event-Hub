// app/student/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateLeaderboard() {
      try {
        const querySnapshot = await getDocs(collection(db, "registrations"));
        const aggregated: Record<string, any> = {};
        
        querySnapshot.forEach((doc) => {
          const reg = doc.data() as any;
          if (reg.points && reg.points > 0) {
            if (!aggregated[reg.student_name]) {
              aggregated[reg.student_name] = {
                name: reg.student_name,
                department: reg.department,
                year: reg.year,
                totalPoints: 0,
                eventsAttended: 0
              };
            }
            aggregated[reg.student_name].totalPoints += reg.points;
            aggregated[reg.student_name].eventsAttended += 1;
          }
        });

        const sortedLeaders = Object.values(aggregated).sort((a, b) => b.totalPoints - a.totalPoints);
        setLeaders(sortedLeaders);
      } catch (error) {
        console.error("Error generating leaderboard:", error);
      }
      setLoading(false);
    }
    calculateLeaderboard();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  const topThree = leaders.slice(0, 3);
  const theRest = leaders.slice(3);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-3"><span>🏆</span> Global Leaderboard</h1>
        <p className="text-slate-500">Top performers across all events</p>
      </div>
      {/* Top 3 Podium View */}
      {topThree.length > 0 && (
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-12 h-64">
          {topThree[1] && (
            <div className="bg-white p-6 rounded-t-3xl shadow-md border-t-4 border-slate-300 w-full md:w-64 text-center relative flex flex-col items-center h-48 justify-end">
              <div className="absolute -top-8 w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500 shadow-sm border-4 border-white">2</div>
              <h3 className="font-bold text-slate-800">{topThree[1].name}</h3>
              <p className="text-xs text-slate-500 mb-2">{topThree[1].department}</p>
              <div className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full font-bold text-xl flex items-center gap-1"><span>⭐</span> {topThree[1].totalPoints}</div>
            </div>
          )}
          <div className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-t-3xl shadow-lg border-t-4 border-yellow-400 w-full md:w-72 text-center relative flex flex-col items-center h-64 justify-end z-10 transform scale-105">
            <div className="absolute -top-10 w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl font-bold text-yellow-600 shadow-sm border-4 border-white">👑</div>
            <h3 className="font-bold text-xl text-slate-800">{topThree[0].name}</h3>
            <p className="text-sm text-slate-500 mb-4">{topThree[0].department}</p>
            <div className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full font-bold text-3xl flex items-center gap-2 shadow-inner"><span>⭐</span> {topThree[0].totalPoints}</div>
          </div>
          {topThree[2] && (
            <div className="bg-white p-6 rounded-t-3xl shadow-md border-t-4 border-orange-300 w-full md:w-64 text-center relative flex flex-col items-center h-40 justify-end">
              <div className="absolute -top-8 w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-2xl font-bold text-orange-500 shadow-sm border-4 border-white">3</div>
              <h3 className="font-bold text-slate-800">{topThree[2].name}</h3>
              <p className="text-xs text-slate-500 mb-2">{topThree[2].department}</p>
              <div className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full font-bold text-xl flex items-center gap-1"><span>⭐</span> {topThree[2].totalPoints}</div>
            </div>
          )}
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {theRest.length === 0 && topThree.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No points have been awarded yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {theRest.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="text-slate-400 font-bold text-xl w-8 text-center">#{index + 4}</div>
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">{student.name.charAt(0)}</div>
                  <div><h4 className="font-bold text-slate-800 text-lg">{student.name}</h4><p className="text-sm text-slate-500">{student.department} • {student.year}</p></div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600 flex items-center justify-end gap-1"><span className="text-lg">⭐</span> {student.totalPoints}</div>
                  <p className="text-xs text-slate-400 font-medium">{student.eventsAttended} events</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}