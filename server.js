import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Healthcheck endpoint
  if (req.url === '/healthz' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', app: 'BloomQuest', port: PORT }));
    return;
  }

  // APK Deliverable Status endpoint
  if (req.url === '/api/apk-status') {
    const isApk = true;
    const primaryApkPath = path.join(__dirname, 'app/build/outputs/apk/debug/app-debug.apk');
    const primaryZipPath = path.join(__dirname, 'app/build/outputs/apk/debug/BloomQuest-Restored-Checkpoint-Android.zip');
    
    const apkCandidates = [
      primaryApkPath,
      path.join(__dirname, 'app/build/outputs/apk/debug/BloomQuest-Restored-Checkpoint.apk'),
      path.join(__dirname, 'public/downloads/BloomQuest-Restored-Checkpoint.apk'),
      path.join(__dirname, 'BloomQuest-Restored-Checkpoint.apk')
    ];
    const zipCandidates = [
      primaryZipPath,
      path.join(__dirname, 'app/build/outputs/apk/debug/BloomQuest-Restored-Checkpoint-Android.zip'),
      path.join(__dirname, 'public/downloads/BloomQuest-Restored-Checkpoint-Android.zip'),
      path.join(__dirname, 'BloomQuest-Restored-Checkpoint-Android.zip')
    ];

    const foundApk = apkCandidates.find(p => fs.existsSync(p));
    const foundZip = zipCandidates.find(p => fs.existsSync(p));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      apkAvailable: !!foundApk,
      apkSize: foundApk ? fs.statSync(foundApk).size : 0,
      apkResolvedPath: foundApk || primaryApkPath,
      apkExpectedPrimaryPath: primaryApkPath,
      zipAvailable: !!foundZip,
      zipSize: foundZip ? fs.statSync(foundZip).size : 0,
      zipResolvedPath: foundZip || primaryZipPath,
      zipExpectedPrimaryPath: primaryZipPath,
      repoUrl: 'https://github.com/mobinis/Self-care-and-life-changing-v3',
      actionsUrl: 'https://github.com/mobinis/Self-care-and-life-changing-v3/actions/workflows/build-apk.yml',
      releasesUrl: 'https://github.com/mobinis/Self-care-and-life-changing-v3/releases'
    }));
    return;
  }

  // Parse URL pathname
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  // Handle /downloads route specifically: do NOT fall back to index.html if missing
  if (reqPath.startsWith('/downloads/')) {
    const fileName = path.basename(reqPath);
    const isApk = fileName.endsWith('.apk');
    const primaryPath = isApk
      ? path.join(__dirname, 'app/build/outputs/apk/debug/app-debug.apk')
      : path.join(__dirname, 'app/build/outputs/apk/debug/BloomQuest-Restored-Checkpoint-Android.zip');

    const candidates = [
      primaryPath,
      path.join(__dirname, 'app/build/outputs/apk/debug', fileName),
      path.join(__dirname, 'public/downloads', fileName),
      path.join(__dirname, fileName)
    ];

    const candidateResults = candidates.map(c => ({ path: c, exists: fs.existsSync(c) }));
    const found = candidateResults.find(c => c.exists);

    console.log(`[Node Server: Download Request] ${fileName}`);
    console.log(`  Expected Primary Path: ${primaryPath}`);
    console.log(`  Resolved Path: ${found ? found.path : 'NONE'}`);

    if (found) {
      const stat = fs.statSync(found.path);
      res.writeHead(200, {
        'Content-Type': isApk ? 'application/vnd.android.package-archive' : 'application/zip',
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename="${fileName}"`
      });
      fs.createReadStream(found.path).pipe(res);
      return;
    } else {
      const expectedDir = path.dirname(primaryPath);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'error',
        error: `${isApk ? 'APK' : 'ZIP'} deliverable not found on disk`,
        requestedFile: fileName,
        expectedAbsolutePath: primaryPath,
        expectedDirectory: expectedDir,
        directoryExistsOnDisk: fs.existsSync(expectedDir),
        evaluatedCandidatePaths: candidateResults,
        resolutionGuidance: 'The native Android APK/ZIP is generated by GitHub Actions (.github/workflows/build-apk.yml) or locally via ./gradlew assembleDebug. Once compiled, place the deliverable at expectedAbsolutePath.',
        ciWorkflowUrl: 'https://github.com/mobinis/Self-care-and-life-changing-v3/actions/workflows/build-apk.yml'
      }, null, 2));
      return;
    }
  }

  // Sanitize path to prevent directory traversal
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safePath);

  // If file doesn't exist, try in /public
  if (!fs.existsSync(filePath)) {
    const publicPath = path.join(__dirname, 'public', safePath);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    } else {
      // Fallback to index.html for SPA routes
      filePath = path.join(__dirname, 'index.html');
    }
  }

  // If it's a directory, serve index.html inside it
  try {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch (err) {
    filePath = path.join(__dirname, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to root index.html
        fs.readFile(path.join(__dirname, 'index.html'), (fallbackErr, fallbackContent) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallbackContent);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Internal Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[BloomQuest Dev Server] Port ${PORT} already in use and active.`);
    process.exit(0);
  } else {
    console.error('[BloomQuest Dev Server Error]', err);
    process.exit(1);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[BloomQuest Dev Server] Running at http://${HOST}:${PORT}`);
});

