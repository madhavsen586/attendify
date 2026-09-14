import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Users, 
  Clock, 
  Calendar, 
  MapPin, 
  PlusCircle, 
  StopCircle, 
  Download, 
  Eye, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Share2,
  Trash2,
  Building,
  UserCheck,
  BookOpen,
  QrCode as QrIcon
} from 'lucide-react';
import { User, AttendanceSession, Subject, AttendanceRecord } from '../types';
import { StorageService } from '../services/storageService';
import { PARUL_PIT_LOCATION } from '../data/initialData';
import { CreateSyllabusLogModal } from './CreateSyllabusLogModal';

interface TeacherDashboardProps {
  currentUser: User;
  onOpenCreateSession: () => void;
  onViewSessionDetails: (session: AttendanceSession) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  onOpenCreateSession,
  onViewSessionDetails,
}) => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [sessionRecords, setSessionRecords] = useState<AttendanceRecord[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [qrRotationCount, setQrRotationCount] = useState<number>(0);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState<boolean>(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reload data
  const refreshData = () => {
    const all = StorageService.getAllSessions();
    setSessions(all);
    const active = StorageService.getActiveSession();
    setActiveSession(active);
    if (active) {
      setSessionRecords(StorageService.getSessionRecords(active.id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = StorageService.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  // Timer loop for rotating dynamic QR code every 30 seconds (Anti-proxy protection as detailed in Chapter III)
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Trigger QR refresh
          StorageService.refreshSessionQr(activeSession.id);
          setQrRotationCount(c => c + 1);
          return 30; // reset to 30s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.id]);

  // Generate QR Canvas whenever active session or its secret changes
  useEffect(() => {
    if (!activeSession) {
      setQrCodeDataUrl('');
      return;
    }

    // QR Payload contains JSON for structured parsing
    const payload = JSON.stringify({
      sessionId: activeSession.id,
      secret: activeSession.qrSecret,
      subject: activeSession.subjectCode,
      room: activeSession.room,
      institution: 'Parul University - PIT',
      ts: activeSession.qrGeneratedAt,
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR code', err);
      });
  }, [activeSession?.qrSecret, activeSession?.id]);

  const handleEndSession = () => {
    if (!activeSession) return;
    StorageService.endSession(activeSession.id);
    refreshData();
  };

  // Simulate a student scanning (e.g. Madhav, Vaibhav, or classmate)
  const handleSimulateStudentScan = () => {
    if (!activeSession) return;
    const allUsers = StorageService.getAllUsers();
    const students = allUsers.filter(u => u.role === 'student');
    const existingScannedIds = sessionRecords.map(r => r.studentId);
    const availableStudents = students.filter(s => !existingScannedIds.includes(s.id));

    if (availableStudents.length === 0) {
      alert('All enrolled students have already marked attendance for this session!');
      return;
    }

    const nextStudent = availableStudents[0];
    const payload = JSON.stringify({
      sessionId: activeSession.id,
      secret: activeSession.qrSecret,
    });

    const res = StorageService.markAttendance({
      scannedPayload: payload,
      studentUser: nextStudent,
      studentCoords: {
        latitude: activeSession.location.latitude + (Math.random() - 0.5) * 0.0001,
        longitude: activeSession.location.longitude + (Math.random() - 0.5) * 0.0001,
      },
    });

    if (res.success) {
      refreshData();
    }
  };

  const handleExportCsv = (session: AttendanceSession) => {
    const records = StorageService.getSessionRecords(session.id);
    const allUsers = StorageService.getAllUsers().filter(u => u.role === 'student');

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'PARUL UNIVERSITY - PARUL INSTITUTE OF TECHNOLOGY VADODARA\n';
    csvContent += `Department of Computer Science & Engineering - Session AY 2025-26\n`;
    csvContent += `Subject: ${session.subjectName} (${session.subjectCode}),Date: ${session.date},Time: ${session.startTime},Room: ${session.room},Faculty: ${session.facultyName}\n\n`;
    csvContent += 'Enrollment No,Student Name,Status,Verification,Time Marked,Distance (GPS)\n';

    allUsers.forEach(s => {
      const record = records.find(r => r.studentId === s.id);
      if (record) {
        csvContent += `"${s.enrollmentNo || 'N/A'}","${s.name}","${record.status.toUpperCase()}","${record.locationVerified ? 'QR+GPS Verified' : 'Standard'}","${new Date(record.timestamp).toLocaleTimeString()}","${record.distanceMeters ?? 15}m"\n`;
      } else {
        csvContent += `"${s.enrollmentNo || 'N/A'}","${s.name}","ABSENT","N/A","--","--"\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${session.subjectCode}_${session.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation matching Page 39 + Daily Syllabus Logs
  const totalSessionsCount = sessions.length;
  const todaySessionsCount = sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length;
  const totalPresentToday = sessions
    .filter(s => s.date === new Date().toISOString().split('T')[0])
    .reduce((sum, s) => sum + s.presentCount, 0);
  const totalSyllabusLogs = StorageService.getAllSyllabusLogs().length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top 4 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sessions</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{totalSessionsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sessions</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{todaySessionsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Present</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalPresentToday}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => setIsSyllabusModalOpen(true)}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm flex items-center justify-between cursor-pointer group transition-colors"
          title="Click to record new syllabus log"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Syllabus Logs</p>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700">Faculty</span>
            </div>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{totalSyllabusLogs}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Active Session QR Card (Left) & Recent Sessions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Session QR Display matching PDF Page 39 */}
        <div className="lg:col-span-7">
          {activeSession ? (
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
              {/* Background gradient flare */}
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header Info */}
              <div className="flex items-start justify-between relative z-10 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
                      ACTIVE SESSION
                    </span>
                    <span className="text-xs text-slate-400">Started {activeSession.startTime}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>{activeSession.subjectCode}</span>
                    <span className="text-slate-400 text-lg font-normal">— {activeSession.subjectName}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{activeSession.room}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>GPS Radius: {activeSession.location.allowedRadiusMeters}m</span>
                  </p>

                  {/* Active Session Daily Syllabus Topic Banner */}
                  {activeSession.syllabusTopic && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-xs flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-300">Today's Class Topic</span>
                          {activeSession.lectureNo && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-900/90 text-[10px] font-mono font-bold text-indigo-200">
                              Lec #{activeSession.lectureNo}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200 font-medium text-xs mt-0.5">
                          {activeSession.syllabusTopic}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 30s Dynamic Refresh Countdown Badge matching PDF */}
                <div className="flex flex-col items-center bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                      {secondsRemaining}
                    </span>
                    <span className="text-xs text-emerald-400/80 font-bold">s</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    QR Refresh
                  </span>
                </div>
              </div>

              {/* QR Code Canvas Box */}
              <div className="relative z-10 bg-white p-6 rounded-2xl max-w-[320px] mx-auto shadow-2xl flex flex-col items-center justify-center border-4 border-slate-800/50">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Active Lecture QR Code"
                    className="w-64 h-64 select-none"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
                    Generating secure QR code...
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between w-full text-[11px] text-slate-500 font-mono px-2">
                  <span>Sec: {activeSession.qrSecret.slice(-6)}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Anti-Proxy
                  </span>
                </div>
              </div>

              {/* Real-time Present Counters */}
              <div className="relative z-10 mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
                  <p className="text-xl font-bold text-white">{activeSession.presentCount}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5 font-medium">Present</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
                  <p className="text-xl font-bold text-slate-300">
                    {Math.max(0, activeSession.totalEnrolled - activeSession.presentCount)}
                  </p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5 font-medium">Unmarked</p>
                </div>
                <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl">
                  <p className="text-xl font-bold text-emerald-400">
                    {Math.round((activeSession.presentCount / activeSession.totalEnrolled) * 100)}%
                  </p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5 font-medium">Turnout</p>
                </div>
              </div>

              {/* Action Buttons: Simulate Scan + End Session (matching PDF red button) */}
              <div className="relative z-10 mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleSimulateStudentScan}
                  className="w-full sm:flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-indigo-900/30"
                  id="simulate-scan-btn"
                  title="Simulate a student scanning in real-time"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Simulate Student Scan (Demo)</span>
                </button>

                <button
                  onClick={handleEndSession}
                  className="w-full sm:flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-rose-900/30"
                  id="end-session-btn"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              </div>

              {/* Recent scans ticker */}
              {sessionRecords.length > 0 && (
                <div className="relative z-10 mt-6 pt-4 border-t border-slate-800">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
                    Live Scanned Students ({sessionRecords.length})
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {sessionRecords.map(r => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-200 border border-slate-700"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span className="font-medium">{r.studentName}</span>
                        <span className="text-slate-400 text-[10px]">({new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                <QrIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Attendance Session</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Start a lecture session to generate a dynamic QR code for students to scan in class with GPS geofencing.
              </p>
              <button
                onClick={onOpenCreateSession}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all inline-flex items-center gap-2 cursor-pointer"
                id="start-session-prompt-btn"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Launch New QR Session</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Recent Sessions List matching PDF Page 39 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Sessions</h3>
                <p className="text-xs text-slate-500">Parul Institute of Technology CSE</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSyllabusModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors border border-indigo-200"
                  id="log-syllabus-btn"
                  title="Record Daily Syllabus Log for class"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Log Syllabus</span>
                </button>
                <button
                  onClick={onOpenCreateSession}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  id="new-session-btn"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Session</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{session.subjectCode}</span>
                        <span className="text-xs text-slate-600 truncate max-w-[160px]">
                          {session.subjectName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {session.date} • {session.startTime}
                      </p>
                    </div>

                    {session.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Live Now
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-700">
                        Concluded
                      </span>
                    )}
                  </div>

                  {/* Daily Syllabus topic preview */}
                  {session.syllabusTopic && (
                    <div className="mb-2.5 flex items-center gap-1.5 text-[11px] text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">Topic: {session.syllabusTopic}</span>
                      {session.lectureNo && (
                        <span className="ml-auto text-[10px] font-mono text-indigo-500 font-semibold shrink-0">
                          #{session.lectureNo}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{session.presentCount} present</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportCsv(session)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Download CSV Attendance Sheet"
                      >
                        <Download className="w-3 h-3 text-slate-500" />
                        <span>CSV</span>
                      </button>

                      <button
                        onClick={() => onViewSessionDetails(session)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateSyllabusLogModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        currentUser={currentUser}
        onLogSaved={refreshData}
      />
    </div>
  );
};
