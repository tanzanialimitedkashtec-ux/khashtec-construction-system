# KASHTEC Construction Management System

## Railway Deployment Configuration

### Prerequisites
- Railway account
- Railway CLI installed
- Node.js 16+ installed locally

### Deployment Steps

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login to Railway
```bash
railway login
```

#### 3. Prepare for Deployment
```bash
# Navigate to project directory
cd kashtec-construction-system/backend

# Install dependencies
npm install --production

# Create railway.toml configuration
```

#### 4. Create Railway Configuration
Create `railway.toml` in the backend directory:

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
```

#### 5. Deploy to Railway
```bash
# Deploy the application
railway up

# Or for specific environment
railway up --environment production
```

#### 6. Set Environment Variables
After deployment, set these environment variables in Railway dashboard:

```env
DB_HOST=railway
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=kashtec_construction
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

#### 7. Update Frontend API URL
Update the frontend API base URL in `frontend/assets/js/api.js`:

```javascript
const API_BASE_URL = 'https://your-app-name.railway.app/api';
```

#### 8. Railway Commands

```bash
# View logs
railway logs

# View status
railway status

# Open dashboard
railway open

# Restart service
railway restart

# Scale service
railway scale

# Destroy service
railway destroy
```

### Production Considerations

#### Database
- Use Railway's managed MySQL service
- Set up automatic backups
- Configure connection pooling
- Use environment variables for credentials

#### Security
- Change all default passwords before deployment
- Use Railway's built-in SSL certificates
- Set up proper CORS for your domain
- Enable Railway's security features

#### Performance
- Enable Railway's auto-scaling
- Monitor resource usage
- Set up proper health checks
- Configure caching headers

#### Monitoring
- Set up Railway alerts
- Use external monitoring services
- Configure log aggregation
- Set up uptime monitoring

### Troubleshooting

#### Common Issues
1. **Build Failures**: Check package.json dependencies
2. **Database Connection**: Verify environment variables
3. **Port Conflicts**: Ensure no port conflicts
4. **CORS Issues**: Verify origin configuration
5. **Memory Issues**: Check Railway resource limits

### Support
- Railway documentation: https://docs.railway.app
- Community support: https://community.railway.app
- Status page: https://status.railway.app

### Success Indicators
✅ Application deployed successfully
✅ Database connected
✅ API endpoints responding
✅ Frontend accessible
✅ Health checks passing
