import React, { useState } from 'react';
import { X, QrCode, ArrowRight, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { INITIAL_USERS } from '../data/initialData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const allUsers = StorageService.getAllUsers();

    if (isRegister) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Please fill in all required fields.');
        return;
      }

      const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setError('An account with this email already exists.');
        return;
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        enrollmentNo: role === 'student' ? enrollmentNo.trim() || `230305105${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        department: 'Computer Science & Engineering',
        college: 'Parul Institute of Technology, Vadodara',
        semester: role === 'student' ? 'Semester VI' : undefined,
        designation: role === 'teacher' ? 'Assistant Professor, CSE' : undefined,
      };

      StorageService.addUser(newUser);
      StorageService.setCurrentUser(newUser);
      onSuccess(newUser);
      onClose();
    } else {
      // Login mode
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }

      const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        StorageService.setCurrentUser(found);
        onSuccess(found);
        onClose();
      } else {
        // Fallback or create guest user if email contains student or teacher
        const isTeacher = email.includes('teacher') || email.includes('faculty') || role === 'teacher';
        const fallbackUser: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].replace('.', ' '),
          email: email.toLowerCase(),
          role: isTeacher ? 'teacher' : 'student',
          enrollmentNo: isTeacher ? undefined : '2303051051127',
          college: 'Parul Institute of Technology',
          department: 'Computer Science & Engineering',
        };
        StorageService.addUser(fallbackUser);
        StorageService.setCurrentUser(fallbackUser);
        onSuccess(fallbackUser);
        onClose();
      }
    }
  };

  const handleQuickDemo = (user: User) => {
    StorageService.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Card Header matching PDF Page 36 screenshot */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isRegister ? 'Create an Account' : 'Welcome back'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister ? 'Join Parul Institute of Technology Attendance' : 'Sign in to Attendify'}
            </p>
          </div>

          {/* Role selector for registration or quick login */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'student'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'teacher'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Faculty / Teacher
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder={role === 'student' ? 'e.g. Madhav Sen' : 'e.g. Dr. Shiv Shakti'}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {isRegister && role === 'student' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Enrollment Number</label>
                <input
                  type="text"
                  placeholder="e.g. 2303051051127"
                  value={enrollmentNo}
                  onChange={e => setEnrollmentNo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              id="auth-submit-btn"
            >
              <span>{isRegister ? 'Create Account' : 'Sign In ->'}</span>
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>

          {/* Demo accounts matching PDF Page 36 footer */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Demo accounts:
            </p>
            <div className="space-y-1.5 text-xs">
              <div 
                onClick={() => handleQuickDemo(INITIAL_USERS[0])}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-semibold text-slate-800">Teacher: </span>
                  <span className="text-slate-600">teacher.cse@parul.edu</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-mono">pass123</span>
              </div>

              <div 
                onClick={() => handleQuickDemo(INITIAL_USERS[2])}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-semibold text-slate-800">Student: </span>
                  <span className="text-slate-600">2303051051127@parul.edu</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-mono">pass123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
