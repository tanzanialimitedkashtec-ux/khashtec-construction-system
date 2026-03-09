# 🚀 Railway.app Deployment Guide

## 📋 Overview

This guide covers deploying the KASHTEC Construction Management System to Railway.app with full production-ready configuration.

## 🏗️ System Architecture

### Frontend
- **Technology**: HTML5, CSS3, JavaScript
- **Database**: IndexedDB (browser-based)
- **Location**: `/frontend/public/`

### Backend
- **Technology**: Node.js, Express.js
- **Database**: MySQL (Railway-provided)
- **Authentication**: JWT tokens
- **File Storage**: Railway volumes

### Infrastructure
- **Platform**: Railway.app
- **Build System**: Nixpacks
- **Environment**: Production
- **Monitoring**: Railway health checks

## 🔧 Railway Configuration

### 1. Railway.toml Configuration

The `railway.toml` file is pre-configured with:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
healthcheckPath = "/api/health"
healthcheckTimeout = 100
healthcheckInterval = 30

[[services]]
name = "api"
source = "."

[env]
NODE_ENV = "production"
PORT = "${PORT:-3000}"
DATABASE_URL = "${DATABASE_URL}"
JWT_SECRET = "${JWT_SECRET}"
GITHUB_TOKEN = "${GITHUB_TOKEN}"
```

### 2. Environment Variables

Required environment variables for Railway:

#### Database Configuration
- `DATABASE_URL` - Railway MySQL connection string
- `DB_HOST` - Database host (auto-set by Railway)
- `DB_USER` - Database username (auto-set by Railway)
- `DB_PASSWORD` - Database password (auto-set by Railway)
- `DB_NAME` - Database name (auto-set by Railway)
- `DB_PORT` - Database port (auto-set by Railway)

#### Security Configuration
- `JWT_SECRET` - JWT token secret (generate a secure random string)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `JWT_EXPIRE` - Token expiration time (default: 7d)
- `CORS_ORIGIN` - CORS allowed origins (default: *)

#### Application Configuration
- `APP_NAME` - Application name
- `APP_VERSION` - Application version
- `APP_URL` - Application URL (auto-set by Railway)

#### File Upload Configuration
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 10485760)
- `UPLOAD_PATH` - File upload directory (default: ./uploads)

#### GitHub Integration
- `GITHUB_TOKEN` - GitHub access token for auto-push
- `GITHUB_REPO` - GitHub repository name
- `GITHUB_BRANCH` - GitHub branch (default: main)
- `AUTO_PUSH_ENABLED` - Enable auto-push (default: true)

## 🚀 Deployment Steps

### Step 1: Prepare Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Verify Structure**:
   ```
   kashtec-construction-system/
   ├── server.js                 # Main server file
   ├── railway.toml             # Railway configuration
   ├── package.json             # Dependencies
   ├── backend/                 # Backend code
   │   ├── routes/             # API routes
   │   ├── config/             # Configuration files
   │   └── notification-system.js
   ├── frontend/               # Frontend code
   │   └── public/
   │       ├── department.html
   │       └── database-adapter.js
   └── database/              # Database files
   ```

### Step 2: Deploy to Railway

1. **Login to Railway**:
   ```bash
   railway login
   ```

2. **Create New Project**:
   ```bash
   railway new
   ```

3. **Connect Repository**:
   - Select your GitHub repository
   - Choose the main branch
   - Railway will automatically detect the Node.js application

4. **Add Database**:
   ```bash
   railway add mysql
   ```

5. **Configure Environment Variables**:
   - Go to Railway dashboard
   - Navigate to your project
   - Click on "Variables"
   - Add the required environment variables

6. **Deploy**:
   ```bash
   railway up
   ```

### Step 3: Configure Database

1. **Run Migrations**:
   ```bash
   railway run npm run migrate
   ```

2. **Seed Database** (optional):
   ```bash
   railway run npm run seed
   ```

### Step 4: Verify Deployment

1. **Check Health Endpoint**:
   ```bash
   curl https://your-app.railway.app/api/health
   ```

2. **Test API Endpoints**:
   ```bash
   curl https://your-app.railway.app/api/health
   curl https://your-app.railway.app/api/db-health
   ```

## 🔒 Security Configuration

### 1. JWT Secret Generation

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Set this as `JWT_SECRET` in Railway variables.

### 2. CORS Configuration

For production, set specific origins:

```env
CORS_ORIGIN = "https://your-domain.com"
```

### 3. Rate Limiting

The application includes rate limiting:
- 100 requests per 15 minutes per IP
- Applied to all `/api/*` routes

## 📊 Monitoring and Health Checks

### Health Endpoints

1. **Application Health**: `/api/health`
   - Returns server status, uptime, memory usage
   - Monitored by Railway for automatic restarts

2. **Database Health**: `/api/db-health`
   - Checks database connection
   - Returns collection statistics

### Railway Monitoring

Railway automatically provides:
- **Health Checks**: Based on `/api/health` endpoint
- **Auto-restart**: On application failure
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage

## 🔄 Continuous Deployment

### Automatic Deployments

Railway automatically deploys when:
- New code is pushed to the connected branch
- Environment variables are changed
- Database configuration is updated

### Manual Deployments

```bash
# Deploy latest changes
railway up

# Deploy specific commit
railway up --commit <commit-hash>

# Redeploy without changes
railway redeploy
```

## 📁 File Uploads and Storage

### Upload Configuration

- **Location**: `/uploads` directory in container
- **Max Size**: 10MB (configurable via `MAX_FILE_SIZE`)
- **Allowed Types**: Images, PDFs, Office documents
- **Persistence**: Railway volumes for persistent storage

### File Access

Files are accessible via:
- **API**: `/api/documents/:id/download`
- **Direct**: `/uploads/filename`

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check `DATABASE_URL` environment variable
   - Verify MySQL service is running
   - Run `railway run npm run migrate`

2. **Build Failures**:
   - Check `package.json` dependencies
   - Verify Node.js version compatibility
   - Review build logs in Railway dashboard

3. **Health Check Failures**:
   - Ensure `/api/health` endpoint is accessible
   - Check server startup logs
   - Verify PORT configuration

4. **File Upload Issues**:
   - Check `UPLOAD_PATH` permissions
   - Verify volume is attached
   - Check file size limits

### Debug Commands

```bash
# View logs
railway logs

# Access container shell
railway shell

# Check environment variables
railway variables

# Restart service
railway restart
```

## 🎯 Production Best Practices

### 1. Environment Management
- Use Railway's built-in environment variables
- Never commit secrets to Git
- Use different variables for staging/production

### 2. Database Management
- Regular backups via Railway
- Use connection pooling
- Monitor database performance

### 3. Security
- Keep dependencies updated
- Use HTTPS (automatic on Railway)
- Implement proper authentication
- Monitor for security vulnerabilities

### 4. Performance
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Monitor response times

## 📱 Accessing the Application

After successful deployment:

1. **Application URL**: `https://your-app-name.railway.app`
2. **API Base URL**: `https://your-app-name.railway.app/api`
3. **Health Check**: `https://your-app-name.railway.app/api/health`

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Update dependencies locally
npm update

# Test changes
npm run dev

# Deploy updates
git add .
git commit -m "Update dependencies"
git push origin main
```

### Database Migrations

```bash
# Create new migration
railway run npm run migrate:create new_migration

# Run migrations
railway run npm run migrate

# Check migration status
railway run npm run migrate:status
```

## 🎉 Success Metrics

Your deployment is successful when:

- ✅ Health endpoint returns 200 OK
- ✅ Database connection is established
- ✅ Frontend loads properly
- ✅ API endpoints respond correctly
- ✅ File uploads work
- ✅ Authentication functions
- ✅ Railway shows "Running" status

## 📞 Support

For deployment issues:
1. Check Railway logs: `railway logs`
2. Review this guide
3. Consult Railway documentation
4. Contact Railway support

---

**🚀 Your KASHTEC Construction Management System is now ready for Railway deployment!**
