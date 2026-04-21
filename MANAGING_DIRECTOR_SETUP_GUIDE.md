# Managing Director API Setup & Testing Guide

## Quick Start

This guide will help you set up and test the Managing Director API for KASHTEC Construction System.

## Prerequisites

1. **Node.js and MySQL** installed
2. **KASHTEC Construction System** backend running
3. **Postman** installed (recommended for testing)

## Step 1: Database Setup

### Option A: Using Sample Data (Recommended)

1. Start your MySQL server
2. Navigate to your project directory
3. Run the sample data script:

```bash
mysql -u your_username -p your_database_name < sample_managing_director_data.sql
```

### Option B: Manual Setup

If you prefer to set up tables manually, ensure you have these tables:
- `projects`
- `employees`
- `worker_assignments`
- `task_assignments`
- `workforce_requests`
- `work_approvals`
- `leave_requests`
- `budget_requests`
- `safety_incidents`
- `compliance_issues`
- `risk_assessments`
- `audit_reports`
- `expenses`
- `attendance`
- `site_reports`

## Step 2: Start the Server

```bash
cd kashtec-construction-system
npm start
```

The server should start on `http://localhost:3000`

## Step 3: Authentication Setup

### Get JWT Token

1. Open Postman
2. Create a new request
3. **Method:** POST
4. **URL:** `http://localhost:3000/api/auth/login`
5. **Headers:** `Content-Type: application/json`
6. **Body:**
```json
{
  "email": "director@kashtec.co.tz",
  "password": "director123"
}
```

7. Send the request and copy the `token` from the response

### Set Up Postman Collection

1. **Import Collection:**
   - Open Postman
   - Click "Import"
   - Select "Managing_Director_API_Postman_Collection.json"
   - Click "Import"

2. **Configure Variables:**
   - Click on "Managing Director API" collection
   - Go to "Variables" tab
   - Update `token` variable with your JWT token
   - Ensure `baseUrl` is set to `http://localhost:3000/api`

## Step 4: Test the API

### Testing Order

Follow this sequence for comprehensive testing:

1. **Authentication** - Get JWT token
2. **Dashboard** - Test executive overview
3. **Projects** - View all projects with metrics
4. **Financial** - Check financial data
5. **Employee Performance** - View performance analytics
6. **Pending Approvals** - Check items needing approval
7. **Risk & Compliance** - Review safety and compliance data
8. **Reports** - Generate various executive reports
9. **Approval Actions** - Test approve/reject functionality

### Sample Test Results

#### Dashboard Test
- **Request:** GET `/managing-director/dashboard`
- **Expected:** JSON with overview metrics and recent activities
- **Sample Response:**
```json
{
  "success": true,
  "dashboard": {
    "overview": {
      "totalProjects": 5,
      "activeProjects": 3,
      "totalEmployees": 10,
      "totalRevenue": 11500000.00,
      "pendingApprovals": 4
    }
  }
}
```

#### Projects Test
- **Request:** GET `/managing-director/projects`
- **Expected:** Array of projects with worker counts and manager details
- **Sample Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "PRJ1705123456",
      "name": "Downtown Shopping Mall",
      "status": "Active",
      "budget": 2500000.00,
      "worker_count": 5,
      "manager_name": "Sarah Johnson"
    }
  ]
}
```

## Step 5: Common Issues & Solutions

### Issue: "Cannot GET /api/managing-director/dashboard"
**Solution:** 
- Ensure server is running on port 3000
- Check if managing director routes are mounted in server.js
- Verify the route path: `/api/managing-director/dashboard`

### Issue: "Unauthorized" or 401 Error
**Solution:**
- Check if JWT token is valid
- Ensure Authorization header is: `Bearer <token>`
- Verify token is not expired

### Issue: "Database connection failed"
**Solution:**
- Check MySQL server is running
- Verify database connection in `.env` file
- Ensure database exists and tables are created

### Issue: "No data returned"
**Solution:**
- Run the sample data SQL script
- Check if tables have data
- Verify database name in connection

## Step 6: Advanced Testing

### Custom Date Ranges for Reports

Test reports with custom date ranges:

```
GET /managing-director/reports/quarterly?startDate=2024-01-01&endDate=2024-03-31
GET /managing-director/reports/annual?startDate=2024-01-01&endDate=2024-12-31
```

### Approval Workflow Testing

1. Get pending approvals
2. Note the ID of an item to approve/reject
3. Use approval endpoint with that ID
4. Verify status changed

### Error Testing

Test error scenarios:
- Invalid token
- Missing required fields
- Non-existent IDs
- Invalid date ranges

## Step 7: Production Considerations

### Security
- Use HTTPS in production
- Implement proper JWT expiration
- Add rate limiting
- Validate all inputs

### Performance
- Add database indexes
- Implement caching for reports
- Use pagination for large datasets
- Optimize complex queries

### Monitoring
- Add logging for all API calls
- Monitor response times
- Track error rates
- Set up alerts for failures

## API Endpoint Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard` | GET | Executive dashboard overview |
| `/projects` | GET | All projects with metrics |
| `/financial` | GET | Financial data and reports |
| `/employees/performance` | GET | Employee performance analytics |
| `/approvals/pending` | GET | Pending approvals list |
| `/approvals/:type/:id` | POST | Approve/reject requests |
| `/risk-compliance` | GET | Risk and compliance data |
| `/reports/:type` | GET | Generate executive reports |

## Support

If you encounter issues:

1. Check server logs for errors
2. Verify database connections
3. Test with the provided sample data
4. Review the API documentation in `MANAGING_DIRECTOR_API_GUIDE.md`

## Next Steps

After successful testing:

1. Integrate with frontend application
2. Set up proper authentication
3. Configure production environment
4. Implement additional security measures
5. Set up monitoring and logging

---

**Happy Testing! 🚀**
