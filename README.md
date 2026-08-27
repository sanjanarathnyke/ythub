# YTHub - YouTube Video Downloader

A web application for downloading YouTube videos with a modern, premium UI.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML + Tailwind CSS
- **Dependencies**: ytdl-core, axios, cors

## Features

- Download YouTube videos in various formats (360p, 480p, 720p, etc.)
- View video thumbnail, title, and description before downloading
- Premium light-themed UI with smooth animations
- Google Caveat font family
- Carousel for popular download categories
- Real-time download status updates

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

1. Open the application in your browser
2. Paste a YouTube video URL in the input field
3. Click "Get Video Info" to fetch video details
4. Select your preferred download format (360p, 480p, 720p, etc.)
5. Click "Download Video" to start the download
6. The video will be saved to your Downloads folder

## Project Structure

```
ythub/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   └── node_modules/
├── frontend/
│   ├── index.html         # Main UI with Tailwind CSS
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