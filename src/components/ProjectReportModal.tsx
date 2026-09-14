import React from 'react';
import { X, Award, FileText, CheckCircle2, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectReportModal: React.FC<ProjectReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  NAAC A++ Accredited
                </span>
                <span className="text-xs text-slate-400">Session AY 2025-2026</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">Parul University - Project Report</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs leading-relaxed">
          {/* Title block */}
          <div className="text-center p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700">Minor Project Report</p>
            <h2 className="text-xl font-black text-slate-900 mt-1 uppercase">
              Smart Attendance System Using QR Code
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Department of Computer Science & Engineering • Parul Institute of Technology, Vadodara, Gujarat
            </p>
          </div>

          {/* Project Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Submitted By (B.Tech CSE Sem VI):</span>
              </h4>
              <ul className="space-y-1.5 font-medium text-slate-800">
                <li className="flex justify-between">
                  <span>MADHAV SEN</span>
                  <span className="font-mono text-slate-500 text-[11px]">2303051051127</span>
                </li>
                <li className="flex justify-between">
                  <span>VAIBHAV YADAV</span>
                  <span className="font-mono text-slate-500 text-[11px]">2303051051082</span>
                </li>
                <li className="flex justify-between">
                  <span>PARMAR KEVAL</span>
                  <span className="font-mono text-slate-500 text-[11px]">2303051051139</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Academic Guidance & Leadership:</span>
              </h4>
              <div className="space-y-2">
                <div>
                  <p className="font-bold text-slate-900">Dr. Shiv Shakti Shrivastava</p>
                  <p className="text-[11px] text-slate-500">Project Guide, Assistant Professor (CSE)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Prof. Sumitra Menaria</p>
                  <p className="text-[11px] text-slate-500">Head of Department (CSE), PIT Vadodara</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Dr. Swapnil Parikh</p>
                  <p className="text-[11px] text-slate-500">Principal, Parul Institute of Technology</p>
                </div>
              </div>
            </div>
          </div>

          {/* Abstract summary from Page 7 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              Report Abstract & System Architecture
            </h4>
            <p className="text-slate-600">
              Traditional paper-based registers and manual roll calls are prone to human error, proxy attendance, and time loss in college classrooms. 
              <strong> Attendify (Smart Attendance System using QR Code)</strong> solves this through dynamic QR codes that refresh every 30 seconds on the projector, paired with GPS geofence verification to ensure students are physically inside the classroom.
            </p>
          </div>

          {/* Technology stack used (Chapter IV Software Requirements) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
              Project Platforms & Specifications (Page 18-20)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div>• React.js & TypeScript</div>
              <div>• Vite Build Tooling</div>
              <div>• Tailwind CSS Design</div>
              <div>• QR Engine (Dynamic Rotation)</div>
              <div>• GPS Geofence Engine</div>
              <div>• Recharts Analytics</div>
              <div>• Anti-Proxy Tokenizer</div>
              <div>• CSV/PDF Export Engine</div>
              <div>• Real-time Cross-tab Sync</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Report View
          </button>
        </div>
      </div>
    </div>
  );
};
