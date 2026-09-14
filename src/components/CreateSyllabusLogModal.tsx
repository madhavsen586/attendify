import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Layers, 
  Calendar, 
  Hash, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Bookmark, 
  Sparkles,
  Presentation,
  ShieldCheck,
  Link as LinkIcon
} from 'lucide-react';
import { User, Subject, TeachingMode, DailySyllabusLog, SyllabusPlanUnit } from '../types';
import { StorageService } from '../services/storageService';

interface CreateSyllabusLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLogSaved: () => void;
  initialSessionId?: string;
  initialSubjectId?: string;
  editingLog?: DailySyllabusLog | null;
}

export const CreateSyllabusLogModal: React.FC<CreateSyllabusLogModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogSaved,
  initialSessionId,
  initialSubjectId,
  editingLog,
}) => {
  const subjects = StorageService.getAllSubjects();
  const sessions = StorageService.getAllSessions();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    editingLog?.subjectId || initialSubjectId || subjects[0]?.id || ''
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    editingLog?.sessionId || initialSessionId || ''
  );
  const [date, setDate] = useState<string>(
    editingLog?.date || new Date().toISOString().split('T')[0]
  );
  const [lectureNo, setLectureNo] = useState<number>(editingLog?.lectureNo || 1);
  const [unitName, setUnitName] = useState<string>(editingLog?.unitName || '');
  const [topicTitle, setTopicTitle] = useState<string>(editingLog?.topicTitle || '');
  const [subtopics, setSubtopics] = useState<string[]>(editingLog?.subtopicsCovered || []);
  const [newSubtopicInput, setNewSubtopicInput] = useState<string>('');
  const [teachingMode, setTeachingMode] = useState<TeachingMode>(
    editingLog?.teachingMode || 'Chalk & Board'
  );
  const [learningOutcomes, setLearningOutcomes] = useState<string>(
    editingLog?.learningOutcomes || ''
  );
  const [referenceMaterials, setReferenceMaterials] = useState<string>(
    editingLog?.referenceMaterials || ''
  );
  const [homeworkOrAssignment, setHomeworkOrAssignment] = useState<string>(
    editingLog?.homeworkOrAssignment || ''
  );
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const syllabusUnits: SyllabusPlanUnit[] = currentSubject?.syllabusUnits || [];

  // When subject changes, auto-suggest next lecture number and default unit if not editing
  useEffect(() => {
    if (editingLog) return;
    const existingLogs = StorageService.getAllSyllabusLogs().filter(
      l => l.subjectId === selectedSubjectId
    );
    const nextNo = existingLogs.length > 0 ? Math.max(...existingLogs.map(l => l.lectureNo)) + 1 : 1;
    setLectureNo(nextNo);

    if (syllabusUnits.length > 0 && !unitName) {
      setUnitName(`Unit ${syllabusUnits[0].unitNo}: ${syllabusUnits[0].unitTitle}`);
    }
  }, [selectedSubjectId, editingLog]);

  if (!isOpen) return null;

  const handleAddSubtopic = () => {
    if (!newSubtopicInput.trim()) return;
    setSubtopics(prev => [...prev, newSubtopicInput.trim()]);
    setNewSubtopicInput('');
  };

  const handleRemoveSubtopic = (index: number) => {
    setSubtopics(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectCurriculumTopic = (unit: SyllabusPlanUnit, topic: { title: string; subtopics: string[] }) => {
    setUnitName(`Unit ${unit.unitNo}: ${unit.unitTitle}`);
    setTopicTitle(topic.title);
    if (topic.subtopics && topic.subtopics.length > 0) {
      setSubtopics(topic.subtopics);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!topicTitle.trim()) {
      setErrorMsg('Topic title is required.');
      return;
    }

    if (editingLog) {
      // Update existing
      const res = StorageService.updateSyllabusLog(
        editingLog.id,
        {
          subjectId: selectedSubjectId,
          subjectCode: currentSubject.code,
          subjectName: currentSubject.name,
          date,
          lectureNo,
          unitName: unitName || 'General Curriculum',
          topicTitle: topicTitle.trim(),
          subtopicsCovered: subtopics,
          teachingMode,
          learningOutcomes: learningOutcomes.trim() || undefined,
          referenceMaterials: referenceMaterials.trim() || undefined,
          homeworkOrAssignment: homeworkOrAssignment.trim() || undefined,
          sessionId: selectedSessionId || undefined,
        },
        currentUser
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update syllabus log');
        return;
      }
    } else {
      // Create new
      const res = StorageService.createSyllabusLog(
        {
          sessionId: selectedSessionId || undefined,
          subjectId: selectedSubjectId,
          subjectCode: currentSubject.code,
          subjectName: currentSubject.name,
          facultyId: currentUser.id,
          facultyName: currentUser.name,
          date,
          lectureNo,
          unitName: unitName || 'General Curriculum',
          topicTitle: topicTitle.trim(),
          subtopicsCovered: subtopics,
          teachingMode,
          learningOutcomes: learningOutcomes.trim() || undefined,
          referenceMaterials: referenceMaterials.trim() || undefined,
          homeworkOrAssignment: homeworkOrAssignment.trim() || undefined,
          presentCount: selectedSessionId ? sessions.find(s => s.id === selectedSessionId)?.presentCount : undefined,
          totalEnrolled: 60,
        },
        currentUser
      );

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to record syllabus log');
        return;
      }
    }

    onLogSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingLog ? 'Edit Daily Syllabus Log' : 'Record Daily Syllabus Log'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Faculty Only
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log topics and syllabus covered today for students to track
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Subject & Lecture # row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Course / Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code}: {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lecture No. *
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  required
                  value={lectureNo}
                  onChange={e => setLectureNo(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date & Teaching Mode row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Lecture *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pedagogy / Teaching Mode
              </label>
              <div className="relative">
                <Presentation className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={teachingMode}
                  onChange={e => setTeachingMode(e.target.value as TeachingMode)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="Chalk & Board">Chalk & Board</option>
                  <option value="PPT & Multimedia">PPT & Multimedia</option>
                  <option value="Lab Demonstration">Lab Demonstration</option>
                  <option value="Interactive Problem Solving">Interactive Problem Solving</option>
                  <option value="Guest Lecture">Guest Lecture</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Curriculum Suggestions if available */}
          {syllabusUnits.length > 0 && (
            <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Quick Pick from Course Syllabus:
                </span>
                <span className="text-[10px] text-indigo-600 font-medium">
                  Click to auto-populate unit & topics
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {syllabusUnits.flatMap(u =>
                  u.topics.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectCurriculumTopic(u, t)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-800 text-[11px] font-medium rounded-lg transition-colors cursor-pointer text-left"
                    >
                      <span className="font-bold mr-1">U{u.unitNo}:</span>
                      {t.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Unit Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Unit / Module Name *
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g., Unit 1: Advanced Balanced Trees"
                value={unitName}
                onChange={e => setUnitName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Topic Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Topic / Syllabus Covered in this Lecture *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., AVL Tree Deletion & Double Rotations (LR, RL)"
              value={topicTitle}
              onChange={e => setTopicTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Subtopics Covered (Tag Builder) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subtopics / Specific Concepts Covered
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add subtopic (e.g., Height Recomputation, Case 2 Analysis)..."
                value={newSubtopicInput}
                onChange={e => setNewSubtopicInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtopic();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtopic}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {subtopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {subtopics.map((sub, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtopic(i)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reference Materials & Homework */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reference Materials / Textbook Chapters
              </label>
              <div className="relative">
                <Bookmark className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  placeholder="e.g., Cormen (CLRS) 3rd Ed Chapter 13; Class notes slide deck 4."
                  value={referenceMaterials}
                  onChange={e => setReferenceMaterials(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Homework / Lab Assignment
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  placeholder="e.g., Complete Exercise 13.2 problems 1-4 before next lecture."
                  value={homeworkOrAssignment}
                  onChange={e => setHomeworkOrAssignment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expected Learning Outcomes
            </label>
            <input
              type="text"
              placeholder="e.g., Students will be able to perform balanced rotations and verify tree height in O(log n)."
              value={learningOutcomes}
              onChange={e => setLearningOutcomes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Link with Attendance Session */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Link with Attendance Session (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedSessionId}
                onChange={e => setSelectedSessionId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value="">-- No Session Linked (Standalone Lecture Entry) --</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.date} • {s.subjectCode} ({s.startTime}) • {s.presentCount} present
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-colors cursor-pointer"
            >
              {editingLog ? 'Update Syllabus Log' : 'Save Daily Syllabus Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
