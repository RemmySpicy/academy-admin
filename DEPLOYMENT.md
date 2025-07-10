# Academy Admin Deployment Guide

This guide covers deploying the Academy Admin application to production using modern Platform-as-a-Service (PaaS) providers.

## 🎯 Current Development Status

### ✅ Ready for Deployment
- **Database Schema**: PostgreSQL with Alembic migrations (002_simple_curriculum_tables.py)
- **Authentication**: JWT-based auth with admin user setup
- **API Endpoints**: Comprehensive FastAPI backend with curriculum management
- **Frontend**: Next.js with shadcn/ui components and authentication flow
- **Docker Setup**: Fully containerized development environment
- **Test Data**: 5 sample programs and admin user ready for testing

### 🗄️ Current Database Setup
**Tables Created:**
- `users` - Authentication and user management
- `students` - Student records (basic structure)
- `programs` - Educational programs (5 test programs available)
- `courses` - Courses within programs
- `curricula` - Specific curriculum implementations

**Extensions Enabled:**
- `uuid-ossp` - UUID generation for primary keys

**Sample Data Available:**
- Admin user: `admin@academy.com` / `admin123`
- 5 Test programs: Robotics Engineering, AI & Machine Learning, Web Development, Sports Training, Arts & Creative

## 🏗️ **Deployment Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │────│   (Railway)     │────│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Static Site   │    │ • API Service   │    │ • PostgreSQL    │
│ • Global CDN    │    │ • Auto Deploy   │    │ • Managed       │
│ • Auto Scale    │    │ • Health Checks │    │ • Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 **Prerequisites**

- [ ] GitHub account with your repository
- [ ] Vercel account (for frontend)
- [ ] Railway account (for backend)
- [ ] Supabase account (for database)
- [ ] Domain name (optional, for custom domains)

## 🗄️ **Database Setup (Supabase)**

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose organization and enter project details
4. Select region closest to your users
5. Wait for project creation (2-3 minutes)

### 2. Get Database Credentials
1. Go to Settings → Database
2. Copy the connection string:
   ```
   postgresql://postgres:[password]@[host]:5432/postgres
   ```
3. Save this URL for later use

### 3. Initialize Database
```bash
# Clone your repository
git clone https://github.com/yourusername/academy-admin.git
cd academy-admin

# Set up environment with your Supabase URL
export DATABASE_URL="your-supabase-connection-string"

# Run migrations to create tables
cd backend
pip install -r requirements.txt
alembic upgrade head

# Create admin user and test data
python setup_db.py
```

### 4. Verify Database Setup
```bash
# Check if tables were created successfully
# Connect to Supabase dashboard and verify:
# - users table exists with admin user
# - programs table exists with 5 test programs
# - All foreign key relationships are properly set up
```

## 🔧 **Backend Deployment (Railway)**

### 1. Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the backend folder as root directory

### 2. Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Security
SECRET_KEY=your-super-secret-key-here-generate-a-strong-one
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false
RELOAD=false

# CORS (Update with your actual frontend domain)
CORS_ORIGINS=https://your-frontend-domain.vercel.app

# Optional: Redis (if using Railway Redis)
REDIS_URL=redis://default:password@host:6379

# Optional: Email (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@academy.com
```

### 3. Deploy Backend
1. Railway will automatically deploy when you push to main branch
2. Get your backend URL from Railway dashboard (e.g., `https://academy-admin-backend.railway.app`)
3. Test API: `curl https://your-backend-url.railway.app/api/v1/health`

## 🌐 **Frontend Deployment (Vercel)**

### 1. Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `frontend`
5. Framework preset should auto-detect Next.js

### 2. Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables:

```bash
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_ENV=production

# API Configuration (Use your Railway backend URL)
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.vercel.app

# Authentication
NEXTAUTH_URL=https://your-frontend-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key

# Optional: Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
```

### 3. Deploy Frontend
1. Vercel will automatically deploy when you push to main branch
2. Get your frontend URL from Vercel dashboard
3. Test deployment: Visit your frontend URL

## 🔄 **Post-Deployment Setup**

### 1. Update CORS Origins
Update your backend environment variables in Railway:
```bash
CORS_ORIGINS=https://your-actual-frontend-domain.vercel.app
```

### 2. Test API Connection
1. Visit your frontend application
2. Try logging in with test credentials
3. Check browser network tab for API calls

### 3. Run Database Migrations
```bash
# If you need to run migrations later
python database/production_setup.py --database-url "your-supabase-url" --skip-init --skip-seeders
```

## 🚀 **Automated Deployment**

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Railway
      run: |
        # Railway automatically deploys on push
        echo "Backend deployment triggered"
    
    - name: Deploy to Vercel
      run: |
        # Vercel automatically deploys on push
        echo "Frontend deployment triggered"
```

## 🔍 **Monitoring and Maintenance**

### Health Checks
- **Backend**: `https://your-backend-url.railway.app/api/v1/health`
- **Frontend**: `https://your-frontend-domain.vercel.app`

### Logs
- **Railway**: Dashboard → Deployments → View Logs
- **Vercel**: Dashboard → Functions → View Logs
- **Supabase**: Dashboard → Logs

### Backups
- **Database**: Supabase automatically backs up your database
- **Files**: Use cloud storage (AWS S3, Cloudinary) for user uploads

## 🛠️ **Alternative Deployment Options**

### Backend Alternatives
- **Render**: Similar to Railway, good performance
- **Heroku**: Classic choice, higher pricing
- **Fly.io**: Global deployment, Docker-friendly
- **DigitalOcean App Platform**: Good for medium-scale apps

### Frontend Alternatives
- **Netlify**: Similar to Vercel, good for static sites
- **Cloudflare Pages**: Fast global CDN
- **AWS Amplify**: Full-stack platform by AWS

### Database Alternatives
- **PlanetScale**: MySQL-compatible, good scaling
- **AWS RDS**: Full control, more configuration
- **Google Cloud SQL**: Enterprise-grade PostgreSQL

## 🚨 **Troubleshooting**

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGINS` in backend environment
   - Ensure frontend URL is included
   - No trailing slashes in URLs

2. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check firewall settings
   - Ensure database is running

3. **API Calls Failing**
   - Check `NEXT_PUBLIC_API_URL` in frontend
   - Verify backend is deployed and running
   - Check network tab in browser dev tools

4. **Build Failures**
   - Check environment variables are set
   - Verify all dependencies are installed
   - Check build logs for specific errors

### Getting Help
- Check deployment platform documentation
- Review application logs
- Test locally with production environment variables
- Check GitHub issues for similar problems

## 📚 **Next Steps**

After successful deployment:
1. Set up monitoring (Sentry, LogRocket)
2. Configure analytics (Google Analytics)
3. Set up automated backups
4. Plan for scaling (CDN, caching)
5. Set up CI/CD pipeline
6. Configure custom domains

## 🔐 **Security Checklist**

- [ ] Strong SECRET_KEY generated
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic with Vercel/Railway)
- [ ] Database credentials secure
- [ ] Environment variables not exposed
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't expose sensitive info