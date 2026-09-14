import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Printer, 
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';
import { AttendanceSession, AttendanceRecord, User } from '../types';
import { StorageService } from '../services/storageService';

interface SessionDetailModalProps {
  session: AttendanceSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [search, setSearch] = useState('');

  const loadData = () => {
    if (!session) return;
    const sessionRecs = StorageService.getSessionRecords(session.id);
    setRecords(sessionRecs);
    const allStudents = StorageService.getAllUsers().filter(u => u.role === 'student');
    setStudents(allStudents);
  };

  useEffect(() => {
    if (session && isOpen) {
      loadData();
    }
  }, [session?.id, isOpen]);

  if (!isOpen || !session) return null;

  // Build full student status list
  const fullRoster = students.map(student => {
    const record = records.find(r => r.studentId === student.id);
    return {
      student,
      record,
      status: record ? record.status : ('absent' as const),
    };
  });

  const filteredRoster = fullRoster.filter(item => {
    const matchesSearch =
      item.student.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.student.enrollmentNo || '').includes(search);

    const matchesFilter =
      filter === 'all' ||
      (filter === 'present' && (item.status === 'present' || item.status === 'late')) ||
      (filter === 'absent' && item.status === 'absent');

    return matchesSearch && matchesFilter;
  });

  const presentCount = fullRoster.filter(r => r.status === 'present' || r.status === 'late').length;
  const absentCount = fullRoster.length - presentCount;
  const turnoutPercent = fullRoster.length > 0 ? Math.round((presentCount / fullRoster.length) * 100) : 0;

  const handleStatusChange = (student: User, newStatus: AttendanceRecord['status']) => {
    const existing = records.find(r => r.studentId === student.id);
    if (existing) {
      StorageService.updateRecordStatus(existing.id, newStatus);
    } else if (newStatus !== 'absent') {
      // Create manual attendance entry
      const newRec: AttendanceRecord = {
        id: `rec-manual-${Date.now()}-${student.id}`,
        sessionId: session.id,
        subjectCode: session.subjectCode,
        subjectName: session.subjectName,
        facultyName: session.facultyName,
        studentId: student.id,
        studentName: student.name,
        enrollmentNo: student.enrollmentNo || 'N/A',
        date: session.date,
        timestamp: new Date().toISOString(),
        status: newStatus,
        locationVerified: true,
        distanceMeters: 0,
        notes: 'Manual Faculty Override',
      };
      const allRecords = StorageService.getAllRecords();
      allRecords.unshift(newRec);
      localStorage.setItem('attendify_records', JSON.stringify(allRecords));
      StorageService.notifyUpdate('ATTENDANCE_MARKED');
    }
    loadData();
  };

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Parul Institute of Technology - Attendance Sheet\n`;
    csvContent += `Subject: ${session.subjectCode} - ${session.subjectName},Date: ${session.date},Room: ${session.room},Faculty: ${session.facultyName}\n\n`;
    csvContent += 'Enrollment No,Student Name,Status,Verification,Time Marked,Notes\n';

    fullRoster.forEach(({ student, record, status }) => {
      csvContent += `"${student.enrollmentNo || ''}","${student.name}","${status.toUpperCase()}","${record?.locationVerified ? 'QR+GPS' : 'Manual/None'}","${record ? new Date(record.timestamp).toLocaleTimeString() : '--'}","${record?.notes || ''}"\n`;
    });

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Attendance_${session.subjectCode}_${session.date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {session.subjectCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">{session.date} • {session.startTime}</span>
              {session.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Live Session
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{session.subjectName}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Faculty: {session.facultyName}</span>
              <span>•</span>
              <Building className="w-3.5 h-3.5 text-slate-400 inline" />
              <span>{session.room}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats summary bar */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-white px-6 py-3 text-center text-xs">
          <div>
            <span className="text-slate-400 font-medium">Total Present</span>
            <p className="text-lg font-bold text-emerald-600">{presentCount}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Total Absent</span>
            <p className="text-lg font-bold text-rose-600">{absentCount}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Turnout Percentage</span>
            <p className="text-lg font-bold text-indigo-600">{turnoutPercent}%</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or enrollment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({fullRoster.length})
            </button>
            <button
              onClick={() => setFilter('present')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'present' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              onClick={() => setFilter('absent')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                filter === 'absent' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Absent ({absentCount})
            </button>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <table className="w-full text-left text-xs text-slate-600">
            <thead>
              <tr className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="pb-2.5">Student</th>
                <th className="pb-2.5">Time Marked</th>
                <th className="pb-2.5">Verification</th>
                <th className="pb-2.5 text-right">Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.map(({ student, record, status }) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-slate-900">{student.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {student.enrollmentNo || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3">
                    {record ? (
                      <span className="text-slate-700 font-medium">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="py-3">
                    {record?.locationVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>GPS ({record.distanceMeters ?? 15}m)</span>
                      </span>
                    ) : record ? (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        QR Scanned
                      </span>
                    ) : (
                      <span className="text-[11px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded font-medium">
                        Unrecorded
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <select
                      value={status}
                      onChange={e => handleStatusChange(student, e.target.value as any)}
                      className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                        status === 'present'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : status === 'late'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <option value="present">Present</option>
                      <option value="late">Late Entry</option>
                      <option value="absent">Absent</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
