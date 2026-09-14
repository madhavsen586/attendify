import { User, Subject, AttendanceSession, AttendanceRecord, DailySyllabusLog } from '../types';

export const PARUL_PIT_LOCATION = {
  latitude: 22.2887,
  longitude: 73.3634,
  classroomName: 'PIT CSE Block - Lab 402 (Vadodara)',
  allowedRadiusMeters: 150, // 150 meters geofence
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-teacher-1',
    name: 'Dr. Shiv Shakti Shrivastava',
    email: 'teacher.cse@parul.edu',
    password: 'pass123',
    role: 'teacher',
    designation: 'Assistant Professor, CSE',
    facultyId: 'FAC-CSE-1042',
    department: 'Department of Computer Science & Engineering',
    college: 'Parul Institute of Technology, Vadodara',
  },
  {
    id: 'user-teacher-2',
    name: 'Prof. Sumitra Menaria',
    email: 'hod.cse@parul.edu',
    password: 'pass123',
    role: 'teacher',
    designation: 'Head of Department (CSE)',
    facultyId: 'FAC-CSE-1001',
    department: 'Department of Computer Science & Engineering',
    college: 'Parul Institute of Technology, Vadodara',
  },
  {
    id: 'user-student-1',
    name: 'Madhav Sen',
    email: '2303051051127@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051127',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
  {
    id: 'user-student-2',
    name: 'Vaibhav Yadav',
    email: '2303051051082@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051082',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
  {
    id: 'user-student-3',
    name: 'Parmar Keval',
    email: '2303051051139@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051139',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
  {
    id: 'user-student-4',
    name: 'Palak Patel',
    email: '2303051051044@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051044',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
  {
    id: 'user-student-5',
    name: 'Aarav Sharma',
    email: '2303051051012@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051012',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
  {
    id: 'user-student-6',
    name: 'Ananya Verma',
    email: '2303051051065@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051065',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
  {
    id: 'user-student-7',
    name: 'Rohan Shah',
    email: '2303051051098@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051098',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
  {
    id: 'user-student-8',
    name: 'Sneha Desai',
    email: '2303051051115@parul.edu',
    password: 'pass123',
    role: 'student',
    enrollmentNo: '2303051051115',
    semester: 'Semester VI (AY 2025-26)',
    department: 'Computer Science & Engineering',
    college: 'Parul Institute of Technology',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    code: 'CS601',
    name: 'Data Structures & Algorithms (DSA)',
    credits: 4,
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    facultyId: 'user-teacher-1',
    roomDefault: 'Room 402 - CSE Block',
    totalPlannedLectures: 42,
    syllabusUnits: [
      {
        unitNo: 1,
        unitTitle: 'Advanced Balanced Trees',
        topics: [
          {
            id: 'dsa-u1-t1',
            title: 'AVL Trees: Rotations & Balancing',
            estimatedHours: 4,
            subtopics: ['Single Rotations (LL, RR)', 'Double Rotations (LR, RL)', 'Height Balanced Verification']
          },
          {
            id: 'dsa-u1-t2',
            title: 'Red-Black Trees & Multiway Search Trees',
            estimatedHours: 4,
            subtopics: ['Properties of Red-Black Trees', 'Insertion & Recoloring', 'B-Trees & B+ Tree concepts']
          }
        ]
      },
      {
        unitNo: 2,
        unitTitle: 'Graph Theory & Network Flows',
        topics: [
          {
            id: 'dsa-u2-t1',
            title: 'Graph Traversals & Topological Sorting',
            estimatedHours: 4,
            subtopics: ['Breadth First Search (BFS)', 'Depth First Search (DFS)', 'Cycle Detection in Directed Graphs']
          },
          {
            id: 'dsa-u2-t2',
            title: 'Shortest Paths & Minimum Spanning Trees',
            estimatedHours: 5,
            subtopics: ['Dijkstra Algorithm', 'Bellman-Ford Algorithm', 'Kruskal and Prim Algorithms']
          }
        ]
      },
      {
        unitNo: 3,
        unitTitle: 'Dynamic Programming & Greedy Approaches',
        topics: [
          {
            id: 'dsa-u3-t1',
            title: 'Dynamic Programming Foundations',
            estimatedHours: 5,
            subtopics: ['Overlapping Subproblems', '0/1 Knapsack Problem', 'Longest Common Subsequence (LCS)']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-os',
    code: 'CS602',
    name: 'Operating Systems (OS)',
    credits: 4,
    facultyName: 'Prof. Sumitra Menaria',
    facultyId: 'user-teacher-2',
    roomDefault: 'Room 405 - CSE Block',
    totalPlannedLectures: 40,
    syllabusUnits: [
      {
        unitNo: 1,
        unitTitle: 'Process & CPU Scheduling',
        topics: [
          {
            id: 'os-u1-t1',
            title: 'CPU Scheduling Algorithms',
            estimatedHours: 4,
            subtopics: ['FCFS, SJF, Priority Scheduling', 'Round Robin with Time Quantum', 'Multilevel Feedback Queues']
          }
        ]
      },
      {
        unitNo: 2,
        unitTitle: 'Deadlocks & Resource Allocation',
        topics: [
          {
            id: 'os-u2-t1',
            title: 'Deadlock Characterization & Prevention',
            estimatedHours: 4,
            subtopics: ['Mutual Exclusion, Hold and Wait', 'Resource Allocation Graph (RAG)', 'Safe State Detection']
          },
          {
            id: 'os-u2-t2',
            title: "Banker's Algorithm & Deadlock Avoidance",
            estimatedHours: 3,
            subtopics: ["Safety Algorithm", "Resource-Request Algorithm", "Recovery from Deadlock"]
          }
        ]
      },
      {
        unitNo: 3,
        unitTitle: 'Memory Management & Paging',
        topics: [
          {
            id: 'os-u3-t1',
            title: 'Virtual Memory & Page Replacement',
            estimatedHours: 5,
            subtopics: ['Demand Paging & Page Faults', 'FIFO, LRU, Optimal Page Replacement', 'Thrashing & Working Set Model']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-dbms',
    code: 'CS603',
    name: 'Database Management Systems (DBMS)',
    credits: 3,
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    facultyId: 'user-teacher-1',
    roomDefault: 'Lab 201 - IT Tower',
    totalPlannedLectures: 36,
    syllabusUnits: [
      {
        unitNo: 1,
        unitTitle: 'Relational Normalization Theory',
        topics: [
          {
            id: 'dbms-u1-t1',
            title: 'Functional Dependencies & Normal Forms (1NF, 2NF, 3NF)',
            estimatedHours: 4,
            subtopics: ['Closure of Attribute Sets', 'Lossless Join Decomposition', 'Dependency Preservation']
          },
          {
            id: 'dbms-u1-t2',
            title: 'Boyce-Codd Normal Form (BCNF) & 4NF',
            estimatedHours: 4,
            subtopics: ['BCNF Definition & Anomalies', 'BCNF Decomposition Algorithm', 'Multivalued Dependencies']
          }
        ]
      },
      {
        unitNo: 2,
        unitTitle: 'Transaction Processing & Concurrency',
        topics: [
          {
            id: 'dbms-u2-t1',
            title: 'ACID Properties & Serializability',
            estimatedHours: 4,
            subtopics: ['Conflict Serializability', 'View Serializability', 'Testing for Conflict Serializability']
          },
          {
            id: 'dbms-u2-t2',
            title: 'Concurrency Control Protocols',
            estimatedHours: 4,
            subtopics: ['Two-Phase Locking (2PL)', 'Timestamp Ordering Protocol', 'Deadlock Handling in DBMS']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-wt',
    code: 'CS604',
    name: 'Web Technologies & Frameworks',
    credits: 3,
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    facultyId: 'user-teacher-1',
    roomDefault: 'Lab 402 - CSE Block',
    totalPlannedLectures: 36,
    syllabusUnits: [
      {
        unitNo: 1,
        unitTitle: 'Modern Frontend Engineering',
        topics: [
          {
            id: 'wt-u1-t1',
            title: 'React Hooks & State Management',
            estimatedHours: 4,
            subtopics: ['useState, useEffect, useMemo, useCallback', 'Custom Hooks Creation', 'Context API vs Global Stores']
          }
        ]
      },
      {
        unitNo: 2,
        unitTitle: 'Server-Side & REST APIs',
        topics: [
          {
            id: 'wt-u2-t1',
            title: 'Express.js Architecture & Middleware',
            estimatedHours: 4,
            subtopics: ['Routing, Request/Response Pipeline', 'JWT Authentication & Security', 'Database Integration']
          }
        ]
      }
    ]
  },
  {
    id: 'sub-ai',
    code: 'CS605',
    name: 'Artificial Intelligence & ML',
    credits: 4,
    facultyName: 'Prof. Sumitra Menaria',
    facultyId: 'user-teacher-2',
    roomDefault: 'Auditorium 2 - Main Campus',
    totalPlannedLectures: 40,
    syllabusUnits: [
      {
        unitNo: 1,
        unitTitle: 'Informed Search Strategies',
        topics: [
          {
            id: 'ai-u1-t1',
            title: 'Heuristic Search & A* Algorithm',
            estimatedHours: 4,
            subtopics: ['Admissible & Consistent Heuristics', 'A* Search Optimality Proof', 'Memory-Bounded Search (SMA*)']
          },
          {
            id: 'ai-u1-t2',
            title: 'Adversarial Search & Game Playing',
            estimatedHours: 4,
            subtopics: ['Minimax Algorithm', 'Alpha-Beta Pruning Efficiency', 'Evaluation Functions']
          }
        ]
      }
    ]
  },
];

// Pre-seeded past attendance records for Madhav Sen and classmates
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'rec-1',
    sessionId: 'session-past-1',
    subjectCode: 'CS601',
    subjectName: 'Data Structures & Algorithms (DSA)',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-12',
    timestamp: '2026-09-12T10:15:22',
    status: 'present',
    locationVerified: true,
    distanceMeters: 14,
    deviceFingerprint: 'Chrome-MacOS-98d2',
  },
  {
    id: 'rec-2',
    sessionId: 'session-past-2',
    subjectCode: 'CS602',
    subjectName: 'Operating Systems (OS)',
    facultyName: 'Prof. Sumitra Menaria',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-12',
    timestamp: '2026-09-12T11:45:09',
    status: 'present',
    locationVerified: true,
    distanceMeters: 28,
    deviceFingerprint: 'Chrome-MacOS-98d2',
  },
  {
    id: 'rec-3',
    sessionId: 'session-past-3',
    subjectCode: 'CS603',
    subjectName: 'Database Management Systems (DBMS)',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-11',
    timestamp: '2026-09-11T09:32:00',
    status: 'present',
    locationVerified: true,
    distanceMeters: 45,
    deviceFingerprint: 'Chrome-MacOS-98d2',
  },
  {
    id: 'rec-4',
    sessionId: 'session-past-4',
    subjectCode: 'CS604',
    subjectName: 'Web Technologies & Frameworks',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-10',
    timestamp: '2026-09-10T14:10:44',
    status: 'present',
    locationVerified: true,
    distanceMeters: 19,
    deviceFingerprint: 'Chrome-MacOS-98d2',
  },
  {
    id: 'rec-5',
    sessionId: 'session-past-5',
    subjectCode: 'CS605',
    subjectName: 'Artificial Intelligence & ML',
    facultyName: 'Prof. Sumitra Menaria',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-09',
    timestamp: '2026-09-09T10:04:18',
    status: 'present',
    locationVerified: true,
    distanceMeters: 31,
    deviceFingerprint: 'Chrome-MacOS-98d2',
  },
  {
    id: 'rec-6',
    sessionId: 'session-past-6',
    subjectCode: 'CS601',
    subjectName: 'Data Structures & Algorithms (DSA)',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-08',
    timestamp: '2026-09-08T10:18:55',
    status: 'present',
    locationVerified: true,
    distanceMeters: 12,
    deviceFingerprint: 'Chrome-MacOS-98d2',
  },
  {
    id: 'rec-7',
    sessionId: 'session-past-7',
    subjectCode: 'CS603',
    subjectName: 'Database Management Systems (DBMS)',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-05',
    timestamp: '2026-09-05T09:30:00',
    status: 'absent',
    locationVerified: false,
    distanceMeters: 0,
    deviceFingerprint: '-',
    notes: 'Medical leave submitted',
  },
  {
    id: 'rec-8',
    sessionId: 'session-past-8',
    subjectCode: 'CS602',
    subjectName: 'Operating Systems (OS)',
    facultyName: 'Prof. Sumitra Menaria',
    studentId: 'user-student-1',
    studentName: 'Madhav Sen',
    enrollmentNo: '2303051051127',
    date: '2026-09-04',
    timestamp: '2026-09-04T12:05:11',
    status: 'late',
    locationVerified: true,
    distanceMeters: 35,
    deviceFingerprint: 'Chrome-MacOS-98d2',
    notes: 'Marked 20 mins after session start',
  }
];

export const INITIAL_SESSIONS: AttendanceSession[] = [
  {
    id: 'session-active-1',
    subjectId: 'sub-dsa',
    subjectCode: 'CS601',
    subjectName: 'Data Structures & Algorithms (DSA)',
    room: 'Room 402 - CSE Block',
    facultyId: 'user-teacher-1',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    date: '2026-09-14',
    startTime: '10:00 AM',
    expiresAt: Date.now() + 1000 * 60 * 45, // 45 minutes remaining
    isActive: true,
    qrSecret: 'PARUL-PIT-CS601-SEC-918273',
    qrRefreshIntervalSec: 30,
    qrGeneratedAt: Date.now(),
    location: PARUL_PIT_LOCATION,
    totalEnrolled: 60,
    presentCount: 14,
  },
  {
    id: 'session-past-1',
    subjectId: 'sub-dsa',
    subjectCode: 'CS601',
    subjectName: 'Data Structures & Algorithms (DSA)',
    room: 'Room 402 - CSE Block',
    facultyId: 'user-teacher-1',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    date: '2026-09-12',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    expiresAt: Date.now() - 1000 * 60 * 60 * 48,
    isActive: false,
    qrSecret: 'PARUL-PIT-CS601-OLD-1',
    qrRefreshIntervalSec: 30,
    qrGeneratedAt: Date.now() - 1000 * 60 * 60 * 48,
    location: PARUL_PIT_LOCATION,
    totalEnrolled: 60,
    presentCount: 54,
  },
  {
    id: 'session-past-2',
    subjectId: 'sub-os',
    subjectCode: 'CS602',
    subjectName: 'Operating Systems (OS)',
    room: 'Room 405 - CSE Block',
    facultyId: 'user-teacher-2',
    facultyName: 'Prof. Sumitra Menaria',
    date: '2026-09-12',
    startTime: '11:30 AM',
    endTime: '12:30 PM',
    expiresAt: Date.now() - 1000 * 60 * 60 * 46,
    isActive: false,
    qrSecret: 'PARUL-PIT-CS602-OLD-2',
    qrRefreshIntervalSec: 30,
    qrGeneratedAt: Date.now() - 1000 * 60 * 60 * 46,
    location: PARUL_PIT_LOCATION,
    totalEnrolled: 60,
    presentCount: 51,
  },
];

export const INITIAL_SYLLABUS_LOGS: DailySyllabusLog[] = [
  {
    id: 'syl-log-1',
    sessionId: 'session-active-1',
    subjectId: 'sub-dsa',
    subjectCode: 'CS601',
    subjectName: 'Data Structures & Algorithms (DSA)',
    facultyId: 'user-teacher-1',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    date: '2026-09-14',
    lectureNo: 28,
    unitName: 'Unit 1: Advanced Balanced Trees',
    topicTitle: 'Red-Black Trees: Properties & Insertion Fixup',
    subtopicsCovered: [
      'Red-Black Tree Invariants & Black Height',
      'Case 1: Uncle is Red (Recoloring)',
      'Case 2 & 3: Uncle is Black (Single & Double Rotations)',
      'Time Complexity Analysis O(log n)'
    ],
    teachingMode: 'Chalk & Board',
    learningOutcomes: 'Students can trace Red-Black tree insertion, identify rotation cases, and calculate black height.',
    referenceMaterials: 'CLRS Chapter 13 (pp. 308-325), Lecture Slides Week 5',
    homeworkOrAssignment: 'Solve Exercise 13.3-1 and 13.3-2 from CLRS on balanced color assignments.',
    presentCount: 14,
    totalEnrolled: 60,
    createdAt: '2026-09-14T10:05:00Z',
  },
  {
    id: 'syl-log-2',
    sessionId: 'session-past-1',
    subjectId: 'sub-dsa',
    subjectCode: 'CS601',
    subjectName: 'Data Structures & Algorithms (DSA)',
    facultyId: 'user-teacher-1',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    date: '2026-09-12',
    lectureNo: 27,
    unitName: 'Unit 1: Advanced Balanced Trees',
    topicTitle: 'AVL Trees: LL, RR, LR, RL Rotations',
    subtopicsCovered: [
      'Balance Factor definition (h_left - h_right)',
      'Left-Left and Right-Right single rotations',
      'Left-Right and Right-Left double rotations',
      'Hands-on classroom trace on 8 numerical keys'
    ],
    teachingMode: 'Interactive Problem Solving',
    learningOutcomes: 'Calculate balance factors and perform rotations in O(1) after any unbalanced insertion.',
    referenceMaterials: 'DSA Textbook Page 210-224, Visualgo.net interactive AVL demo',
    homeworkOrAssignment: 'Implement AVL insertion with auto-rotation in C++ / Java.',
    presentCount: 54,
    totalEnrolled: 60,
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'syl-log-3',
    sessionId: 'session-past-2',
    subjectId: 'sub-os',
    subjectCode: 'CS602',
    subjectName: 'Operating Systems (OS)',
    facultyId: 'user-teacher-2',
    facultyName: 'Prof. Sumitra Menaria',
    date: '2026-09-12',
    lectureNo: 24,
    unitName: 'Unit 2: Deadlocks & Resource Allocation',
    topicTitle: "Banker's Algorithm for Deadlock Avoidance",
    subtopicsCovered: [
      'Available, Allocation, Max, and Need Matrices',
      'Safety Algorithm execution and Safe Sequences',
      'Resource-Request Algorithm validation',
      'Numerical problem solving with 5 processes and 3 resource types'
    ],
    teachingMode: 'Chalk & Board',
    learningOutcomes: 'Determine if a system state is safe or unsafe and grant or deny resource requests dynamically.',
    referenceMaterials: 'Silberschatz OS Concepts 10th Ed. Chapter 8',
    homeworkOrAssignment: 'Submit numerical solution for Assignment 3 (Banker Problem set).',
    presentCount: 51,
    totalEnrolled: 60,
    createdAt: '2026-09-12T11:30:00Z',
  },
  {
    id: 'syl-log-4',
    subjectId: 'sub-dbms',
    subjectCode: 'CS603',
    subjectName: 'Database Management Systems (DBMS)',
    facultyId: 'user-teacher-1',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    date: '2026-09-11',
    lectureNo: 22,
    unitName: 'Unit 1: Relational Normalization Theory',
    topicTitle: 'Boyce-Codd Normal Form (BCNF) & Lossless Decomposition',
    subtopicsCovered: [
      'Strict determinant condition for BCNF (X must be a superkey)',
      'Comparison between 3NF and BCNF',
      'Dependency preservation trade-offs',
      'Decomposition algorithm into BCNF'
    ],
    teachingMode: 'PPT & Multimedia',
    learningOutcomes: 'Identify BCNF violations and decompose schemas without losing information.',
    referenceMaterials: 'Korth DBMS 7th Ed. Chapter 7',
    homeworkOrAssignment: 'Find candidate keys and decompose R(A,B,C,D,E) into BCNF.',
    presentCount: 56,
    totalEnrolled: 60,
    createdAt: '2026-09-11T09:30:00Z',
  },
  {
    id: 'syl-log-5',
    subjectId: 'sub-wt',
    subjectCode: 'CS604',
    subjectName: 'Web Technologies & Frameworks',
    facultyId: 'user-teacher-1',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    date: '2026-09-10',
    lectureNo: 20,
    unitName: 'Unit 1: Modern Frontend Engineering',
    topicTitle: 'React Hooks, Custom Hooks & Context API Architecture',
    subtopicsCovered: [
      'Hook lifecycle rules and memory closures',
      'Building reusable useLocalStorage & useGeolocation custom hooks',
      'Context API state propagation without prop drilling'
    ],
    teachingMode: 'Lab Demonstration',
    learningOutcomes: 'Architect scalable React component trees using custom hooks and centralized contexts.',
    referenceMaterials: 'Official React.dev docs, PIT GitHub Repo: lab-week-4',
    homeworkOrAssignment: 'Build a custom hook to track online/offline browser state.',
    presentCount: 58,
    totalEnrolled: 60,
    createdAt: '2026-09-10T14:00:00Z',
  },
  {
    id: 'syl-log-6',
    subjectId: 'sub-ai',
    subjectCode: 'CS605',
    subjectName: 'Artificial Intelligence & ML',
    facultyId: 'user-teacher-2',
    facultyName: 'Prof. Sumitra Menaria',
    date: '2026-09-09',
    lectureNo: 19,
    unitName: 'Unit 1: Informed Search Strategies',
    topicTitle: 'Heuristic Search: A* Search Optimality & Consistency',
    subtopicsCovered: [
      'f(n) = g(n) + h(n) formulation',
      'Admissibility vs Consistency of heuristic functions',
      'Proof of A* optimality with consistent heuristics',
      'Graph search vs tree search redundant path handling'
    ],
    teachingMode: 'PPT & Multimedia',
    learningOutcomes: 'Design admissible heuristics and execute A* graph search step-by-step.',
    referenceMaterials: 'Russell & Norvig AIMA 4th Ed. Chapter 3.5',
    homeworkOrAssignment: 'Calculate Manhattan and Euclidean distance heuristics for 8-puzzle game.',
    presentCount: 52,
    totalEnrolled: 60,
    createdAt: '2026-09-09T10:00:00Z',
  },
  {
    id: 'syl-log-7',
    subjectId: 'sub-dsa',
    subjectCode: 'CS601',
    subjectName: 'Data Structures & Algorithms (DSA)',
    facultyId: 'user-teacher-1',
    facultyName: 'Dr. Shiv Shakti Shrivastava',
    date: '2026-09-08',
    lectureNo: 26,
    unitName: 'Unit 1: Advanced Balanced Trees',
    topicTitle: 'Binary Search Tree Deletion & Complexity Pitfalls',
    subtopicsCovered: [
      'Case 1: Leaf node removal',
      'Case 2: Node with single child',
      'Case 3: Node with two children (Inorder successor / predecessor replacement)',
      'Degenerate skewed BST worst-case O(n)'
    ],
    teachingMode: 'Chalk & Board',
    learningOutcomes: 'Write recursive BST deletion and understand why self-balancing trees are required.',
    referenceMaterials: 'CLRS Chapter 12',
    homeworkOrAssignment: 'Trace deletion of root node on a tree of depth 5.',
    presentCount: 57,
    totalEnrolled: 60,
    createdAt: '2026-09-08T10:00:00Z',
  }
];
