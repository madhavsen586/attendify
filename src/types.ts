export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  // Student specific
  enrollmentNo?: string;
  semester?: string;
  department?: string;
  college?: string;
  // Faculty specific
  designation?: string;
  facultyId?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  facultyName: string;
  facultyId: string;
  roomDefault: string;
  totalPlannedLectures?: number;
  syllabusUnits?: SyllabusPlanUnit[];
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  classroomName: string;
  allowedRadiusMeters: number;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  room: string;
  facultyId: string;
  facultyName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string or HH:mm
  endTime?: string;
  expiresAt: number; // timestamp ms
  isActive: boolean;
  qrSecret: string; // Dynamic secret rotated periodically
  qrRefreshIntervalSec: number; // e.g. 30s
  qrGeneratedAt: number;
  location: GPSLocation;
  totalEnrolled: number;
  presentCount: number;
  syllabusTopic?: string;
  lectureNo?: number;
  syllabusLogId?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'flagged';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  date: string;
  timestamp: string;
  status: AttendanceStatus;
  locationVerified: boolean;
  distanceMeters?: number;
  deviceFingerprint?: string;
  notes?: string;
}

export interface StudentSubjectStat {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical'; // <75% is warning, <60% is critical
}

export type TeachingMode = 
  | 'Chalk & Board' 
  | 'PPT & Multimedia' 
  | 'Lab Demonstration' 
  | 'Interactive Problem Solving' 
  | 'Guest Lecture';

export interface SyllabusPlanTopic {
  id: string;
  title: string;
  estimatedHours: number;
  subtopics: string[];
}

export interface SyllabusPlanUnit {
  unitNo: number;
  unitTitle: string;
  topics: SyllabusPlanTopic[];
}

export interface DailySyllabusLog {
  id: string;
  sessionId?: string; // Optional reference to AttendanceSession
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  date: string; // YYYY-MM-DD
  lectureNo: number;
  unitName: string;
  topicTitle: string;
  subtopicsCovered: string[];
  teachingMode: TeachingMode;
  learningOutcomes?: string;
  referenceMaterials?: string;
  homeworkOrAssignment?: string;
  remarks?: string;
  presentCount?: number;
  totalEnrolled?: number;
  createdAt: string;
  updatedAt?: string;
}
