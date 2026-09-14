import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Filter, 
  Search, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Bookmark, 
  FileText, 
  Presentation, 
  Sparkles, 
  Layers, 
  Hash, 
  ExternalLink,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { User, DailySyllabusLog, Subject } from '../types';
import { StorageService } from '../services/storageService';
import { CreateSyllabusLogModal } from './CreateSyllabusLogModal';

interface DailySyllabusLogViewProps {
  currentUser: User;
  isFacultyView: boolean;
}

export const DailySyllabusLogView: React.FC<DailySyllabusLogViewProps> = ({
  currentUser,
  isFacultyView,
}) => {
  const [logs, setLogs] = useState<DailySyllabusLog[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<DailySyllabusLog | null>(null);

  const loadData = () => {
    setSubjects(StorageService.getAllSubjects());
    const filtered = StorageService.getSyllabusLogsDateWise({
      subjectId: selectedSubjectFilter,
      searchQuery,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    setLogs(filtered);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = StorageService.subscribe(event => {
      if (
        event.type === 'SYLLABUS_LOG_CREATED' ||
        event.type === 'SYLLABUS_LOG_UPDATED' ||
        event.type === 'SYLLABUS_LOG_DELETED' ||
        event.type === 'RESET_COMPLETE'
      ) {
        loadData();
      }
    });
    return () => unsubscribe();
  }, [selectedSubjectFilter, searchQuery, startDate, endDate]);

  const handleDelete = (logId: string) => {
    if (!window.confirm('Are you sure you want to delete this syllabus log entry?')) return;
    const res = StorageService.deleteSyllabusLog(logId, currentUser);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to delete');
    }
  };

  // Pedagogy Badge styling
  const getPedagogyBadge = (mode: string) => {
    switch (mode) {
      case 'Lab Demonstration':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PPT & Multimedia':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Interactive Problem Solving':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Guest Lecture':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  // Group logs by date for clean chronological presentation
  const groupedByDate = logs.reduce<Record<string, DailySyllabusLog[]>>((acc, log) => {
    const d = log.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isFacultyView ? 'Faculty Daily Syllabus Log' : 'Class Diary & Daily Syllabus Tracker'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Date-wise Syllabus Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isFacultyView
              ? 'Record lecture syllabus coverage, track pedagogical delivery, and sync with student portal.'
              : 'Track what your professors have taught lecture-by-lecture, review covered topics, and access reading materials.'}
          </p>
        </div>

        {/* Action Buttons */}
        {isFacultyView && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditingLog(null);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 transition-colors cursor-pointer"
              id="faculty-add-syllabus-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Today's Syllabus</span>
            </button>
          </div>
        )}
      </div>

      {/* Curriculum Progress Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {subjects.map(subj => {
          const prog = StorageService.getSubjectSyllabusProgress(subj.id);
          return (
            <div
              key={subj.id}
              onClick={() => setSelectedSubjectFilter(subj.id === selectedSubjectFilter ? 'ALL' : subj.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedSubjectFilter === subj.id
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-black text-slate-800">{subj.code}</span>
                <span className="text-[11px] font-bold text-indigo-600">
                  {prog.percentage}%
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 truncate mb-2" title={subj.name}>
                {subj.name}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${prog.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{prog.coveredCount} / {prog.totalPlanned} Lectures</span>
                <span className="font-medium text-slate-600">
                  {prog.lastCoveredLog ? `Lec ${prog.lastCoveredLog.lectureNo}` : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search syllabus by topic, unit, or concept (e.g., AVL, Normalization, Banker)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="w-full md:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Subjects (All Courses)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            placeholder="From"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none"
            title="Start date filter"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            placeholder="To"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none"
            title="End date filter"
          />
        </div>
      </div>

      {/* Date-wise Feed */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Syllabus Logs Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isFacultyView
              ? 'No syllabus topics have been recorded for the selected filter. Click "Log Today\'s Syllabus" to record a lecture.'
              : 'No syllabus entries match your criteria. Check back once your professor logs lecture topics.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateKey => {
            const dateLogs = groupedByDate[dateKey];
            const dateObj = new Date(dateKey);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            const isToday = dateKey === new Date().toISOString().split('T')[0];

            return (
              <div key={dateKey} className="space-y-3">
                {/* Date Group Header */}
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
                    isToday
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
                    )}
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-400">
                    {dateLogs.length} {dateLogs.length === 1 ? 'Lecture' : 'Lectures'} Delivered
                  </span>
                </div>

                {/* Cards for each lecture on this date */}
                <div className="grid grid-cols-1 gap-4">
                  {dateLogs.map(log => (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow p-5 relative overflow-hidden"
                    >
                      {/* Top Row: Subject Code, Lecture #, Faculty, and Pedagogy Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-black text-xs">
                            {log.subjectCode}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {log.subjectName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Hash className="w-3 h-3 text-slate-400" />
                            Lecture #{log.lectureNo}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPedagogyBadge(log.teachingMode)}`}>
                            {log.teachingMode}
                          </span>

                          {/* Faculty Actions: Edit / Delete */}
                          {isFacultyView && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => {
                                  setEditingLog(log);
                                  setIsCreateModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit this syllabus log"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(log.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete log entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Unit & Topic Title */}
                      <div className="mb-3">
                        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                          {log.unitName}
                        </p>
                        <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                          {log.topicTitle}
                        </h4>
                      </div>

                      {/* Subtopics Covered Tags */}
                      {log.subtopicsCovered && log.subtopicsCovered.length > 0 && (
                        <div className="mb-3.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Subtopics Covered:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {log.subtopicsCovered.map((sub, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>{sub}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Learning Outcomes, Reference, and Homework grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                        {log.learningOutcomes ? (
                          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              Learning Outcome
                            </span>
                            <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                              {log.learningOutcomes}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/60 text-slate-400 text-[11px] italic">
                            No specific outcome noted.
                          </div>
                        )}

                        {log.referenceMaterials ? (
                          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                              <Bookmark className="w-3 h-3 text-amber-500" />
                              Readings / Reference
                            </span>
                            <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                              {log.referenceMaterials}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/60 text-slate-400 text-[11px] italic">
                            Textbook standard curriculum.
                          </div>
                        )}

                        {log.homeworkOrAssignment ? (
                          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-emerald-500" />
                              Homework / Assignment
                            </span>
                            <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                              {log.homeworkOrAssignment}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-slate-50/40 p-2.5 rounded-xl border border-slate-100/60 text-slate-400 text-[11px] italic">
                            No assignment assigned for this class.
                          </div>
                        )}
                      </div>

                      {/* Footer Metadata */}
                      <div className="mt-3.5 pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                        <span>
                          Delivered by: <strong className="text-slate-600 font-semibold">{log.facultyName}</strong>
                        </span>
                        {log.presentCount !== undefined && (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
                            Attendance: {log.presentCount} / {log.totalEnrolled || 60} Students Present
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Creating or Editing Syllabus Log */}
      <CreateSyllabusLogModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingLog(null);
        }}
        currentUser={currentUser}
        onLogSaved={() => loadData()}
        editingLog={editingLog}
      />
    </div>
  );
};
