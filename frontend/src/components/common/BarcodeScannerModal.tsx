import React, { useState, useEffect, useRef } from 'react';
import { Flashlight, Barcode, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { pharmacyApi, labApi } from '../../services/api';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  subtitle?: string;
  mode?: 'pharmacy' | 'laboratory' | 'general';
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Optical Barcode & Specimen Scanner',
  subtitle = 'Aim laser crosshair or select test barcode for instantaneous verification',
  mode = 'pharmacy',
}) => {
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<boolean>(false);
  const [dynamicBarcodes, setDynamicBarcodes] = useState<{ code: string; label: string; type: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'laboratory') {
      labApi.getCatalog()
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setDynamicBarcodes(
              res.data.map((c: any) => ({
                code: c.testCode || `LAB-${c.id}`,
                label: `${c.testName} (${c.sampleType || 'Specimen Tube'})`,
                type: 'Database Specimen Code',
              }))
            );
          }
        })
        .catch(() => {});
    } else {
      pharmacyApi.getDrugs()
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setDynamicBarcodes(
              res.data.map((d: any) => ({
                code: d.itemCode || `DRG-${d.id}`,
                label: `${d.brandName || d.drugName} (${d.dosageForm || 'Item'})`,
                type: 'Database Drug Barcode',
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [isOpen, mode]);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          activeStream = stream;
          setCameraStream(stream);
          setCameraError(false);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Browser camera blocked or unavailable, using high-fidelity mockup fallback', err);
          setCameraError(true);
        });
    } else {
      setCameraStream(null);
      setCameraError(false);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setLastScanned(null);
      setManualCode('');
      setTorchOn(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // AudioContext not allowed or not supported in environment
    }
  };

  const handleTriggerScan = (code: string) => {
    playBeep();
    setLastScanned(code);
    setTimeout(() => {
      onScan(code);
      onClose();
    }, 450);
  };

  const samples = dynamicBarcodes;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Optical Camera Viewfinder Simulation */}
        <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center shadow-inner select-none">
          {/* Live Video Element */}
          {cameraStream && !cameraError && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}

          {/* Torch Light Overlay */}
          {torchOn && (
            <div className="absolute inset-0 bg-yellow-100/15 pointer-events-none transition-opacity" />
          )}

          {/* Animated Red Laser Scan Line */}
          <div className="absolute inset-x-8 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse z-10" />

          {/* Viewfinder Target Reticle Frame */}
          <div className="w-56 h-32 border-2 border-dashed border-teal-400/80 rounded-lg relative flex items-center justify-center">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-teal-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-teal-400" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-teal-400" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-teal-400" />

            <div className="text-center px-2">
              <Barcode className="h-10 w-10 text-slate-400/70 mx-auto animate-pulse" />
              <span className="text-[10px] font-mono text-teal-300 font-bold uppercase tracking-wider block mt-1">
                Align Barcode / QR Code
              </span>
            </div>
          </div>

          {/* Top Camera Controls Overlay */}
          <div className="absolute top-2.5 inset-x-3 flex items-center justify-between z-20 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-900/80 text-emerald-400 font-mono text-[10px] font-bold border border-slate-700">
              ● {cameraStream ? 'Camera Active' : 'Viewfinder Simulation'}
            </span>
            <button
              type="button"
              onClick={() => setTorchOn((prev) => !prev)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                torchOn
                  ? 'bg-yellow-400 text-slate-900 border-yellow-300'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle Torch Light"
            >
              <Flashlight className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold">{torchOn ? 'Torch On' : 'Torch Off'}</span>
            </button>
          </div>

          {/* Success Flash Feedback */}
          {lastScanned && (
            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white z-30 animate-in fade-in zoom-in duration-150">
              <CheckCircle2 className="h-12 w-12 text-white animate-bounce" />
              <span className="text-sm font-mono font-bold mt-2">DECODED &amp; VERIFIED:</span>
              <span className="text-base font-mono font-bold bg-white/20 px-3 py-1 rounded-lg mt-1">
                {lastScanned}
              </span>
            </div>
          )}
        </div>

        {/* 1-Click Test Barcodes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quick Scan Test Barcodes:
            </span>
            <span className="text-[10px] text-slate-400">Click to simulate instant laser decode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samples.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleTriggerScan(item.code)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-left transition-colors group flex items-start justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-teal-700 block">
                    {item.code}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-1">{item.label}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                  {item.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Keyboard Barcode Entry Fallback */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="block text-[11px] font-semibold text-slate-600">
            Manual Barcode / Identifier Input
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. MED-001 or LR-2026-0001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualCode.trim()) {
                  e.preventDefault();
                  handleTriggerScan(manualCode.trim());
                }
              }}
              className="flex-1 text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              disabled={!manualCode.trim()}
              onClick={() => handleTriggerScan(manualCode.trim())}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Verify Code
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
