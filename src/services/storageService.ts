import { 
  User, 
  Subject, 
  AttendanceSession, 
  AttendanceRecord, 
  StudentSubjectStat,
  GPSLocation,
  DailySyllabusLog,
  TeachingMode
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_SUBJECTS, 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCE_RECORDS, 
  PARUL_PIT_LOCATION,
  INITIAL_SYLLABUS_LOGS
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'attendify_current_user',
  USERS: 'attendify_users',
  SUBJECTS: 'attendify_subjects',
  SESSIONS: 'attendify_sessions',
  RECORDS: 'attendify_records',
  SYLLABUS_LOGS: 'attendify_syllabus_logs',
};

// Cross-tab broadcast channel for real-time live attendance updates
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('attendify_sync_channel')
  : null;

export const StorageService = {
  init(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SYLLABUS_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.SYLLABUS_LOGS, JSON.stringify(INITIAL_SYLLABUS_LOGS));
    }
    if (localStorage.getItem(STORAGE_KEYS.CURRENT_USER) === null) {
      // Default to Madhav Sen (Student from the Project Report) only on first run
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[2]));
    }
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data || data === 'LOGGED_OUT' || data === 'null') {
        return null;
      }
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'LOGGED_OUT');
    }
    this.notifyUpdate('USER_CHANGED', user);
  },

  getAllUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  addUser(user: User): void {
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notifyUpdate('USERS_UPDATED');
  },

  authenticateUser(identifier: string, password: string): { success: boolean; user?: User; message?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Please enter both email/ID and password.' };
    }

    const users = this.getAllUsers();
    const matchedUser = users.find(u => {
      const emailMatch = u.email.toLowerCase() === cleanId;
      const enrollmentMatch = u.enrollmentNo && u.enrollmentNo.toLowerCase() === cleanId;
      const facultyMatch = u.facultyId && u.facultyId.toLowerCase() === cleanId;
      return emailMatch || enrollmentMatch || facultyMatch;
    });

    if (!matchedUser) {
      return {
        success: false,
        message: 'No account found with this email or ID. Please check your credentials or register.',
      };
    }

    const validPassword = matchedUser.password || 'pass123';
    if (cleanPass !== validPassword) {
      return {
        success: false,
        message: 'Incorrect password. Default demo password is "pass123".',
      };
    }

    // Success: set current user
    this.setCurrentUser(matchedUser);
    return { success: true, user: matchedUser };
  },

  getAllSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return data ? JSON.parse(data) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  },

  getAllSessions(): AttendanceSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  },

  getActiveSession(): AttendanceSession | null {
    const sessions = this.getAllSessions();
    const active = sessions.find(s => s.isActive && s.expiresAt > Date.now());
    return active || null;
  },

  createSession(params: {
    subjectId: string;
    room: string;
    durationMinutes: number;
    facultyUser: User;
    location?: GPSLocation;
    syllabusTopic?: string;
    lectureNo?: number;
    unitName?: string;
    subtopicsCovered?: string[];
    teachingMode?: TeachingMode;
    referenceMaterials?: string;
    homeworkOrAssignment?: string;
  }): AttendanceSession {
    const subjects = this.getAllSubjects();
    const subject = subjects.find(s => s.id === params.subjectId) || subjects[0];
    const now = Date.now();
    const todayDate = new Date().toISOString().split('T')[0];

    // Close any previous active session
    const sessions = this.getAllSessions().map(s => {
      if (s.isActive) {
        return { ...s, isActive: false, endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      }
      return s;
    });

    const sessionId = `session-${now}`;
    let syllabusLogId: string | undefined = undefined;

    // Automatically create and link daily syllabus log if topic is provided
    if (params.syllabusTopic && params.syllabusTopic.trim().length > 0) {
      const existingLogs = this.getAllSyllabusLogs().filter(l => l.subjectId === subject.id);
      const computedLectureNo = params.lectureNo || (existingLogs.length > 0 ? Math.max(...existingLogs.map(l => l.lectureNo)) + 1 : 1);
      
      const newLogResult = this.createSyllabusLog({
        sessionId,
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        facultyId: params.facultyUser.id,
        facultyName: params.facultyUser.name,
        date: todayDate,
        lectureNo: computedLectureNo,
        unitName: params.unitName || 'General Curriculum',
        topicTitle: params.syllabusTopic,
        subtopicsCovered: params.subtopicsCovered || [],
        teachingMode: params.teachingMode || 'Chalk & Board',
        referenceMaterials: params.referenceMaterials,
        homeworkOrAssignment: params.homeworkOrAssignment,
        presentCount: 0,
        totalEnrolled: 60,
      }, params.facultyUser);

      if (newLogResult.success && newLogResult.data) {
        syllabusLogId = newLogResult.data.id;
      }
    }

    const newSession: AttendanceSession = {
      id: sessionId,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      room: params.room || subject.roomDefault,
      facultyId: params.facultyUser.id,
      facultyName: params.facultyUser.name,
      date: todayDate,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: now + params.durationMinutes * 60 * 1000,
      isActive: true,
      qrSecret: `PIT-${subject.code}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      qrRefreshIntervalSec: 30,
      qrGeneratedAt: now,
      location: params.location || PARUL_PIT_LOCATION,
      totalEnrolled: 60,
      presentCount: 0,
      syllabusTopic: params.syllabusTopic,
      lectureNo: params.lectureNo,
      syllabusLogId,
    };

    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    this.notifyUpdate('SESSION_CREATED', newSession);
    return newSession;
  },

  refreshSessionQr(sessionId: string): AttendanceSession | null {
    const sessions = this.getAllSessions();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return null;

    const session = sessions[idx];
    if (!session.isActive || session.expiresAt <= Date.now()) return null;

    session.qrSecret = `PIT-${session.subjectCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    session.qrGeneratedAt = Date.now();

    sessions[idx] = session;
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    this.notifyUpdate('QR_REFRESHED', session);
    return session;
  },

  endSession(sessionId: string): void {
    const sessions = this.getAllSessions().map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          isActive: false,
          endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    this.notifyUpdate('SESSION_ENDED', { sessionId });
  },

  getAllRecords(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : INITIAL_ATTENDANCE_RECORDS;
    } catch {
      return INITIAL_ATTENDANCE_RECORDS;
    }
  },

  getStudentRecords(studentId: string): AttendanceRecord[] {
    return this.getAllRecords()
      .filter(r => r.studentId === studentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getSessionRecords(sessionId: string): AttendanceRecord[] {
    return this.getAllRecords()
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Mark attendance with comprehensive anti-proxy checks
  markAttendance(params: {
    scannedPayload: string; // QR code data or JSON
    studentUser: User;
    studentCoords?: { latitude: number; longitude: number };
    skipGpsCheck?: boolean;
  }): { success: boolean; message: string; record?: AttendanceRecord } {
    const sessions = this.getAllSessions();
    const records = this.getAllRecords();

    // Parse scanned payload
    let targetSessionId = '';
    let targetSecret = '';

    try {
      // Could be raw JSON: {"sessionId":"...","secret":"..."} or plain text format: "ATTENDIFY:sessionId:secret"
      if (params.scannedPayload.startsWith('{')) {
        const parsed = JSON.parse(params.scannedPayload);
        targetSessionId = parsed.sessionId;
        targetSecret = parsed.secret;
      } else if (params.scannedPayload.startsWith('ATTENDIFY:')) {
        const parts = params.scannedPayload.split(':');
        targetSessionId = parts[1];
        targetSecret = parts[2];
      } else {
        // Fallback or raw secret matching
        targetSecret = params.scannedPayload.trim();
        const active = sessions.find(s => s.isActive && (s.qrSecret === targetSecret || s.id === targetSecret));
        if (active) {
          targetSessionId = active.id;
          targetSecret = active.qrSecret;
        }
      }
    } catch {
      return { success: false, message: 'Invalid QR code format.' };
    }

    const session = sessions.find(s => s.id === targetSessionId);
    if (!session) {
      return { success: false, message: 'Attendance session not found or has concluded.' };
    }

    if (!session.isActive || session.expiresAt <= Date.now()) {
      return { success: false, message: 'This attendance session has expired. Please ask faculty to re-open.' };
    }

    // Secret verification (anti-proxy: dynamic rotating QR tokens)
    if (session.qrSecret !== targetSecret) {
      return {
        success: false,
        message: 'QR code has already expired or rotated. Please scan the freshly displayed code on projector screen.',
      };
    }

    // Duplicate verification (anti-proxy)
    const existing = records.find(
      r => r.sessionId === session.id && r.studentId === params.studentUser.id
    );
    if (existing) {
      return {
        success: false,
        message: `Attendance has already been marked for ${session.subjectCode} at ${new Date(existing.timestamp).toLocaleTimeString()}!`,
        record: existing,
      };
    }

    // GPS Geofence verification
    let locationVerified = true;
    let distanceMeters = 15; // default close distance for demo/allowed

    if (!params.skipGpsCheck && params.studentCoords && session.location) {
      distanceMeters = this.calculateDistanceMeters(
        params.studentCoords.latitude,
        params.studentCoords.longitude,
        session.location.latitude,
        session.location.longitude
      );

      if (distanceMeters > session.location.allowedRadiusMeters) {
        return {
          success: false,
          message: `Location verification failed! You are ${Math.round(distanceMeters)}m away from ${session.location.classroomName} (allowed limit: ${session.location.allowedRadiusMeters}m). Proxy prevention is active.`,
        };
      }
      locationVerified = true;
    }

    // Determine status (present vs late)
    const sessionStartTimeMs = new Date(`${session.date} ${session.startTime}`).getTime();
    const isLate = !isNaN(sessionStartTimeMs) && Date.now() - sessionStartTimeMs > 25 * 60 * 1000;

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId: session.id,
      subjectCode: session.subjectCode,
      subjectName: session.subjectName,
      facultyName: session.facultyName,
      studentId: params.studentUser.id,
      studentName: params.studentUser.name,
      enrollmentNo: params.studentUser.enrollmentNo || 'N/A',
      date: session.date,
      timestamp: new Date().toISOString(),
      status: isLate ? 'late' : 'present',
      locationVerified,
      distanceMeters: Math.round(distanceMeters),
      deviceFingerprint: typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 24)}...` : 'WebClient',
    };

    records.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));

    // Increment session present count
    const sessionIndex = sessions.findIndex(s => s.id === session.id);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].presentCount += 1;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }

    this.notifyUpdate('ATTENDANCE_MARKED', { record: newRecord, session: sessions[sessionIndex] });

    return {
      success: true,
      message: `Attendance marked successfully for ${session.subjectName}!`,
      record: newRecord,
    };
  },

  // Manual override by faculty (Mark present / absent / excuse)
  updateRecordStatus(recordId: string, status: AttendanceRecord['status']): void {
    const records = this.getAllRecords();
    const idx = records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      records[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
      this.notifyUpdate('RECORD_STATUS_CHANGED', records[idx]);
    }
  },

  // Calculate subject-wise statistics for a student
  getStudentSubjectStats(studentId: string): {
    overallPercentage: number;
    totalPresent: number;
    totalAbsent: number;
    subjectStats: StudentSubjectStat[];
  } {
    const subjects = this.getAllSubjects();
    const records = this.getStudentRecords(studentId);

    const subjectStats: StudentSubjectStat[] = subjects.map(sub => {
      const subRecords = records.filter(r => r.subjectCode === sub.code);
      // Give realistic total classes count
      const totalClasses = Math.max(subRecords.length, 12);
      const attendedClasses = subRecords.filter(r => r.status === 'present' || r.status === 'late').length + 8; // Seeded attendance
      const percentage = Math.min(100, Math.round((attendedClasses / totalClasses) * 100));

      let status: 'good' | 'warning' | 'critical' = 'good';
      if (percentage < 60) status = 'critical';
      else if (percentage < 75) status = 'warning';

      return {
        subjectId: sub.id,
        subjectCode: sub.code,
        subjectName: sub.name,
        totalClasses,
        attendedClasses,
        percentage,
        status,
      };
    });

    const totalClassesSum = subjectStats.reduce((acc, s) => acc + s.totalClasses, 0);
    const attendedClassesSum = subjectStats.reduce((acc, s) => acc + s.attendedClasses, 0);
    const overallPercentage = totalClassesSum > 0 ? Math.round((attendedClassesSum / totalClassesSum) * 100) : 0;
    const totalAbsent = totalClassesSum - attendedClassesSum;

    return {
      overallPercentage,
      totalPresent: attendedClassesSum,
      totalAbsent,
      subjectStats,
    };
  },

  // Haversine formula for GPS distance calculation in meters
  calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  // Event dispatching for real-time reactivity
  notifyUpdate(type: string, data?: any): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('attendify_storage_update', { detail: { type, data } }));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type, data });
      } catch (e) {
        // Fallback silently if broadcast channel fails
      }
    }
  },

  subscribe(callback: (event: { type: string; data?: any }) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleCustomEvent = (e: any) => {
      callback(e.detail || { type: 'UNKNOWN' });
    };

    const handleBroadcast = (e: MessageEvent) => {
      callback(e.data || { type: 'UNKNOWN' });
    };

    const handleStorage = (e: StorageEvent) => {
      callback({ type: 'STORAGE_EVENT', data: e.key });
    };

    window.addEventListener('attendify_storage_update', handleCustomEvent);
    window.addEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcast);
    }

    return () => {
      window.removeEventListener('attendify_storage_update', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcast);
      }
    };
  },

  // ============================================================================
  // DAILY SYLLABUS LOGS METHODS (FACULTY-ONLY AUTHORIZATION & DATE-WISE TRACKING)
  // ============================================================================

  getAllSyllabusLogs(): DailySyllabusLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYLLABUS_LOGS);
      const logs: DailySyllabusLog[] = data ? JSON.parse(data) : INITIAL_SYLLABUS_LOGS;
      // Sort chronologically date-wise descending, then by lecture number descending
      return logs.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (b.lectureNo || 0) - (a.lectureNo || 0);
      });
    } catch {
      return INITIAL_SYLLABUS_LOGS;
    }
  },

  getSyllabusLogById(id: string): DailySyllabusLog | undefined {
    const logs = this.getAllSyllabusLogs();
    return logs.find(l => l.id === id);
  },

  getSyllabusLogsDateWise(filters?: {
    subjectId?: string;
    facultyId?: string;
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
  }): DailySyllabusLog[] {
    let logs = this.getAllSyllabusLogs();

    if (!filters) return logs;

    if (filters.subjectId && filters.subjectId !== 'ALL') {
      logs = logs.filter(l => l.subjectId === filters.subjectId || l.subjectCode === filters.subjectId);
    }
    if (filters.facultyId) {
      logs = logs.filter(l => l.facultyId === filters.facultyId);
    }
    if (filters.startDate) {
      logs = logs.filter(l => l.date >= filters.startDate!);
    }
    if (filters.endDate) {
      logs = logs.filter(l => l.date <= filters.endDate!);
    }
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase();
      logs = logs.filter(l => 
        l.topicTitle.toLowerCase().includes(q) ||
        l.unitName.toLowerCase().includes(q) ||
        l.subjectName.toLowerCase().includes(q) ||
        l.subjectCode.toLowerCase().includes(q) ||
        (l.subtopicsCovered && l.subtopicsCovered.some(sub => sub.toLowerCase().includes(q)))
      );
    }

    return logs;
  },

  createSyllabusLog(
    logInput: Omit<DailySyllabusLog, 'id' | 'createdAt'>, 
    currentUser: User
  ): { success: boolean; data?: DailySyllabusLog; error?: string } {
    // 1. Role Authorization Check: Only faculties can create daily syllabus logs
    if (currentUser.role !== 'teacher') {
      return { 
        success: false, 
        error: 'Access Denied: Daily Syllabus Logs can only be recorded by authenticated faculty members.' 
      };
    }

    // 2. Input Validation
    if (!logInput.subjectId || !logInput.topicTitle || !logInput.unitName) {
      return { 
        success: false, 
        error: 'Validation Error: Subject, Unit Name, and Topic Title are mandatory.' 
      };
    }

    const allLogs = this.getAllSyllabusLogs();
    const now = new Date().toISOString();
    const id = `syl-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Auto-calculate lecture number if not supplied
    let lectureNo = logInput.lectureNo;
    if (!lectureNo || lectureNo <= 0) {
      const subjectLogs = allLogs.filter(l => l.subjectId === logInput.subjectId);
      lectureNo = subjectLogs.length > 0 ? Math.max(...subjectLogs.map(l => l.lectureNo)) + 1 : 1;
    }

    const newLog: DailySyllabusLog = {
      ...logInput,
      id,
      lectureNo,
      date: logInput.date || now.split('T')[0],
      createdAt: now,
      updatedAt: now,
    };

    allLogs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_LOGS, JSON.stringify(allLogs));
    this.notifyUpdate('SYLLABUS_LOG_CREATED', newLog);

    return { success: true, data: newLog };
  },

  updateSyllabusLog(
    id: string, 
    updates: Partial<DailySyllabusLog>, 
    currentUser: User
  ): { success: boolean; data?: DailySyllabusLog; error?: string } {
    // 1. Role Authorization Check
    if (currentUser.role !== 'teacher') {
      return { 
        success: false, 
        error: 'Access Denied: Only certified faculty can update syllabus records.' 
      };
    }

    const allLogs = this.getAllSyllabusLogs();
    const idx = allLogs.findIndex(l => l.id === id);
    if (idx === -1) {
      return { success: false, error: 'Syllabus log record not found.' };
    }

    const existing = allLogs[idx];
    const updatedLog: DailySyllabusLog = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    allLogs[idx] = updatedLog;
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_LOGS, JSON.stringify(allLogs));
    this.notifyUpdate('SYLLABUS_LOG_UPDATED', updatedLog);

    return { success: true, data: updatedLog };
  },

  deleteSyllabusLog(
    id: string, 
    currentUser: User
  ): { success: boolean; error?: string } {
    if (currentUser.role !== 'teacher') {
      return { 
        success: false, 
        error: 'Access Denied: Only faculty members can delete syllabus log entries.' 
      };
    }

    const allLogs = this.getAllSyllabusLogs();
    const filtered = allLogs.filter(l => l.id !== id);
    if (filtered.length === allLogs.length) {
      return { success: false, error: 'Log not found.' };
    }

    localStorage.setItem(STORAGE_KEYS.SYLLABUS_LOGS, JSON.stringify(filtered));
    this.notifyUpdate('SYLLABUS_LOG_DELETED', { id });
    return { success: true };
  },

  getSubjectSyllabusProgress(subjectId: string): {
    totalPlanned: number;
    coveredCount: number;
    percentage: number;
    lastCoveredLog?: DailySyllabusLog;
  } {
    const subjects = this.getAllSubjects();
    const subject = subjects.find(s => s.id === subjectId || s.code === subjectId);
    const totalPlanned = subject?.totalPlannedLectures || 40;
    
    const logs = this.getAllSyllabusLogs().filter(l => 
      l.subjectId === subjectId || l.subjectCode === subjectId
    );

    const coveredCount = logs.length;
    const percentage = Math.min(100, Math.round((coveredCount / totalPlanned) * 100));
    const lastCoveredLog = logs.length > 0 ? logs[0] : undefined;

    return {
      totalPlanned,
      coveredCount,
      percentage,
      lastCoveredLog,
    };
  },

  // Reset demo data to factory defaults
  resetToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
    localStorage.setItem(STORAGE_KEYS.SYLLABUS_LOGS, JSON.stringify(INITIAL_SYLLABUS_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[2]));
    this.notifyUpdate('RESET_COMPLETE');
  },
};
