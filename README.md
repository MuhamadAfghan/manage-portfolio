# Portfolio Management Application

A full-stack portfolio management application built with **Next.js 14**, **Supabase**, **Tailwind CSS**, **shadcn/ui**, and **Docker**. This application allows you to manage your portfolio projects with an intuitive admin interface and provides public APIs for integration with your personal website.

## ✨ Features

### 🔐 Authentication & Security
- Supabase Auth with email, Google, and GitHub providers
- Role-based access control (admin only for management)
- API key authentication for public endpoints
- Row Level Security (RLS) for data protection

### 📊 Dashboard Admin
- Project statistics and analytics
- Drag-and-drop project reordering
- Quick actions and project management
- Activity logging

### 📝 Project Management
- **Rich Text Editor** with Tiptap (drag-and-drop images, custom formatting)
- **Project Types**: Individual, Collaboration, Client work
- **Media Upload**: Images and thumbnails via Supabase Storage
- **Technology Tags**: Autocomplete input for technologies used
- **Custom Fields**: Client details, team members, budget tracking
- **Status Management**: Draft/Published with privacy controls

### 🚀 Public APIs
- **GET-only endpoints** for public website integration
- **Rate limiting** and API key management
- **Filtering**: By project type, status, category
- **Optimized responses** for performance

### 🐳 Docker Containerization
- **Multi-stage Docker build** for optimized production images
- **Docker Compose** for local development with PostgreSQL
- **Nginx reverse proxy** with rate limiting
- **SSL/HTTPS support** ready for production

### 🎨 Modern UI/UX
- **shadcn/ui** components with Tailwind CSS
- **Dark/Light theme** support
- **Responsive design** for all devices
- **Drag-and-drop interactions**
- **Loading states** and error handling

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes, Supabase (PostgreSQL, Auth, Storage)
- **Rich Text**: Tiptap Editor with extensions
- **Drag & Drop**: @dnd-kit
- **State Management**: React Query (@tanstack/react-query)
- **Container**: Docker, Docker Compose, Nginx
- **Database**: PostgreSQL with Row Level Security

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (optional)
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd manage-portfolio
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

Run the SQL schema in your Supabase project:

```bash
# Copy and execute the contents of supabase-schema.sql in your Supabase SQL Editor
```

The schema includes:
- Projects, Skills, API Keys, and Activity Logs tables
- Row Level Security policies
- Sample data for skills
- Indexes for performance

### 4. Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Setup

### Development with Docker Compose

```bash
# Start all services (app + local PostgreSQL)
docker-compose up -d

# With Supabase Studio for database management
docker-compose --profile dev up -d
```

### Production Build

```bash
# Build production image
docker build -t portfolio-app .

# Run with production profile (includes Nginx)
docker-compose --profile production up -d
```

## 📡 API Documentation

### Public Endpoints (Require API Key)

#### Get Projects
```bash
GET /api/projects
Headers: X-API-Key: your_api_key

Query Parameters:
- type: individual|collaboration|client
- status: draft|published (default: published for public)
- limit: number

Response:
{
  "projects": [
    {
      "id": "uuid",
      "title": "Project Title",
      "description": "Brief description",
      "content": "Rich text content",
      "type": "individual",
      "status": "published",
      "technologies": ["React", "TypeScript"],
      "thumbnail_url": "https://...",
      "demo_url": "https://...",
      "github_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Single Project
```bash
GET /api/projects/{id}
Headers: X-API-Key: your_api_key
```

#### Get Skills
```bash
GET /api/skills
Headers: X-API-Key: your_api_key

Query Parameters:
- category: frontend|backend|database|devops|design|other

Response:
{
  "skills": [
    {
      "id": "uuid",
      "name": "React",
      "category": "frontend",
      "level": 5,
      "icon_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Admin Endpoints (Require Authentication)

All CRUD operations for projects, skills, and API key management require authentication via Supabase Auth.

## 🔑 API Key Management

1. Login to your admin dashboard
2. Navigate to API Keys section
3. Create new API key with specific permissions
4. Use the key in your website's API calls

Example integration in your personal website:

```javascript
const response = await fetch('https://your-portfolio-api.com/api/projects?type=client', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});
const { projects } = await response.json();
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Authentication pages
│   ├── projects/          # Project management pages
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── DashboardStats.tsx
│   ├── ProjectsBoard.tsx
│   ├── ProjectForm.tsx
│   └── RichTextEditor.tsx
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker + VPS

1. Build and push to container registry:
```bash
docker build -t your-registry/portfolio-app .
docker push your-registry/portfolio-app
```

2. On your server:
```bash
docker-compose --profile production up -d
```

### Custom Domain & SSL

Update `nginx.conf` with your domain and SSL certificates:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # ... rest of configuration
}
```

## 🔒 Security Considerations

- **Row Level Security**: All database operations are protected by RLS policies
- **API Rate Limiting**: Nginx configuration includes rate limiting for API endpoints
- **Environment Variables**: Never commit sensitive data to version control
- **API Keys**: Rotate API keys regularly and monitor usage
- **CORS**: Configure proper CORS headers for production
- **SSL/TLS**: Always use HTTPS in production

## 🎯 Usage Examples

### Personal Website Integration

```javascript
// In your personal website
class PortfolioAPI {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getProjects(type = null) {
    const url = new URL('/api/projects', this.baseUrl);
    if (type) url.searchParams.set('type', type);
    
    const response = await fetch(url, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }

  async getSkills() {
    const response = await fetch('/api/skills', {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }
}

// Usage
const portfolio = new PortfolioAPI('your_api_key', 'https://your-api.com');
const clientProjects = await portfolio.getProjects('client');
const skills = await portfolio.getSkills();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help with setup:

1. Check the [Issues](../../issues) for common problems
2. Create a new issue with detailed information
3. Review the [API documentation](#-api-documentation) for integration help

---

**Enjoy building your portfolio! 🚀**
