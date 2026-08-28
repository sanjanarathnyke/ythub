const express = require('express');
const cors = require('cors');
const ytDlp = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure yt-dlp binary exists and is executable
async function ensureYtdlp() {
  const ytdlpPath = path.join(__dirname, 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe');
  if (fs.existsSync(ytdlpPath)) {
    try {
      fs.accessSync(ytdlpPath, fs.constants.X_OK);
      return true;
    } catch {
      try {
        fs.chmodSync(ytdlpPath, 0o755);
        return true;
      } catch {
        return false;
      }
    }
  }
  return false;
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const ytdlpAvailable = await ensureYtdlp();
  res.json({
    status: 'ok',
    ytdlpAvailable: ytdlpAvailable,
    port: PORT,
  });
});

// Helper function to extract video ID from any YouTube URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function normalizeUrl(url) {
  const id = extractVideoId(url);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return url;
}

function isValidYoutubeUrl(url) {
  return !!extractVideoId(url);
}

// Get video info
app.get('/api/video-info', async (req, res) => {
  try {
    let { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    url = normalizeUrl(url);

    if (!isValidYoutubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const ytdlpAvailable = await ensureYtdlp();
    if (!ytdlpAvailable) {
      return res.status(500).json({
        error: 'yt-dlp binary is not available. Please run npm install in the backend folder. If the issue persists, check your antivirus settings.'
      });
    }

    const info = await ytDlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });

    // Always offer the requested low-quality download options.
    // yt-dlp will pick the best matching video+audio stream up to the requested height.
    const requestedQualities = [
      { quality: '144p', height: 144, itag: 'q144' },
      { quality: '256p', height: 256, itag: 'q256' },
      { quality: '360p', height: 360, itag: 'q360' },
      { quality: '480p', height: 480, itag: 'q480' },
    ];

    const formats = requestedQualities.map(q => ({
      itag: q.itag,
      quality: q.quality,
      height: q.height,
      container: 'mp4',
      hasAudio: true,
      hasVideo: true,
      filesize: null,
      type: 'video+audio'
    }));

    const thumbnail =
      info.thumbnail ||
      (info.thumbnails && info.thumbnails.length > 0
        ? info.thumbnails[info.thumbnails.length - 1].url
        : '');

    res.json({
      title: info.title,
      thumbnail,
      description: info.description || '',
      lengthSeconds: info.duration || 0,
      formats,
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    const message = error.message || 'Unknown error';
    res.status(500).json({
      error: 'Failed to fetch video info',
      details: process.env.NODE_ENV === 'development' ? message : undefined
    });
  }
});

// Download video
app.get('/api/download', async (req, res) => {
  try {
    let { url, itag } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    url = normalizeUrl(url);

    if (!isValidYoutubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    if (!itag) {
      return res.status(400).json({ error: 'Format (itag) is required' });
    }

    const isAudio = itag.startsWith('mp3-');
    
    // Get info to determine filename
    const info = await ytDlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
    });
    
    let ytdlpFormat, qualityLabel, extension, audioFormat, audioQuality;

    if (isAudio) {
      const qParts = itag.split('-');
      const val = qParts[1];
      if (val === 'FLAC') {
          audioFormat = 'flac';
          qualityLabel = 'FLAC';
          extension = 'flac';
      } else if (val === 'WAV') {
          audioFormat = 'wav';
          qualityLabel = 'WAV';
          extension = 'wav';
      } else {
          audioFormat = 'mp3';
          qualityLabel = val + (val === 'V0' ? '' : 'kbps');
          extension = 'mp3';
          audioQuality = val === 'V0' ? 0 : val + 'K';
      }
    } else {
      const syntheticQualityMap = {
        q144: 'bestvideo[height<=144]+bestaudio/best[height<=144]',
        q256: 'bestvideo[height<=256]+bestaudio/best[height<=256]',
        q360: 'bestvideo[height<=360]+bestaudio/best[height<=360]',
        q480: 'bestvideo[height<=480]+bestaudio/best[height<=480]',
      };
      ytdlpFormat = syntheticQualityMap[itag] || itag;
      qualityLabel = syntheticQualityMap[itag] ? itag.replace('q', '') + 'p' : itag;
      extension = 'mp4';
    }

    const safeTitle = (info.title || 'video').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    const filename = `${safeTitle}_${qualityLabel}.${extension}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', isAudio ? (extension === 'mp3' ? 'audio/mpeg' : `audio/${extension}`) : 'video/mp4');

    if (isAudio) {
      const tmpBase = path.join(os.tmpdir(), `yt_${Date.now()}_${Math.floor(Math.random() * 10000)}`);
      
      const args = {
        extractAudio: true,
        audioFormat: audioFormat,
        output: tmpBase + '.%(ext)s',
        noWarnings: true,
        noCallHome: true,
      };
      if (audioQuality !== undefined) {
        args.audioQuality = audioQuality;
      }
      
      const subprocess = ytDlp.exec(url, args);

      subprocess.on('close', (code) => {
        if (code === 0) {
          const finalPath = tmpBase + '.' + extension;
          if (fs.existsSync(finalPath)) {
            const stream = fs.createReadStream(finalPath);
            stream.pipe(res);
            stream.on('end', () => {
              fs.unlink(finalPath, () => {});
            });
            stream.on('error', () => {
              if (!res.headersSent) res.status(500).end();
              fs.unlink(finalPath, () => {});
            });
          } else {
            if (!res.headersSent) res.status(500).json({ error: 'Audio conversion output missing' });
          }
        } else {
          if (!res.headersSent) res.status(500).json({ error: 'Audio conversion failed' });
        }
      });
      
      req.on('close', () => {
        subprocess.kill();
      });
      
    } else {
      // Stream the download using yt-dlp to stdout
      const subprocess = ytDlp.exec(url, {
        format: ytdlpFormat,
        output: '-',
        noWarnings: true,
        noCallHome: true,
      });

      subprocess.stdout.pipe(res);

      subprocess.stdout.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download stream failed' });
        }
      });

      subprocess.on('error', (err) => {
        console.error('yt-dlp error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed' });
        }
      });

      req.on('close', () => {
        subprocess.kill();
      });
    }

  } catch (error) {
    console.error('Error downloading video:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download video' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
