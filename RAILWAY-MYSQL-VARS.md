# Railway MySQL Environment Variables

## Railway Provides These MySQL Variables Automatically:

### Database Connection Variables:
```
MYSQL_DATABASE="railway"
MYSQL_PUBLIC_URL="mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{MYSQL_DATABASE}}"
MYSQL_ROOT_PASSWORD="LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz"
MYSQL_URL="mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:3306/${{MYSQL_DATABASE}}"
MYSQLDATABASE="${{MYSQL_DATABASE}}"
MYSQLHOST="${{RAILWAY_PRIVATE_DOMAIN}}"
MYSQLPASSWORD="${{MYSQL_ROOT_PASSWORD}}"
MYSQLPORT="3306"
MYSQLUSER="root"
```

### Application Variables:
```
PORT
RAILWAY_PUBLIC_DOMAIN
RAILWAY_PRIVATE_DOMAIN
RAILWAY_TCP_PROXY_DOMAIN
RAILWAY_TCP_PROXY_PORT
```

## Current Configuration

Your `railway.toml` is configured to use these variables:

```toml
[env]
NODE_ENV = "production"
PORT = "${PORT:-3000}"
DATABASE_URL = "${MYSQL_PUBLIC_URL}"
JWT_SECRET = "${JWT_SECRET:-kashtec-secret-key-2024}"

# Database Configuration (Railway MySQL Variables)
DB_HOST = "${MYSQLHOST}"
DB_USER = "${MYSQLUSER}"
DB_PASSWORD = "${MYSQLPASSWORD}"
DB_NAME = "${MYSQLDATABASE}"
DB_PORT = "${MYSQLPORT}"

APP_URL = "https://${RAILWAY_PUBLIC_DOMAIN}"
```

## What You Need to Set Manually

Only these variables in Railway Dashboard:

### Required:
```
JWT_SECRET=kashtec-secret-key-2024
```

### Optional:
```
GITHUB_TOKEN=your_github_token
CORS_ORIGIN=*
```

## Database Connection

The application will connect using:
- **Primary**: `MYSQL_PUBLIC_URL` (public connection)
- **Fallback**: Individual MySQL variables
- **Database**: `railway`
- **User**: `root`
- **Host**: Railway private domain
- **Port**: 3306

## Setup Steps

1. Add MySQL plugin in Railway dashboard
2. Set JWT_SECRET in Variables tab
3. Deploy your service
4. Railway provides all MySQL variables automatically

Your application will automatically connect to Railway MySQL! 🚀
