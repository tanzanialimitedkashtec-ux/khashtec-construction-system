# KASHTEC Construction Management System

## Railway Deployment Guide

### Quick Start

#### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Login to Railway
```bash
railway login
```

#### 3. Deploy Application
```bash
cd kashtec-construction-system/backend
railway up
```

### Environment Variables

Set these in your Railway dashboard:

#### Production
```env
DB_HOST=railway
DB_PORT=3306
DB_USER=your_railway_database_user
DB_PASSWORD=your_railway_database_password
DB_NAME=kashtec_construction
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

#### Development
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=kashtec_construction
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### Frontend Configuration

Update your frontend API base URL:

```javascript
// In frontend/assets/js/api.js
const API_BASE_URL = 'https://your-app-name.railway.app/api';
```

### Railway Commands

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

### Database Setup

Railway provides managed MySQL databases. Use the Railway dashboard to:

1. Create a new MySQL database
2. Update your application to use Railway's connection details
3. Run database migrations

### SSL Certificate

Railway automatically provides SSL certificates for HTTPS connections.

### Custom Domain

You can configure a custom domain in Railway dashboard for your application.

### Monitoring

Railway provides built-in monitoring and alerting for your deployed application.

### Troubleshooting

#### Common Issues
1. **Build Failures**: Check package.json dependencies
2. **Database Connection**: Verify environment variables
3. **Port Conflicts**: Ensure no port conflicts
4. **CORS Issues**: Verify origin configuration

#### Health Checks

Your application includes a health check endpoint:
```bash
curl https://your-app-name.railway.app/api/health
```

### Support

- **Railway Documentation**: https://docs.railway.app
- **Community Support**: https://community.railway.app
- **Status Page**: https://status.railway.app

### Success Checklist

✅ Application deployed successfully
✅ Database connected
✅ API endpoints responding
✅ Frontend accessible
✅ Health checks passing
✅ SSL certificates active
✅ Monitoring configured

### Next Steps

1. Monitor your application performance
2. Set up automated backups
3. Configure custom domain
4. Enable Railway's advanced security features
5. Set up CI/CD pipeline for future deployments
