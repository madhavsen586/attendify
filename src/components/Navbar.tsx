import React, { useState } from 'react';
import { 
  QrCode, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  BarChart3, 
  History, 
  PlusCircle, 
  ChevronDown, 
  BookOpen, 
  Menu, 
  X,
  FileText
} from 'lucide-react';
import { User } from '../types';
import { StorageService } from '../services/storageService';

interface NavbarProps {
  currentUser: User | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenScanner: () => void;
  onOpenCreateSession: () => void;
  onOpenAuth: () => void;
  onOpenReportModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  setCurrentTab,
  onOpenScanner,
  onOpenCreateSession,
  onOpenAuth,
  onOpenReportModal,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const allUsers = StorageService.getAllUsers();

  const handleSwitchUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Academic Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-white">PARUL UNIVERSITY</span>
          <span className="text-slate-500">|</span>
          <span>Parul Institute of Technology (PIT Vadodara)</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">Dept. of Computer Science & Engineering (AY 2025-26)</span>
        </div>
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[11px]"
          id="project-report-btn"
        >
          <FileText className="w-3 h-3 text-indigo-400" />
          <span>View Minor Project Report Info</span>
        </button>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - AttendIFY */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setCurrentTab('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              id="brand-logo"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                    Attend<span className="text-indigo-600">IFY</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200/60">
                    Smart QR
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Real-time Lecture Attendance</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            {currentUser && (
              <nav className="hidden md:flex items-center gap-1 ml-4">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    currentTab === 'dashboard'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  id="nav-dashboard"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                {currentUser.role === 'student' ? (
                  <>
                    <button
                      onClick={onOpenScanner}
                      className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 cursor-pointer"
                      id="nav-scan-qr"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Scan QR Code</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('history')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentTab === 'history'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      id="nav-history"
                    >
                      <History className="w-4 h-4" />
                      <span>My History</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('syllabus')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentTab === 'syllabus'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      id="nav-student-syllabus"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Class Diary & Syllabus</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onOpenCreateSession}
                      className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 cursor-pointer"
                      id="nav-create-session"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Generate QR Session</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('syllabus')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentTab === 'syllabus'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      id="nav-teacher-syllabus"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Daily Syllabus Log</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-800">
                        Faculty
                      </span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('analytics')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        currentTab === 'analytics'
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      id="nav-analytics"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Class Reports</span>
                    </button>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* Right Action / User Profile Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    id="user-profile-menu-btn"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-xs">
                      <p className="font-semibold text-slate-800 leading-tight truncate max-w-[140px]">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                        {currentUser.role === 'teacher' ? (
                          <span className="text-violet-600 font-medium">Faculty</span>
                        ) : (
                          <span className="text-indigo-600 font-medium">
                            {currentUser.enrollmentNo ? `Enr: ${currentUser.enrollmentNo.slice(-4)}` : 'Student'}
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                        {currentUser.enrollmentNo && (
                          <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-700">
                            ID: {currentUser.enrollmentNo}
                          </div>
                        )}
                      </div>

                      {/* Switch role quick-pickers */}
                      <div className="px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1">
                          Switch Account (Demo)
                        </p>
                        <div className="space-y-1 max-h-52 overflow-y-auto">
                          {allUsers.map(u => (
                            <button
                              key={u.id}
                              onClick={() => handleSwitchUser(u)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                currentUser.id === u.id
                                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <div className="truncate">
                                <span className="font-medium">{u.name}</span>
                                <span className="text-slate-400 text-[10px] ml-1.5">
                                  ({u.role === 'teacher' ? 'Faculty' : 'Student'})
                                </span>
                              </div>
                              {currentUser.id === u.id && (
                                <span className="text-[10px] text-indigo-600 font-bold">Active</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                          id="dropdown-signout-btn"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Sign Out Button (matching PDF Page 37 & 39 design) */}
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:border-rose-300 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  id="nav-direct-logout-btn"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer"
                  id="nav-login-btn"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenAuth}
                  className="text-xs font-semibold bg-indigo-600 text-white px-3.5 py-2 rounded-lg hover:bg-indigo-700 shadow-sm cursor-pointer"
                  id="nav-register-btn"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {currentUser && (
            <div className="space-y-1">
              <button
                onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  currentTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {currentUser.role === 'student' ? (
                <>
                  <button
                    onClick={() => { onOpenScanner(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan Lecture QR Code</span>
                  </button>
                  <button
                    onClick={() => { setCurrentTab('history'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    <span>Attendance History</span>
                  </button>
                  <button
                    onClick={() => { setCurrentTab('syllabus'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Class Diary & Syllabus</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenCreateSession(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Start New QR Session</span>
                  </button>
                  <button
                    onClick={() => { setCurrentTab('syllabus'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Daily Syllabus Log</span>
                  </button>
                  <button
                    onClick={() => { setCurrentTab('analytics'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Attendance Reports</span>
                  </button>
                </>
              )}

              {/* Mobile Sign Out */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  id="mobile-signout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({currentUser.name})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
