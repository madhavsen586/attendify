import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  BookOpen, 
  Search, 
  Filter,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { User, AttendanceRecord, StudentSubjectStat } from '../types';
import { StorageService } from '../services/storageService';
import { DailySyllabusLogView } from './DailySyllabusLogView';

interface StudentDashboardProps {
  currentUser: User;
  onOpenScanner: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onOpenScanner,
}) => {
  const [activeView, setActiveView] = useState<'attendance' | 'syllabus'>('attendance');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<{
    overallPercentage: number;
    totalPresent: number;
    totalAbsent: number;
    subjectStats: StudentSubjectStat[];
  }>({
    overallPercentage: 86,
    totalPresent: 24,
    totalAbsent: 4,
    subjectStats: [],
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  const loadStudentData = () => {
    const studentRecords = StorageService.getStudentRecords(currentUser.id);
    setRecords(studentRecords);
    const calculatedStats = StorageService.getStudentSubjectStats(currentUser.id);
    setStats(calculatedStats);
  };

  useEffect(() => {
    loadStudentData();
    const unsubscribe = StorageService.subscribe(() => {
      loadStudentData();
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  const filteredRecords = records.filter(rec => {
    const matchesSearch =
      rec.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.facultyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === 'ALL' || rec.subjectCode === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  const activeSession = StorageService.getActiveSession();
  const alreadyMarkedActiveSession = activeSession
    ? records.some(r => r.sessionId === activeSession.id)
    : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section matching PDF Page 37 top */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Academic Portal
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Active Student
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Roll No: <span className="text-slate-800 font-mono font-semibold">{currentUser.enrollmentNo || '2303051051127'}</span> • {currentUser.department || 'Computer Science & Engineering'} (PIT Vadodara)
          </p>

          {/* Dual Tab Switcher: Attendance vs Syllabus Tracker */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setActiveView('attendance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              id="tab-student-attendance"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Attendance ({stats.overallPercentage}%)</span>
            </button>
            <button
              onClick={() => setActiveView('syllabus')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'syllabus'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              id="tab-student-syllabus"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daily Syllabus Log</span>
            </button>
          </div>
        </div>

        {/* Scan QR Code Action Button matching PDF Page 37 */}
        <button
          onClick={onOpenScanner}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group shrink-0"
          id="student-scan-qr-btn"
        >
          <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>— Scan QR Code</span>
        </button>
      </div>

      {activeView === 'syllabus' ? (
        <DailySyllabusLogView currentUser={currentUser} isFacultyView={false} />
      ) : (
        <>
          {/* Live Lecture Banner (if teacher has active QR session running) */}
          {activeSession && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-indigo-700">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Live Attendance Open
                    </span>
                    <span className="text-xs text-slate-300">Faculty: {activeSession.facultyName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeSession.subjectCode}: {activeSession.subjectName}
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeSession.room}</span>
                    <span>•</span>
                    <span>Closes in {Math.max(0, Math.round((activeSession.expiresAt - Date.now()) / 60000))}m</span>
                  </p>

                  {/* Active syllabus topic */}
                  {activeSession.syllabusTopic && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-xs text-indigo-200">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Today's Topic: <strong className="text-white">{activeSession.syllabusTopic}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {alreadyMarkedActiveSession ? (
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Marked Present ✓</span>
                  </div>
                ) : (
                  <button
                    onClick={onOpenScanner}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="quick-scan-live-btn"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan to Mark Present</span>
                  </button>
                )}
              </div>
            </div>
          )}

      {/* 4 Stat Cards matching PDF Page 37 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Overall Percentage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Attendance</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stats.overallPercentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${
              stats.overallPercentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {stats.overallPercentage}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Target: 75%</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                stats.overallPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(stats.overallPercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Total Present */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Present</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">{stats.totalPresent}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Verified lecture attendances</p>
        </div>

        {/* Card 3: Total Absent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Absent</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{stats.totalAbsent}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Missed or unrecorded classes</p>
        </div>

        {/* Card 4: Total Subjects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.subjectStats.length || 5}</p>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">Sem VI Computer Science</p>
        </div>
      </div>

      {/* University Compliance 75% Criteria Warning Banner */}
      {stats.overallPercentage < 75 ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Attendance Shortfall Notice: </span>
            Your current aggregate attendance is {stats.overallPercentage}%, which is below the mandatory 75% Parul University semester eligibility criteria. Please attend all upcoming lectures to avoid detention.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Examination Eligible: </span>
            Your attendance is {stats.overallPercentage}%, exceeding Parul University's mandatory 75% minimum threshold for CSE VI Semester end exams.
          </div>
        </div>
      )}

      {/* Subject-Wise Attendance Breakdown matching PDF Page 37 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Subject-wise Attendance</h3>
            <p className="text-xs text-slate-500">Parul Institute of Technology CSE VI Semester</p>
          </div>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
            5 Enrolled Subjects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.subjectStats.map(sub => (
            <div
              key={sub.subjectId}
              className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{sub.subjectCode}</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{sub.subjectName}</h4>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  sub.percentage >= 75
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {sub.percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3 mt-3 overflow-hidden">
                <div
                  className={`h-2 rounded-full ${
                    sub.percentage >= 75 ? 'bg-indigo-600' : 'bg-rose-500'
                  }`}
                  style={{ width: `${sub.percentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                <span>Attended: {sub.attendedClasses} / {sub.totalClasses}</span>
                <span className={sub.percentage >= 75 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                  {sub.percentage >= 75 ? 'Compliant' : 'Shortfall'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance History Log Table matching PDF Page 37 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Attendance History</h3>
            <p className="text-xs text-slate-500">Verified QR code scans and faculty attendance logs</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject or faculty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Subject filter */}
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Subjects</option>
              <option value="CS601">CS601 - DSA</option>
              <option value="CS602">CS602 - OS</option>
              <option value="CS603">CS603 - DBMS</option>
              <option value="CS604">CS604 - WT</option>
              <option value="CS605">CS605 - AI</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Subject</th>
                <th className="pb-3 px-3">Faculty</th>
                <th className="pb-3 px-3">Date & Time</th>
                <th className="pb-3 px-3">Verification</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{record.subjectCode}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{record.subjectName}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {record.facultyName}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium">{record.date}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      {record.locationVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>GPS Verified ({record.distanceMeters ?? 18}m)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {record.status === 'present' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          Present
                        </span>
                      )}
                      {record.status === 'late' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          Late Entry
                        </span>
                      )}
                      {record.status === 'absent' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No attendance records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
