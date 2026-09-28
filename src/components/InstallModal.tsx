import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  X,
  Share2,
  Layers,
  Sparkles
} from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose, appUrl }) => {
  const { isInstallable, isInstalled, install, isAndroid, isIOS } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? (appUrl || window.location.href) : appUrl;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 font-mono font-bold text-base">
              fx
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg tracking-tight">Install on Android Device</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  APK / WebAPK Ready
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Run OmniCalc Pro as a standalone app with full offline support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Status banner if already installed */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">OmniCalc Pro is already installed!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  You are running the application in standalone mode from your home screen / app drawer.
                </p>
              </div>
            </div>
          ) : installSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Installation triggered!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Check your device home screen or app drawer for OmniCalc Pro.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            /* Direct 1-Click Install Button if supported on current browser */
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span>Direct One-Click Install</span>
                </h4>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                  Android Chrome generates and registers a native WebAPK automatically.
                </p>
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
              >
                <Download size={16} />
                <span>Install APK Now</span>
              </button>
            </div>
          ) : null}

          {/* Section: Scan QR Code with Phone */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-850/40">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-3">
              <Smartphone size={17} className="text-indigo-600" />
              <span>Install on your Android Phone / Tablet</span>
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* QR Code Container */}
              <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-sm shrink-0">
                <QRCodeSVG
                  value={currentUrl}
                  size={140}
                  level="M"
                  includeMargin={false}
                  imageSettings={{
                    src: '/pwa-192x192.png',
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>

              {/* Instructions */}
              <div className="flex-1 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Quick 2-step setup:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-600 dark:text-neutral-400">
                  <li>
                    Open camera on your Android phone and scan this QR code (or open Chrome).
                  </li>
                  <li>
                    Tap the banner <strong className="text-neutral-800 dark:text-neutral-200">&quot;Add to Home screen&quot;</strong> or tap <strong className="text-neutral-800 dark:text-neutral-200">⋮ (menu) &rarr; &quot;Install app&quot;</strong>.
                  </li>
                  <li>
                    Android will generate a native <strong className="text-indigo-600 dark:text-indigo-400">WebAPK</strong> with its own icon in your app drawer.
                  </li>
                </ol>

                {/* Shareable Link row */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300 select-all truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 text-xs font-semibold bg-neutral-200 dark:bg-neutral-750 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1 shrink-0"
                  >
                    {copiedUrl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Standalone Signed APK / Google Play package via PWABuilder */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-850/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Layers size={17} className="text-indigo-600" />
                  <span>Build Standalone APK (.apk / .aab)</span>
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Need a distributable <code className="font-mono text-neutral-700 dark:text-neutral-300">.apk</code> file to sideload or submit to Google Play Store?
                </p>
              </div>
              <a
                href={pwabuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Generate APK</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 space-y-1 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              <p>
                1. Click <strong>Generate APK</strong> (powered by Microsoft PWABuilder).
              </p>
              <p>
                2. Click <strong>&quot;Package for Android&quot;</strong> &rarr; Select <strong>&quot;Download APK&quot;</strong>.
              </p>
              <p>
                3. Transfer the downloaded <code className="font-mono text-neutral-700 dark:text-neutral-300">.apk</code> to your device and tap to install!
              </p>
            </div>
          </div>

          {/* Offline support highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-0.5">
                ⚡ 100% Offline Capable
              </span>
              <span className="text-neutral-500 text-[11px]">
                Service Worker caches all formulas, icons, and math engine locally.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-0.5">
                📱 Fullscreen Native Feel
              </span>
              <span className="text-neutral-500 text-[11px]">
                Runs without browser address bar, feels just like a native calculator app.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/50 flex items-center justify-between text-xs">
          <span className="text-neutral-400 text-[11px]">
            Compatible with Android 8.0+ & iOS 14+
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-200 dark:bg-neutral-750 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
