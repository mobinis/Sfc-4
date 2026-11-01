import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';

// Helper to resolve and verify deliverable paths across build outputs, public, and workspace
function resolveDeliverable(fileName: string): {
  resolvedPath: string;
  exists: boolean;
  fileSize: number;
  expectedPrimaryPath: string;
  candidatePaths: { path: string; exists: boolean }[];
} {
  const isApk = fileName.endsWith('.apk');
  const primaryBuildPath = isApk
    ? path.resolve(__dirname, 'android/app/build/outputs/apk/debug/app-debug.apk')
    : path.resolve(__dirname, 'app/build/outputs/apk/debug/BloomQuest-Restored-Checkpoint-Android.zip');

  const candidates = [
    // 1. Capacitor Hybrid Android build output
    path.resolve(__dirname, 'android/app/build/outputs/apk/debug/app-debug.apk'),
    // 2. Hybrid APK alias at root or in downloads
    path.resolve(__dirname, 'SelfCare-Hero-Hybrid.apk'),
    path.resolve(__dirname, 'public/downloads/SelfCare-Hero-Hybrid.apk'),
    // 3. Primary native Gradle build output
    primaryBuildPath,
    // 4. Named release artifact in Gradle output directory
    path.resolve(__dirname, 'android/app/build/outputs/apk/debug', fileName),
    path.resolve(__dirname, 'app/build/outputs/apk/debug', fileName),
    // 5. Public downloads directory
    path.resolve(__dirname, 'public/downloads', fileName),
    // 6. Root workspace fallback
    path.resolve(__dirname, fileName)
  ];

  const candidateResults = candidates.map(candidatePath => ({
    path: candidatePath,
    exists: fs.existsSync(candidatePath)
  }));

  const found = candidateResults.find(c => c.exists);
  if (found) {
    const stat = fs.statSync(found.path);
    return {
      resolvedPath: found.path,
      exists: true,
      fileSize: stat.size,
      expectedPrimaryPath: primaryBuildPath,
      candidatePaths: candidateResults
    };
  }

  return {
    resolvedPath: primaryBuildPath,
    exists: false,
    fileSize: 0,
    expectedPrimaryPath: primaryBuildPath,
    candidatePaths: candidateResults
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png', 'favicon.png'],
      manifest: {
        id: '/',
        name: 'SelfCare Hero',
        short_name: 'SelfCareHero',
        description: 'Offline-first hybrid self-care sanctuary, habit tracker, and somatic mindfulness companion.',
        theme_color: '#87A96B',
        background_color: '#1E241B',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    {
      name: 'apk-downloads-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          const cleanUrl = req.url.split('?')[0];

          // 1. Deliverable Status API with diagnostic path verification logging
          if (cleanUrl === '/api/apk-status') {
            const hybridApkRes = resolveDeliverable('SelfCare-Hero-Hybrid.apk');
            const legacyApkRes = resolveDeliverable('BloomQuest-Restored-Checkpoint.apk');
            const apkResolution = hybridApkRes.exists ? hybridApkRes : legacyApkRes;
            const zipResolution = resolveDeliverable('BloomQuest-Restored-Checkpoint-Android.zip');

            console.log('[Deliverable Middleware: /api/apk-status]');
            console.log(`  APK Primary Path: ${apkResolution.expectedPrimaryPath} (Exists: ${apkResolution.exists}, Size: ${apkResolution.fileSize} bytes)`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              apkAvailable: apkResolution.exists,
              apkSize: apkResolution.fileSize,
              apkResolvedPath: apkResolution.resolvedPath,
              apkExpectedPrimaryPath: apkResolution.expectedPrimaryPath,
              zipAvailable: zipResolution.exists,
              zipSize: zipResolution.fileSize,
              zipResolvedPath: zipResolution.resolvedPath,
              zipExpectedPrimaryPath: zipResolution.expectedPrimaryPath,
              candidates: {
                apk: apkResolution.candidatePaths,
                zip: zipResolution.candidatePaths
              },
              repoUrl: 'https://github.com/mobinis/Sfc-4',
              actionsUrl: 'https://github.com/mobinis/Sfc-4/actions',
              releasesUrl: 'https://github.com/mobinis/Sfc-4/releases'
            }));
            return;
          }

          // 2. APK Download Endpoints (both SelfCare-Hero-Hybrid.apk and BloomQuest-Restored-Checkpoint.apk)
          if (cleanUrl === '/downloads/SelfCare-Hero-Hybrid.apk' || cleanUrl === '/downloads/BloomQuest-Restored-Checkpoint.apk' || cleanUrl === '/downloads/app-debug.apk') {
            const fileName = cleanUrl.endsWith('SelfCare-Hero-Hybrid.apk')
              ? 'SelfCare-Hero-Hybrid.apk'
              : 'BloomQuest-Restored-Checkpoint.apk';
            const resolution = resolveDeliverable(fileName);

            if (resolution.exists && resolution.fileSize > 100000) {
              res.writeHead(200, {
                'Content-Type': 'application/vnd.android.package-archive',
                'Content-Length': resolution.fileSize,
                'Content-Disposition': `attachment; filename="${fileName}"`
              });
              fs.createReadStream(resolution.resolvedPath).pipe(res);
              return;
            } else {
              // Redirect directly to the compiled GitHub Releases APK deliverable
              const targetReleaseUrl = 'https://github.com/mobinis/Sfc-4/releases/latest/download/SelfCare-Hero-Hybrid.apk';
              console.log(`[Deliverable Middleware] Local file not present or empty. Redirecting to official release: ${targetReleaseUrl}`);
              res.writeHead(302, {
                'Location': targetReleaseUrl,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              });
              res.end();
              return;
            }
          }

          // 3. ZIP Download Endpoint with Absolute Path Resolution & Specific Fallback Message
          if (cleanUrl === '/downloads/BloomQuest-Restored-Checkpoint-Android.zip') {
            const fileName = 'BloomQuest-Restored-Checkpoint-Android.zip';
            const resolution = resolveDeliverable(fileName);

            console.log(`[Deliverable Middleware: Download ZIP]`);
            console.log(`  Target File: ${fileName}`);
            console.log(`  Expected Primary Path: ${resolution.expectedPrimaryPath}`);
            console.log(`  Resolved Path: ${resolution.resolvedPath}`);
            console.log(`  File Exists on Disk: ${resolution.exists}`);
            console.log(`  Evaluated Candidate Paths:\n${resolution.candidatePaths.map(c => `    - ${c.path} [${c.exists ? 'FOUND' : 'NOT FOUND'}]`).join('\n')}`);

            if (resolution.exists) {
              res.writeHead(200, {
                'Content-Type': 'application/zip',
                'Content-Length': resolution.fileSize,
                'Content-Disposition': `attachment; filename="${fileName}"`
              });
              fs.createReadStream(resolution.resolvedPath).pipe(res);
              return;
            } else {
              const expectedDir = path.dirname(resolution.expectedPrimaryPath);
              const dirExists = fs.existsSync(expectedDir);

              console.warn(`[Deliverable Middleware: 404 Missing ZIP] File not found at expected path: ${resolution.expectedPrimaryPath}`);

              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: 'error',
                error: 'Release ZIP package not found on disk',
                requestedFile: fileName,
                expectedAbsolutePath: resolution.expectedPrimaryPath,
                expectedDirectory: expectedDir,
                directoryExistsOnDisk: dirExists,
                evaluatedCandidatePaths: resolution.candidatePaths,
                resolutionGuidance: 'The 51 MB release ZIP archive is generated by GitHub Actions (.github/workflows/build-apk.yml). Once compiled, the ZIP must be located at the expectedAbsolutePath indicated above.',
                ciWorkflowUrl: 'https://github.com/mobinis/Self-care-and-life-changing-v3/actions/workflows/build-apk.yml'
              }, null, 2));
              return;
            }
          }

          next();
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});
