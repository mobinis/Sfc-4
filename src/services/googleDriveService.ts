import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as fbSignOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Drive file scope
const driveProvider = new GoogleAuthProvider();
driveProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (NEVER stored in localStorage per guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to acquire Google Drive access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Google Sign-In failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedToken = (): string | null => cachedAccessToken;

export const signOutDrive = async (): Promise<void> => {
  await fbSignOut(auth);
  cachedAccessToken = null;
};

export interface UploadProgress {
  percent: number;
  uploadedBytes: number;
  totalBytes: number;
  status: string;
}

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink: string;
}

/**
 * Uploads a local file blob to Google Drive using the Resumable Upload protocol.
 * Resumable upload is recommended by Google for files > 5MB to handle network fluctuations reliably.
 */
export const uploadFileToDrive = async (
  fileBlob: Blob,
  fileName: string,
  mimeType: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<DriveUploadResult> => {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Please sign in with Google to upload files to Google Drive.');
  }

  const totalBytes = fileBlob.size;
  if (onProgress) {
    onProgress({
      percent: 0,
      uploadedBytes: 0,
      totalBytes,
      status: 'Initiating resumable session with Google Drive...'
    });
  }

  // Step 1: Initiate Resumable Upload Session
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'BloomQuest Android Checkpoint Deliverable compiled in AI Studio'
  };

  const initResponse = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': totalBytes.toString()
      },
      body: JSON.stringify(metadata)
    }
  );

  if (!initResponse.ok) {
    const errText = await initResponse.text();
    throw new Error(`Failed to initiate Google Drive upload session: ${initResponse.status} ${errText}`);
  }

  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('Google Drive did not return a valid upload location URL.');
  }

  // Step 2: Upload in chunks (5MB per chunk for optimal reliability)
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
  let offset = 0;
  let resultData: DriveUploadResult | null = null;

  while (offset < totalBytes) {
    const chunkEnd = Math.min(offset + CHUNK_SIZE, totalBytes);
    const chunk = fileBlob.slice(offset, chunkEnd);

    if (onProgress) {
      const currentPercent = Math.round((offset / totalBytes) * 100);
      onProgress({
        percent: currentPercent,
        uploadedBytes: offset,
        totalBytes,
        status: `Uploading ${(offset / (1024 * 1024)).toFixed(1)} MB of ${(totalBytes / (1024 * 1024)).toFixed(1)} MB (${currentPercent}%)...`
      });
    }

    const chunkResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes ${offset}-${chunkEnd - 1}/${totalBytes}`,
        'Content-Type': mimeType
      },
      body: chunk
    });

    if (chunkResponse.status === 308) {
      // Incomplete - resume next chunk
      const range = chunkResponse.headers.get('Range');
      if (range) {
        const match = range.match(/bytes=0-(\d+)/);
        if (match && match[1]) {
          offset = parseInt(match[1], 10) + 1;
        } else {
          offset = chunkEnd;
        }
      } else {
        offset = chunkEnd;
      }
    } else if (chunkResponse.ok) {
      // Completed!
      const data = await chunkResponse.json();
      resultData = {
        fileId: data.id,
        name: data.name,
        webViewLink: `https://drive.google.com/file/d/${data.id}/view`
      };
      break;
    } else {
      const errText = await chunkResponse.text();
      throw new Error(`Upload chunk error (${chunkResponse.status}): ${errText}`);
    }
  }

  if (onProgress) {
    onProgress({
      percent: 100,
      uploadedBytes: totalBytes,
      totalBytes,
      status: 'Upload complete! File available in Google Drive.'
    });
  }

  if (!resultData) {
    throw new Error('Upload completed but file metadata was not received from Google Drive.');
  }

  return resultData;
};
