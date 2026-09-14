import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { 
  X, 
  Camera, 
  Upload, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  ArrowRight,
  Info
} from 'lucide-react';
import { User, AttendanceRecord, AttendanceSession } from '../types';
import { StorageService } from '../services/storageService';
import { PARUL_PIT_LOCATION } from '../data/initialData';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAttendanceMarked: (record: AttendanceRecord) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAttendanceMarked,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'quickTest'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [lastSuccessRecord, setLastSuccessRecord] = useState<AttendanceRecord | null>(null);

  // GPS State
  const [useSimulatedGps, setUseSimulatedGps] = useState(true);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: PARUL_PIT_LOCATION.latitude + 0.0001,
    longitude: PARUL_PIT_LOCATION.longitude + 0.0001,
  });
  const [calculatedDistance, setCalculatedDistance] = useState<number>(14);

  // Video and Canvas refs for camera scanning
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeSession = StorageService.getActiveSession();

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      setLastSuccessRecord(null);
      setProcessing(false);
      
      // Determine real geolocation if allowed
      if ('geolocation' in navigator && !useSimulatedGps) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            setUserCoords({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            if (activeSession) {
              const dist = StorageService.calculateDistanceMeters(
                pos.coords.latitude,
                pos.coords.longitude,
                activeSession.location.latitude,
                activeSession.location.longitude
              );
              setCalculatedDistance(Math.round(dist));
            }
          },
          err => {
            console.warn('Geolocation access declined, falling back to simulated classroom coordinates', err);
            setUseSimulatedGps(true);
          }
        );
      }
    } else {
      stopCamera();
    }
  }, [isOpen]);

  // Start / Stop camera when tab changes
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !lastSuccessRecord) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab, lastSuccessRecord]);

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanVideoFrame();
      }
    } catch (err: any) {
      console.warn('Camera initiation notice:', err);
      setCameraError(
        'Camera not accessible or permission not granted. You can use the Image Upload scanner or Quick Test scan button below!'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Continuous loop checking frames for QR code
  const scanVideoFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // QR Code detected!
        handleProcessQrCode(code.data);
        return; // Don't request next frame while processing
      }
    }

    animationFrameId.current = requestAnimationFrame(scanVideoFrame);
  };

  // Process decoded QR payload
  const handleProcessQrCode = (payload: string) => {
    if (processing) return;
    setProcessing(true);
    stopCamera();

    const targetCoords = useSimulatedGps
      ? {
          latitude: PARUL_PIT_LOCATION.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: PARUL_PIT_LOCATION.longitude + (Math.random() - 0.5) * 0.0001,
        }
      : userCoords;

    const result = StorageService.markAttendance({
      scannedPayload: payload,
      studentUser: currentUser,
      studentCoords: targetCoords,
      skipGpsCheck: false,
    });

    if (result.success && result.record) {
      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#10b981', '#6366f1'],
      });

      setLastSuccessRecord(result.record);
      setStatusMessage({ type: 'success', text: result.message });
      onAttendanceMarked(result.record);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
      setProcessing(false);
    }
  };

  // Handle image upload decode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code && code.data) {
          handleProcessQrCode(code.data);
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Could not detect a valid Attendify QR code in this image. Please ensure the code is clear and not blurry.',
          });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // One-click test scan of active session
  const handleDirectTestScan = () => {
    if (!activeSession) {
      setStatusMessage({
        type: 'error',
        text: 'No active teacher attendance session found. Please launch a session first from the Faculty portal!',
      });
      return;
    }

    const payload = JSON.stringify({
      sessionId: activeSession.id,
      secret: activeSession.qrSecret,
      subject: activeSession.subjectCode,
    });

    handleProcessQrCode(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scan Attendance QR</h3>
              <p className="text-[11px] text-slate-500">Parul University PIT • Computer Science</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* If already successfully recorded */}
          {lastSuccessRecord ? (
            <div className="text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                ATTENDANCE RECORDED
              </span>

              <h4 className="text-xl font-extrabold text-slate-900">
                {lastSuccessRecord.subjectName}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Faculty: {lastSuccessRecord.facultyName}
              </p>

              {/* Digital Attendance Pass Receipt */}
              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Student</span>
                  <span className="font-semibold text-slate-900">{lastSuccessRecord.studentName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Enrollment No.</span>
                  <span className="font-mono font-semibold text-slate-900">{lastSuccessRecord.enrollmentNo}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Time Marked</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(lastSuccessRecord.timestamp).toLocaleTimeString()} ({lastSuccessRecord.date})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Anti-Proxy Geofence</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>PIT Block 402 ({lastSuccessRecord.distanceMeters ?? 14}m)</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Tabs: Camera vs Image File vs Quick Test */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
                <button
                  onClick={() => { setActiveTab('camera'); setStatusMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'camera' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera</span>
                </button>

                <button
                  onClick={() => { setActiveTab('upload'); setStatusMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'upload' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR</span>
                </button>

                <button
                  onClick={() => { setActiveTab('quickTest'); setStatusMessage(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'quickTest' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Test</span>
                </button>
              </div>

              {/* Status or Error Banner */}
              {statusMessage && (
                <div
                  className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                    statusMessage.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{statusMessage.text}</div>
                </div>
              )}

              {/* TAB 1: Live Video Camera View */}
              {activeTab === 'camera' && (
                <div>
                  <div className="relative aspect-square max-w-[320px] mx-auto bg-slate-950 rounded-2xl overflow-hidden shadow-inner border-2 border-indigo-600/30 flex items-center justify-center">
                    {/* Video Stream */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />

                    {/* Viewfinder Target Graphic */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-dashed border-indigo-400/80 rounded-2xl relative">
                        {/* Target Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-500 rounded-tl"></div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-500 rounded-tr"></div>
                        <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-500 rounded-bl"></div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-500 rounded-br"></div>
                        
                        {/* Scanning Laser Animation Line */}
                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce"></div>
                      </div>
                    </div>

                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                        <p className="text-xs text-slate-300 mb-4">{cameraError}</p>
                        <button
                          onClick={handleDirectTestScan}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                        >
                          Use 1-Click Scan Test Instead
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-[11px] text-slate-500 mt-3">
                    Point your camera at the lecture QR code displayed on the classroom projector.
                  </p>
                </div>
              )}

              {/* TAB 2: Upload QR Image File */}
              {activeTab === 'upload' && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    id="qr-upload-input"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="qr-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Upload QR Code Image or Screenshot
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG, or screenshot from mobile camera
                    </p>
                    <span className="mt-4 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm">
                      Browse File
                    </span>
                  </label>
                </div>
              )}

              {/* TAB 3: Instant 1-Click Test Scan */}
              {activeTab === 'quickTest' && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Direct Test Simulation</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                    Instantly simulate scanning the teacher's active lecture QR code with geofence validation.
                  </p>

                  {activeSession ? (
                    <div className="mb-4 p-3 rounded-xl bg-white border border-slate-200 text-left text-xs">
                      <div className="font-semibold text-slate-800">
                        {activeSession.subjectCode}: {activeSession.subjectName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Faculty: {activeSession.facultyName} • {activeSession.room}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium">
                      No active lecture session is currently running. Switch to Faculty account to create one!
                    </div>
                  )}

                  <button
                    onClick={handleDirectTestScan}
                    disabled={!activeSession}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                    id="trigger-test-scan-btn"
                  >
                    Simulate Successful QR Scan
                  </button>
                </div>
              )}

              {/* Anti-Proxy Location Geofence Toggle Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>GPS Geofence: </span>
                  <span className="font-semibold text-emerald-700">PIT Vadodara (~{calculatedDistance}m)</span>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500">
                  <input
                    type="checkbox"
                    checked={useSimulatedGps}
                    onChange={e => setUseSimulatedGps(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Simulate Classroom</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
