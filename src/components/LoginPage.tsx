import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  UserCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Award,
  ArrowLeft,
  Building
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { User, UserRole } from '../types';

interface LoginPageProps {
  onSuccess: (user: User) => void;
  onExploreLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onExploreLanding }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Registration state
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regId, setRegId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = StorageService.authenticateUser(identifier, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'Invalid credentials. Please verify and try again.');
      }
    }, 250);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Check if email already registered
    const existing = StorageService.getAllUsers().find(
      u => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );
    if (existing) {
      setErrorMessage('An account with this email already exists. Please sign in instead.');
      return;
    }

    const newUser: User = {
      id: `user-${regRole}-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: regRole,
      college: 'Parul Institute of Technology, Vadodara',
      department: 'Computer Science & Engineering',
      ...(regRole === 'student'
        ? {
            enrollmentNo: regId.trim() || `230305105${Math.floor(1000 + Math.random() * 9000)}`,
            semester: 'Semester VI (AY 2025-26)',
          }
        : {
            facultyId: regId.trim() || `FAC-CSE-${Math.floor(1000 + Math.random() * 9000)}`,
            designation: 'Assistant Professor, CSE',
          }),
    };

    StorageService.addUser(newUser);
    StorageService.setCurrentUser(newUser);
    onSuccess(newUser);
  };

  const fillDemoCredentials = (type: 'student' | 'teacher') => {
    setErrorMessage('');
    setMode('login');
    if (type === 'student') {
      setIdentifier('2303051051127@parul.edu');
      setPassword('pass123');
    } else {
      setIdentifier('teacher.cse@parul.edu');
      setPassword('pass123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-200/40 blur-3xl pointer-events-none" />

      {/* Top institution navigation / back button */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            A
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">AttendIFY</span>
            <span className="text-[10px] text-slate-400 block -mt-1">PIT Vadodara</span>
          </div>
        </div>

        {onExploreLanding && (
          <button
            onClick={onExploreLanding}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>System Overview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Dedicated Login Card matching Page 36 GUI */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 relative">
          {/* Header block from Page 36: Icon + Welcome back */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to Attendify • Smart Attendance Portal
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Register */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address or Enrollment / Faculty ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="you@college.edu or 2303051051127"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="login-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    id="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70"
                id="login-submit-btn"
              >
                {isLoading ? (
                  <span>Authenticating credentials...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Credentials Quick-Fill section matching page 36 */}
              <div className="pt-4 border-t border-slate-100 mt-5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Click to populate demo credentials:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('teacher')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-violet-300 bg-slate-50/70 hover:bg-violet-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-violet-700">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Faculty Account</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      teacher.cse@parul.edu
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      pass: <span className="font-semibold text-slate-700">pass123</span>
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('student')}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/70 hover:bg-indigo-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-700">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student (Madhav)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                      2303051051127@parul.edu
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      pass: <span className="font-semibold text-slate-700">pass123</span>
                    </p>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'student'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('teacher')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'teacher'
                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={regRole === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Dr. A. K. Gupta'}
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@parul.edu"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {regRole === 'student' ? 'Enrollment No.' : 'Faculty ID'}
                  </label>
                  <input
                    type="text"
                    placeholder={regRole === 'student' ? '230305105XXXX' : 'FAC-CSE-XXXX'}
                    value={regId}
                    onChange={e => setRegId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 4 chars"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                id="register-submit-btn"
              >
                <span>Create Account & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Parul University Footer Info */}
        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-600">
            Parul Institute of Technology, Vadodara
          </p>
          <p className="text-[11px]">
            Department of Computer Science & Engineering • NAAC A++
          </p>
        </div>
      </div>
    </div>
  );
};
