# Playlist Exporter

A modern web application to view and export your playlists to CSV and JSON formats.

## Features

- **Google OAuth Authentication** - Secure sign-in with your Google account
- **View Playlists** - See all your YouTube playlists with thumbnails and video counts
- **Playlist Details** - View all videos in a playlist with metadata
- **Export to CSV** - Download playlist data as a spreadsheet-compatible CSV file
- **Export to JSON** - Download complete playlist data in JSON format
- **Dark/Light Mode** - YouTube-themed dark mode by default, with light mode option
- **PWA Support** - Install as a standalone app on your device
- **Offline Capable** - Works offline after initial load (with cached data)

## Screenshots

![Playlist Grid](docs/screenshots/youtube_playlist_exporter_1.png)
*Browse your YouTube playlists*

![Playlist Details](docs/screenshots/youtube_playlist_exporter_2.png)
*View playlist contents and export to CSV or JSON*

![Export Complete](docs/screenshots/youtube_playlist_exporter_3.png)
*Export complete - files ready for download*

## Tech Stack

- **React 18** - Modern React with hooks and TypeScript
- **Vite** - Fast build tooling
- **Material UI v5** - Google Material Design 3 components
- **Zustand** - Lightweight state management
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **vite-plugin-pwa** - PWA generation

## Prerequisites

Before running this app, you need to set up Google Cloud credentials.

### 1. Create a Google Cloud Project

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create a new project (or select an existing one)

### 2. Enable YouTube Data API v3

- Go to **APIs & Services → Library**
- Search for "YouTube Data API v3"
- Click **Enable**

### 3. Configure OAuth Consent Screen

- Go to **APIs & Services → OAuth consent screen**
- Choose "External" user type
- Fill in app name, support email, developer email
- Add scope: `https://www.googleapis.com/auth/youtube.readonly`
- Add yourself as a test user (for development)

### 4. Create OAuth 2.0 Credentials

- Go to **APIs & Services → Credentials**
- Click **Create Credentials → OAuth client ID**
- Select **Web application**
- Configure the following:

| Field                             | Value                   |
| --------------------------------- | ----------------------- |
| **Authorized JavaScript origins** | `http://localhost:5173` |
| **Authorized redirect URIs**      | `http://localhost:5173` |

- Click **Create** and copy the **Client ID**

> **Note:** The dev server is locked to port `5173` via `vite.config.ts` to ensure OAuth redirects work consistently.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Edit `.env.local` and add your Google OAuth Client ID:

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

4. Start the development server:

```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

## Development

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Start dev server on port 5173              |
| `npm run build`         | Build for production                       |
| `npm run preview`       | Preview production build locally           |
| `npm run lint`          | Run ESLint                                 |
| `npm run format`        | Auto-fix formatting with Prettier          |
| `npm run format:check`  | Check formatting without changes           |
| `npm run check`         | Run format:check + lint + tests (CI-ready) |
| `npm test`              | Run tests in watch mode                    |
| `npm run test:run`      | Run tests once                             |
| `npm run test:coverage` | Run tests with coverage report             |

### Port Configuration

The dev server is **locked to port 5173** (`strictPort: true` in `vite.config.ts`). This ensures OAuth redirects always work. If port 5173 is in use, the server will fail rather than picking a random port.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready for static hosting.

## Deployment

This app can be hosted on any static hosting service:

- **Netlify** - Drag and drop the `dist` folder
- **Vercel** - Connect your repository
- **GitHub Pages** - Deploy the `dist` folder
- **Cloudflare Pages** - Connect your repository

**Important:** Add your production domain to both:

- Authorized JavaScript origins
- Authorized redirect URIs

## Project Structure

```
app/
├── public/           # Static assets and PWA icons
├── src/
│   ├── components/   # React components
│   │   ├── auth/     # Authentication components
│   │   ├── common/   # Shared components
│   │   ├── export/   # Export functionality
│   │   ├── layout/   # App layout components
│   │   └── playlists/# Playlist display components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── services/     # API and export services
│   ├── store/        # Zustand state stores
│   ├── test/         # Test setup and utilities
│   ├── theme/        # MUI theme configuration
│   └── types/        # TypeScript type definitions
├── .env.example      # Environment variables template
├── .env.local        # Your local config (gitignored)
├── .prettierrc       # Prettier configuration
├── vite.config.ts    # Vite + PWA + Vitest configuration
└── package.json
```

## Testing

The project uses **Vitest** with **React Testing Library** for testing.

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage report
```

Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions.

## Code Quality

**Formatting** is handled by Prettier:

```bash
npm run format        # Auto-fix formatting
npm run format:check  # Check without changes
```

**Linting** is handled by ESLint:

```bash
npm run lint          # Run ESLint
```

**Full Check** (recommended before committing):

```bash
npm run check         # Runs format:check + lint + tests
```

## Troubleshooting

### "Port 5173 is already in use"

Kill the existing process:

```bash
lsof -ti:5173 | xargs kill -9
```

### OAuth error: "redirect_uri_mismatch"

Ensure your Google Cloud credentials have exactly:

- Origin: `http://localhost:5173`
- Redirect URI: `http://localhost:5173`

### "Google hasn't verified this app" warning

This is normal during development. Click **Advanced → Go to [app name]** to proceed.

## License

This project is licensed under the **Business Source License 1.1**. You may view the source code and run the app locally. Refer to the [LICENSE](LICENSE) file for other uses.
