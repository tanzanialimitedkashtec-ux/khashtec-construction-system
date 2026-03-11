# Railway Environment Variables Setup

## Manual Setup Required

Since Railway doesn't automatically import all MySQL variables, you need to set them manually in the Railway Dashboard.

### Steps:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. **Add these variables:**

```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://root:YOUR_PASSWORD@centerbeam.proxy.rlwy.net:11044/railway
JWT_SECRET=YOUR_JWT_SECRET
GITHUB_TOKEN=YOUR_GITHUB_TOKEN

DB_HOST=centerbeam.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=railway
DB_PORT=11044
```

Replace:
- YOUR_PASSWORD with your actual database password
- YOUR_JWT_SECRET with a secure random string
- YOUR_GITHUB_TOKEN with your GitHub token

### Alternative: Use Railway MySQL Plugin

1. In Railway dashboard, add MySQL plugin
2. Railway will provide these variables automatically:
   - MYSQL_PUBLIC_URL
   - MYSQLHOST
   - MYSQLUSER
   - MYSQLPASSWORD
   - MYSQLDATABASE
   - MYSQLPORT

3. Then update your railway.toml to use these variables.

### After Setup

1. Redeploy your service
2. Run database migrations: `npm run migrate`
3. Test your database connection

### Security Note

Never commit actual secrets to Git. Always use environment variables in production.
