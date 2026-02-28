// app/organizer/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AnalyticsDashboard() {
  const [deptData, setDeptData] = useState<any[]>([]);
  const [yearData, setYearData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // 1. Fetch Registrations
        const regSnapshot = await getDocs(collection(db, "registrations"));
        const regs: any[] = [];
        regSnapshot.forEach((doc) => regs.push(doc.data()));
        
        const depts = regs.reduce((acc: any, curr: any) => {
          if(curr.department) acc[curr.department] = (acc[curr.department] || 0) + 1;
          return acc;
        }, {});
        setDeptData(Object.keys(depts).map(key => ({ name: key.substring(0, 2), full: key, count: depts[key] })));

        const years = regs.reduce((acc: any, curr: any) => {
          if(curr.year) acc[curr.year] = (acc[curr.year] || 0) + 1;
          return acc;
        }, {});
        setYearData(Object.keys(years).map(key => ({ name: key, value: years[key] })));

        // 2. Fetch Events
        const eventSnapshot = await getDocs(collection(db, "events"));
        const events: any[] = [];
        eventSnapshot.forEach((doc) => events.push(doc.data()));
        
        const categories = events.reduce((acc: any, curr: any) => {
          if(curr.category) acc[curr.category] = (acc[curr.category] || 0) + 1;
          return acc;
        }, {});
        setCategoryData(Object.keys(categories).map(key => ({ name: key, count: categories[key] })));
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Analytics</h1>
      <p className="text-slate-500 mb-8">Data-driven insights for your college events</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Department-wise Participation</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Year-wise Breakdown</h2>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={yearData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {yearData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80 flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Events by Category</h2>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}