# Media Hub - YouTube Video Downloader

A web application for downloading YouTube videos and extracting audio with a modern, dark-themed UI.

## Tech Stack

- **Backend**: Node.js + Express.js + yt-dlp
- **Frontend**: HTML + Vanilla CSS
- **Dependencies**: yt-dlp-exec, cors

## Features

- Download YouTube videos in MP4 format (from 144p up to 4K and source quality)
- Extract YouTube videos as audio (MP3, FLAC, WAV with selectable bitrates)
- View video thumbnail, title, and duration before downloading
- Premium dark-themed UI with ambient animations and modern aesthetics
- Auto-fetches video info when a URL is pasted
- Real-time animated download state

## Installation

1. Clone the repository or navigate to the project directory

2. Install all dependencies:
```bash
npm run install-all
```

## Running the Application

### Start both servers concurrently:
```bash
npm run dev
```

### Or start them separately:

**Backend (port 3001):**
```bash
cd backend
npm start
```

**Frontend (port 3000):**
```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## How to Use

1. Open the application in your browser (default `http://localhost:3000`)
2. Paste a YouTube video URL in the input field
3. The video info and thumbnail will be fetched automatically
4. Toggle between MP4 (Video) and MP3 (Audio)
5. Select your preferred download quality (e.g. 480p, 320kbps, FLAC, etc.)
6. Click "Download" to start extracting and saving the media
7. The file will be saved directly to your device

## Project Structure

```
mediahub/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   └── node_modules/
├── frontend/
│   ├── index.html         # Main UI with custom CSS and JS
│   ├── mediahub.jpg       # App icon / Favicon
│   ├── package.json       # Frontend dependencies
│   └── node_modules/
├── package.json           # Root package with scripts
├── guide.md               # Project guidelines
└── README.md              # This file
```

## API Endpoints

- `GET /api/video-info?url=<youtube_url>` - Get video information and available formats
- `GET /api/download?url=<youtube_url>&itag=<format_id>` - Download video in specified format

## Notes

- No database required - videos are saved directly to your device
- The backend runs on port 3001 by default
- The frontend runs on port 3000 by default