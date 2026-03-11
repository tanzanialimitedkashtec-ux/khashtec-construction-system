# Railway Environment Variables

## Automatic Variables (Provided by Railway)

Railway automatically provides these environment variables to your application:

### Database Variables
- `DATABASE_URL` - Full MySQL connection string
- `MYSQL_PUBLIC_URL` - Public MySQL connection string  
- `RAILWAY_PRIVATE_DOMAIN` - Private database host
- `MYSQLUSER` - Database username (usually "root")
- `MYSQLPASSWORD` - Database password
- `MYSQLDATABASE` - Database name
- `MYSQLPORT` - Database port (usually 3306)

### Application Variables
- `PORT` - Application port (usually 3000)
- `RAILWAY_PUBLIC_DOMAIN` - Your public domain (e.g., `your-app.up.railway.app`)
- `RAILWAY_PROJECT_NAME` - Your project name
- `RAILWAY_SERVICE_NAME` - Your service name
- `RAILWAY_ENVIRONMENT_NAME` - Environment name (production/development)
- `RAILWAY_PROJECT_ID` - Project ID
- `RAILWAY_SERVICE_ID` - Service ID
- `RAILWAY_ENVIRONMENT_ID` - Environment ID

## Manual Variables (You Need to Set)

These variables you need to set manually in Railway Dashboard:

### Required
- `JWT_SECRET` - Secret key for JWT tokens
- `GITHUB_TOKEN` - GitHub personal access token (if using GitHub integration)

### Optional
- `GITHUB_REPO` - Your GitHub repository name
- `CORS_ORIGIN` - Allowed CORS origins (default: *)
- `SMTP_*` - Email notification settings

## Current Configuration

Your `railway.toml` is now configured to use Railway's automatic variables:

```toml
[env]
NODE_ENV = "production"
PORT = "${PORT:-3000}"
DATABASE_URL = "${DATABASE_URL}"
JWT_SECRET = "${JWT_SECRET:-kashtec-secret-key-2024}"

# Database Configuration
DB_HOST = "${RAILWAY_PRIVATE_DOMAIN}"
DB_USER = "${MYSQLUSER:-root}"
DB_PASSWORD = "${MYSQLPASSWORD}"
DB_NAME = "${MYSQLDATABASE:-railway}"
DB_PORT = "${MYSQLPORT:-3306}"

# Application Configuration  
APP_URL = "https://${RAILWAY_PUBLIC_DOMAIN}"
```

## Setup Steps

1. **Add MySQL Plugin** in Railway dashboard
2. **Set JWT_SECRET** in Railway Variables tab
3. **Redeploy** your service
4. **Test connection** - Railway will provide database variables automatically

Your application will now use Railway's built-in environment variables! 🚀
