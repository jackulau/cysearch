# CySearch

A modern course search platform for Iowa State University students.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **Course Search** - Search and filter courses by subject, term, instructor, and delivery mode
- **Real-time Availability** - See current enrollment and seat availability
- **Schedule Builder** - Build and visualize your weekly class schedule
- **Conflict Detection** - Automatic detection of time conflicts
- **Mobile Friendly** - Responsive design for all devices

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Backend**: [Separate API](https://github.com/jackulau/cysearch-backend) deployed on Render

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variable
echo "NEXT_PUBLIC_API_URL=https://your-backend.onrender.com" > .env.local

# Start development server
npm run dev
```

Visit http://localhost:3000

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` to auto-deploy.

## License

MIT
