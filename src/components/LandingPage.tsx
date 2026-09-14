import React from 'react';
import { 
  QrCode, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { INITIAL_USERS } from '../data/initialData';

interface LandingPageProps {
  onOpenLogin: (roleHint?: 'student' | 'teacher') => void;
  onOpenReportModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenReportModal,
}) => {
  const teacherDemo = INITIAL_USERS[0]; // Dr. Shiv Shakti
  const studentDemo = INITIAL_USERS[2]; // Madhav Sen

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 pb-20">
      {/* Hero Section matching PDF Page 37 screenshot */}
      <section className="relative pt-16 sm:pt-24 pb-16 px-4 max-w-5xl mx-auto text-center">
        {/* Anti-Proxy pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span>● QR Code + GPS Attendance System</span>
        </div>

        {/* Big Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Mark Attendance <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
            Smarter & Safer
          </span>
        </h1>

        {/* Subtitle from PDF Page 37 */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Generate dynamic QR codes. Verify student location in real-time using GPS. 
          Prevent proxy attendance with one-time scans.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-14">
          <button
            onClick={() => onOpenLogin('student')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            id="hero-start-free-btn"
          >
            <span>Sign In as Student</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => onOpenLogin('teacher')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            id="hero-login-teacher-btn"
          >
            <span>Faculty Login</span>
          </button>
        </div>

        {/* Fast Demo Role Selectors (as specified in PDF Page 36 demo accounts) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Demo Access (Parul University AY 2025-26)
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Requires credentials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Student Pill */}
            <div 
              onClick={() => onOpenLogin('student')}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Student Portal</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600">Enter Credentials</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{studentDemo.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">Enr: {studentDemo.enrollmentNo}</p>
            </div>

            {/* Teacher Pill */}
            <div 
              onClick={() => onOpenLogin('teacher')}
              className="p-3 rounded-xl border border-slate-200 hover:border-violet-400 bg-slate-50/70 hover:bg-violet-50/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 group-hover:text-violet-700">Faculty Portal</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-slate-200 text-slate-600">Enter Credentials</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{teacherDemo.name}</p>
              <p className="text-[11px] text-slate-400">Assistant Professor, CSE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillar Features matching Report Section 3.7 & 3.8 */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Key Highlights from Minor Project Report
          </h2>
          <p className="text-sm text-slate-500">
            Designed and engineered for Parul Institute of Technology, Vadodara to eliminate manual roll-call paperwork and proxy attendance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Dynamic Rotating QR Codes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates session-specific dynamic QR codes that refresh every 30 seconds on the projector. Prevents students from sharing static photos or screenshots on messaging groups.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">GPS Geofence Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Validates device location against the classroom's coordinates (PIT Block Lab 402) with a configurable radius (e.g. 150m). Scans attempted off-campus are automatically rejected.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Strict Anti-Proxy Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enforces one scan per student per session, records timestamp and device fingerprinting, and flags duplicate or out-of-bounds scan attempts in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Project Credits Footer Card */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Parul University Minor Project</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">
              Department of Computer Science & Engineering (PIT Vadodara)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Created by: Madhav Sen (2303051051127), Vaibhav Yadav (2303051051082), Parmar Keval (2303051051139)
            </p>
            <p className="text-xs text-slate-500">
              Under the Guidance of: Dr. Shiv Shakti Shrivastava (Assistant Professor, CSE)
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Read Project Overview</span>
          </button>
        </div>
      </section>
    </div>
  );
};
