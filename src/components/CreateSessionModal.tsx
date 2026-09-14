import React, { useState, useEffect } from 'react';
import { X, QrCode, Building, Clock, MapPin, ShieldCheck, Sparkles, BookOpen, Layers, Presentation, CheckCircle2, ChevronDown } from 'lucide-react';
import { User, Subject, TeachingMode } from '../types';
import { StorageService } from '../services/storageService';
import { PARUL_PIT_LOCATION } from '../data/initialData';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSessionCreated: () => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSessionCreated,
}) => {
  const subjects = StorageService.getAllSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [room, setRoom] = useState('Room 402 - CSE Block');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState(150);

  // Daily Syllabus Log states
  const [recordSyllabus, setRecordSyllabus] = useState(true);
  const [syllabusTopic, setSyllabusTopic] = useState('');
  const [unitName, setUnitName] = useState('');
  const [lectureNo, setLectureNo] = useState(1);
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('Chalk & Board');
  const [referenceMaterials, setReferenceMaterials] = useState('');
  const [homeworkOrAssignment, setHomeworkOrAssignment] = useState('');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const syllabusUnits = currentSubject?.syllabusUnits || [];

  useEffect(() => {
    const existingLogs = StorageService.getAllSyllabusLogs().filter(l => l.subjectId === selectedSubjectId);
    const nextNo = existingLogs.length > 0 ? Math.max(...existingLogs.map(l => l.lectureNo)) + 1 : 1;
    setLectureNo(nextNo);

    if (syllabusUnits.length > 0) {
      setUnitName(`Unit ${syllabusUnits[0].unitNo}: ${syllabusUnits[0].unitTitle}`);
    } else {
      setUnitName('General Curriculum');
    }
  }, [selectedSubjectId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    StorageService.createSession({
      subjectId: selectedSubjectId,
      room,
      durationMinutes,
      facultyUser: currentUser,
      location: {
        ...PARUL_PIT_LOCATION,
        allowedRadiusMeters,
      },
      syllabusTopic: recordSyllabus && syllabusTopic.trim() ? syllabusTopic.trim() : undefined,
      lectureNo: recordSyllabus ? lectureNo : undefined,
      unitName: recordSyllabus ? unitName : undefined,
      teachingMode: recordSyllabus ? teachingMode : undefined,
      referenceMaterials: recordSyllabus && referenceMaterials.trim() ? referenceMaterials.trim() : undefined,
      homeworkOrAssignment: recordSyllabus && homeworkOrAssignment.trim() ? homeworkOrAssignment.trim() : undefined,
    });

    onSessionCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Launch Attendance & Syllabus Log</h3>
            <p className="text-xs text-slate-500">Parul Institute of Technology • CSE Dept</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => {
                setSelectedSubjectId(e.target.value);
                const sub = subjects.find(s => s.id === e.target.value);
                if (sub) setRoom(sub.roomDefault);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classroom / Lab
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Daily Syllabus Log Section (Required Feature) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950">
                  Daily Syllabus Log (Class Diary)
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordSyllabus}
                  onChange={e => setRecordSyllabus(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-[11px] font-semibold text-indigo-700">Record Today's Topic</span>
              </label>
            </div>

            {recordSyllabus && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Unit / Module
                    </label>
                    <input
                      type="text"
                      value={unitName}
                      onChange={e => setUnitName(e.target.value)}
                      placeholder="e.g. Unit 1: Balanced Trees"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Lecture #
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lectureNo}
                      onChange={e => setLectureNo(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Predefined Topic Selector */}
                {syllabusUnits.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Select Topic from Curriculum</span>
                      <span className="text-[10px] text-indigo-600 font-normal">or type below</span>
                    </label>
                    <select
                      onChange={e => {
                        if (e.target.value) {
                          setSyllabusTopic(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none"
                      defaultValue=""
                    >
                      <option value="">-- Choose predefined topic from syllabus --</option>
                      {syllabusUnits.flatMap(u =>
                        u.topics.map(t => (
                          <option key={t.id} value={t.title}>
                            U{u.unitNo}: {t.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Topics / Syllabus Covered in Class *
                  </label>
                  <input
                    type="text"
                    required={recordSyllabus}
                    placeholder="e.g. AVL Tree Insertion & Rotations (LL, RR, LR, RL)"
                    value={syllabusTopic}
                    onChange={e => setSyllabusTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Teaching Mode
                    </label>
                    <select
                      value={teachingMode}
                      onChange={e => setTeachingMode(e.target.value as TeachingMode)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="Chalk & Board">Chalk & Board</option>
                      <option value="PPT & Multimedia">PPT & Multimedia</option>
                      <option value="Lab Demonstration">Lab Demonstration</option>
                      <option value="Interactive Problem Solving">Interactive Problem Solving</option>
                      <option value="Guest Lecture">Guest Lecture</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Homework / Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Exercise 13.2"
                      value={homeworkOrAssignment}
                      onChange={e => setHomeworkOrAssignment(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Anti-Proxy Protection Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-indigo-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Session Security Checks</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Dynamic QR rotating every 30 seconds • 150m GPS Geofence at PIT Vadodara
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-colors cursor-pointer"
            id="submit-create-session-btn"
          >
            Launch Attendance Session & Save Syllabus Log
          </button>
        </form>
      </div>
    </div>
  );
};

