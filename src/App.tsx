import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { QRScannerModal } from './components/QRScannerModal';
import { CreateSessionModal } from './components/CreateSessionModal';
import { SessionDetailModal } from './components/SessionDetailModal';
import { AnalyticsView } from './components/AnalyticsView';
import { DailySyllabusLogView } from './components/DailySyllabusLogView';
import { ProjectReportModal } from './components/ProjectReportModal';
import { StorageService } from './services/storageService';
import { User, AttendanceSession, AttendanceRecord } from './types';
import { 
  BarChart3, 
  QrCode, 
  History, 
  BookOpen, 
  PlusCircle, 
  RefreshCcw, 
  ShieldCheck, 
  Award,
  Layers
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [loggedOutView, setLoggedOutView] = useState<'login' | 'landing'>('login');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<AttendanceSession | null>(null);

  // Initialize and subscribe to storage
  useEffect(() => {
    StorageService.init();
    setCurrentUser(StorageService.getCurrentUser());

    const unsubscribe = StorageService.subscribe((event) => {
      if (event.type === 'USER_CHANGED') {
        setCurrentUser(StorageService.getCurrentUser());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setLoggedOutView('login');
    setCurrentTab('dashboard');
    setIsScannerOpen(false);
    setIsCreateSessionOpen(false);
    setSelectedSessionForDetails(null);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleAttendanceMarked = (record: AttendanceRecord) => {
    // Record was marked, dashboard will auto-refresh via broadcast/storage subscription
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo attendance sessions and records to default state?')) {
      StorageService.resetToDefault();
      setCurrentUser(StorageService.getCurrentUser());
      setCurrentTab('dashboard');
    }
  };

  // If user is not logged in, render dedicated login or overview
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
        {loggedOutView === 'login' ? (
          <LoginPage
            onSuccess={handleLoginSuccess}
            onExploreLanding={() => setLoggedOutView('landing')}
          />
        ) : (
          <div>
            <Navbar
              currentUser={null}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              onOpenScanner={() => setLoggedOutView('login')}
              onOpenCreateSession={() => setLoggedOutView('login')}
              onOpenAuth={() => setLoggedOutView('login')}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onLogout={handleLogout}
            />
            <LandingPage
              onOpenLogin={() => setLoggedOutView('login')}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          </div>
        )}

        <ProjectReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCreateSession={() => setIsCreateSessionOpen(true)}
        onOpenAuth={() => {}}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <div>
          {currentTab === 'dashboard' && (
            <>
              {currentUser.role === 'student' ? (
                <StudentDashboard
                  currentUser={currentUser}
                  onOpenScanner={() => setIsScannerOpen(true)}
                />
              ) : (
                <TeacherDashboard
                  currentUser={currentUser}
                  onOpenCreateSession={() => setIsCreateSessionOpen(true)}
                  onViewSessionDetails={(session) => setSelectedSessionForDetails(session)}
                />
              )}
            </>
          )}

          {currentTab === 'history' && currentUser.role === 'student' && (
            <StudentDashboard
              currentUser={currentUser}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {currentTab === 'syllabus' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <DailySyllabusLogView
                currentUser={currentUser}
                isFacultyView={currentUser.role === 'teacher'}
              />
            </div>
          )}

          {currentTab === 'analytics' && currentUser.role === 'teacher' && (
            <AnalyticsView />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (for phones and compact screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('syllabus')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            currentTab === 'syllabus' ? 'text-indigo-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>Syllabus</span>
        </button>

        {currentUser.role === 'student' ? (
          <>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex flex-col items-center -mt-4 py-2 px-3 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300 active:scale-95 transition-transform"
            >
              <QrCode className="w-6 h-6" />
              <span className="text-[9px] font-bold mt-0.5">Scan QR</span>
            </button>

            <button
              onClick={() => setCurrentTab('history')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
                currentTab === 'history' ? 'text-indigo-600 font-bold' : 'text-slate-500'
              }`}
            >
              <History className="w-5 h-5 mb-0.5" />
              <span>History</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsCreateSessionOpen(true)}
              className="flex flex-col items-center -mt-4 py-2 px-3 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300 active:scale-95 transition-transform"
            >
              <PlusCircle className="w-6 h-6" />
              <span className="text-[9px] font-bold mt-0.5">New Session</span>
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
                currentTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-500'
              }`}
            >
              <BarChart3 className="w-5 h-5 mb-0.5" />
              <span>Reports</span>
            </button>
          </>
        )}

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium text-slate-500"
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span>Project</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AttendIFY</span>
            <span>•</span>
            <span>Parul Institute of Technology, Vadodara</span>
            <span>•</span>
            <span className="text-slate-400">Dept. of Computer Science & Engineering</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Report Details
            </button>
            <span>•</span>
            <button
              onClick={handleResetDemoData}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              title="Reset mock data to default state"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </footer>

      {currentUser && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          currentUser={currentUser}
          onAttendanceMarked={handleAttendanceMarked}
        />
      )}

      {currentUser && (
        <CreateSessionModal
          isOpen={isCreateSessionOpen}
          onClose={() => setIsCreateSessionOpen(false)}
          currentUser={currentUser}
          onSessionCreated={() => setCurrentTab('dashboard')}
        />
      )}

      <SessionDetailModal
        session={selectedSessionForDetails}
        isOpen={!!selectedSessionForDetails}
        onClose={() => setSelectedSessionForDetails(null)}
      />

      <ProjectReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}

