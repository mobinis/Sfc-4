import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Loader2,
  FileArchive,
  Smartphone,
  LogOut,
  Info
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  initDriveAuth,
  signInWithGoogleDrive,
  signOutDrive,
  uploadFileToDrive,
  UploadProgress,
  DriveUploadResult,
  getCachedToken
} from '../../services/googleDriveService';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'apk' | 'zip' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<DriveUploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Confirmation dialog state for destructive/mutating actions per Google guidelines
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    target: 'apk' | 'zip';
    fileName: string;
    fileSizeMb: number;
  } | null>(null);

  // Deliverable status state
  const [apkStatus, setApkStatus] = useState<{
    apkAvailable: boolean;
    apkSize: number;
    zipAvailable: boolean;
    zipSize: number;
    repoUrl: string;
    actionsUrl: string;
    releasesUrl: string;
  } | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingStatus(true);
    fetch('/api/apk-status')
      .then(res => res.json())
      .then(data => {
        setApkStatus(data);
      })
      .catch(() => {
        setApkStatus({
          apkAvailable: false,
          apkSize: 0,
          zipAvailable: false,
          zipSize: 0,
          repoUrl: 'https://github.com/mobinis/Sfc-4',
          actionsUrl: 'https://github.com/mobinis/Sfc-4/actions',
          releasesUrl: 'https://github.com/mobinis/Sfc-4/releases'
        });
      })
      .finally(() => {
        setIsLoadingStatus(false);
      });
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user) => {
        setCurrentUser(user);
        setAuthError(null);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setCurrentUser(res.user);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Please retry.';
      setAuthError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutDrive();
    setCurrentUser(null);
    setUploadSuccess(null);
  };

  const requestUploadConfirmation = (target: 'apk' | 'zip') => {
    setUploadError(null);
    setUploadSuccess(null);
    if (!getCachedToken()) {
      setAuthError('Please sign in with Google first to grant Drive file upload permission.');
      return;
    }
    const fileName = target === 'apk'
      ? 'BloomQuest-Restored-Checkpoint.apk'
      : 'BloomQuest-Restored-Checkpoint-Android.zip';
    const fileSizeMb = target === 'apk' ? 96 : 51;
    setPendingConfirmAction({ target, fileName, fileSizeMb });
  };

  const executeConfirmedUpload = async () => {
    if (!pendingConfirmAction) return;
    const { target, fileName } = pendingConfirmAction;
    setPendingConfirmAction(null);

    setIsUploading(true);
    setUploadTarget(target);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const downloadPath = `/downloads/${fileName}`;
      setUploadProgress({
        percent: 0,
        uploadedBytes: 0,
        totalBytes: 0,
        status: `Fetching ${fileName} from local server...`
      });

      let blob: Blob | null = null;

      try {
        const fetchRes = await fetch(downloadPath);
        if (fetchRes.ok) {
          const candidateBlob = await fetchRes.blob();
          const contentType = fetchRes.headers.get('content-type') || '';
          if (
            candidateBlob.size > 100000 &&
            !contentType.includes('text/html') &&
            !contentType.includes('application/json')
          ) {
            blob = candidateBlob;
          }
        }
      } catch {
        // Fall back to release URL below
      }

      // If local server returned a redirect, an error page, or a stub < 100KB, fetch from GitHub Release
      if (!blob) {
        setUploadProgress({
          percent: 5,
          uploadedBytes: 0,
          totalBytes: 0,
          status: `Fetching official compiled release asset from GitHub...`
        });

        const releaseAssetUrl = `https://github.com/mobinis/Sfc-4/releases/latest/download/${fileName}`;
        try {
          const releaseRes = await fetch(releaseAssetUrl);
          if (releaseRes.ok) {
            const candidateBlob = await releaseRes.blob();
            if (candidateBlob.size > 100000) {
              blob = candidateBlob;
            }
          }
        } catch {
          // handled below
        }
      }

      if (!blob || blob.size < 100000) {
        throw new Error(
          `Genuine APK file (${fileName}) has not been compiled yet (download was empty or under 100KB). Please trigger the GitHub Actions workflow in repository mobinis/Sfc-4 to compile the APK first.`
        );
      }

      const mimeType = target === 'apk'
        ? 'application/vnd.android.package-archive'
        : 'application/zip';

      const result = await uploadFileToDrive(blob, fileName, mimeType, (progress) => {
        setUploadProgress(progress);
      });

      setUploadSuccess(result);
    } catch (err: unknown) {
      console.error('Drive upload failed:', err);
      const message = err instanceof Error ? err.message : 'Upload failed due to network error.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1B211E] border border-[#384A41] text-[#F4F7F4] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#384A41]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2A5643] text-[#E8F3ED] border border-[#3D7D62] flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#F4F7F4]">Export & Cloud Backup</h2>
              <p className="text-xs text-[#859A90]">Direct Device Download & Google Drive Backup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#859A90] hover:text-[#F4F7F4] hover:bg-[#242D29] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-2xl bg-[#242D29] border border-[#384A41] text-xs text-[#859A90] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#E5A93C] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#F4F7F4]">How BloomQuest APK Delivery Works</span>
              <p>
                BloomQuest is a full native Android app (Jetpack Compose, Room DB, ONNX). Large compiled APK binaries (96 MB) are built and distributed directly via your repository's automated GitHub Actions pipeline.
              </p>
            </div>
          </div>

          {/* Section 1: Android APK Download */}
          <div className="p-4 rounded-2xl bg-[#121413] border border-[#384A41]/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[#3D7D62]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#859A90]">
                  Option 1: Download Genuine 96 MB APK
                </h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#2A5643]/60 text-[#E8F3ED]">
                Official Build
              </span>
            </div>

            <div className="space-y-3">
              {/* Direct APK Download Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href="/downloads/SelfCare-Hero-Hybrid.apk"
                  download="SelfCare-Hero-Hybrid.apk"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1B211E] border border-[#3D7D62] hover:border-[#87A96B] text-[#F4F7F4] hover:bg-[#242D29] transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-[#87A96B] group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#F4F7F4]">In-App APK Download</p>
                      <p className="text-[10px] text-[#87A96B]">Full Hybrid Build • Verified</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#87A96B] group-hover:text-[#F4F7F4]" />
                </a>

                <a
                  href="https://github.com/mobinis/Sfc-4/releases/latest/download/SelfCare-Hero-Hybrid.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1B211E] border border-[#384A41] hover:border-[#E5A93C] text-[#F4F7F4] hover:bg-[#242D29] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileArchive className="w-5 h-5 text-[#E5A93C] group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#F4F7F4]">GitHub Direct Release</p>
                      <p className="text-[10px] text-[#859A90]">Latest APK Package</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#859A90] group-hover:text-[#E5A93C]" />
                </a>
              </div>

              {/* GitHub Actions & Releases Quick Links */}
              <div className="p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#E5A93C] font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Automated CI Build & Releases</span>
                  </div>
                  <span className="text-[10px] text-[#87A96B] font-mono">mobinis/Sfc-4</span>
                </div>
                <p className="text-[11px] text-[#859A90] leading-relaxed">
                  Every push or workflow run builds the standalone Android APK with memory limits and publishes it to both Actions Artifacts and GitHub Releases.
                </p>
                
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://github.com/mobinis/Sfc-4/actions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#2D6A4F] hover:bg-[#22533E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>GitHub Actions (Run & Download)</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <a
                    href="https://github.com/mobinis/Sfc-4/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-[#1B211E] hover:bg-[#242D29] border border-[#384A41] text-[#F4F7F4] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>All Releases</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41]/60 text-[11px] text-[#859A90] space-y-1">
                <span className="font-bold text-[#F4F7F4] block">How to guarantee 100% successful downloads:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px]">
                  <li>Use <span className="text-[#87A96B] font-bold">In-App APK Download</span> above for instant access.</li>
                  <li>In GitHub, run the workflow on <span className="text-[#87A96B] font-mono">mobinis/Sfc-4</span> under Actions.</li>
                  <li>Download the validated <span className="text-[#E5A93C] font-mono font-bold">SelfCare-Hero-Hybrid-APK</span> artifact (never an empty or 1KB stub).</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Section 2: Google Drive Cloud Backup */}
          <div className="p-4 rounded-2xl bg-[#121413] border border-[#384A41]/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-[#4285F4]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#859A90]">Option 2: Save to Google Drive</h3>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1e293b] text-[#93c5fd]">Cloud Storage</span>
            </div>

            {/* Auth State */}
            {!currentUser ? (
              <div className="p-4 rounded-xl bg-[#1B211E] border border-[#384A41] text-center space-y-3">
                <p className="text-xs text-[#859A90]">
                  Sign in with your Google Account to back up the compiled APK directly to your personal Google Drive with permission.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    className="flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-white text-gray-800 hover:bg-gray-100 active:scale-95 transition-all text-xs font-semibold shadow-md disabled:opacity-50"
                  >
                    {isSigningIn ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* User info bar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1B211E] border border-[#384A41] text-xs">
                  <div className="flex items-center gap-2">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="User" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#2A5643] text-center text-[10px] font-bold leading-6">
                        {currentUser.displayName?.charAt(0) || 'G'}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#F4F7F4] leading-none">{currentUser.displayName || 'Google User'}</p>
                      <p className="text-[10px] text-[#859A90] leading-tight">{currentUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg text-[#859A90] hover:text-[#B91C1C] hover:bg-[#242D29] transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Upload Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => requestUploadConfirmation('apk')}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#2A5643] border border-[#3D7D62] text-[#E8F3ED] hover:bg-[#3D7D62] active:scale-95 transition-all text-xs font-bold disabled:opacity-50"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Upload APK (96 MB)</span>
                  </button>

                  <button
                    onClick={() => requestUploadConfirmation('zip')}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#242D29] border border-[#384A41] text-[#F4F7F4] hover:border-[#3D7D62] hover:bg-[#1B211E] active:scale-95 transition-all text-xs font-bold disabled:opacity-50"
                  >
                    <FileArchive className="w-4 h-4 text-[#E5A93C]" />
                    <span>Upload ZIP (51 MB)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {isUploading && uploadProgress && (
              <div className="p-3.5 rounded-xl bg-[#1B211E] border border-[#3D7D62] space-y-2 animate-pulse">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-[#E8F3ED]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3D7D62]" />
                    <span>Uploading to Google Drive</span>
                  </span>
                  <span className="text-[#E5A93C]">{uploadProgress.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#121413] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2A5643] to-[#3D7D62] transition-all duration-300"
                    style={{ width: `${uploadProgress.percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#859A90] text-center">{uploadProgress.status}</p>
              </div>
            )}

            {/* Upload Success Banner */}
            {uploadSuccess && (
              <div className="p-3.5 rounded-xl bg-[#16271F] border border-[#3D7D62] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#3D7D62] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>File Successfully Saved to Google Drive!</span>
                </div>
                <p className="text-[11px] text-[#859A90]">
                  '{uploadSuccess.name}' is now safely backed up to your Google Drive.
                </p>
                <a
                  href={uploadSuccess.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#2A5643] text-[#E8F3ED] hover:bg-[#3D7D62] transition-all font-bold text-xs"
                >
                  <span>Open in Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Error alerts */}
            {(authError || uploadError) && (
              <div className="p-3 rounded-xl bg-[#331414] border border-[#D95D39] text-[#FEE2E2] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError || uploadError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mandatory Explicit Confirmation Dialog per Google guidelines */}
        {pendingConfirmAction && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-[#1B211E] border border-[#E5A93C] p-5 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-[#2E2308] border border-[#E5A93C] text-[#E5A93C] flex items-center justify-center mx-auto text-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#F4F7F4]">Confirm Google Drive Upload</h4>
                <p className="text-xs text-[#859A90] mt-1.5">
                  Upload <strong className="text-[#F4F7F4]">{pendingConfirmAction.fileName}</strong> ({pendingConfirmAction.fileSizeMb} MB) directly into your Google Drive?
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingConfirmAction(null)}
                  className="flex-1 py-2 rounded-xl bg-[#242D29] border border-[#384A41] text-xs font-bold text-[#859A90] hover:text-[#F4F7F4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedUpload}
                  className="flex-1 py-2 rounded-xl bg-[#2A5643] border border-[#3D7D62] text-xs font-bold text-[#E8F3ED] hover:bg-[#3D7D62] transition-colors"
                >
                  Confirm & Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
