# Managing Director API Documentation

## Base URL
```
http://localhost:3000/api/managing-director
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Executive Dashboard Overview

### GET /dashboard
Get comprehensive dashboard overview with key metrics.

**Response Sample:**
```json
{
  "success": true,
  "dashboard": {
    "overview": {
      "totalProjects": 25,
      "activeProjects": 18,
      "totalEmployees": 150,
      "totalRevenue": 4500000.00,
      "pendingApprovals": 7
    },
    "recentActivities": [
      {
        "type": "Project",
        "title": "Office Complex Construction",
        "date": "2024-01-15T10:30:00Z",
        "action": "created"
      },
      {
        "type": "Employee",
        "title": "John Smith",
        "date": "2024-01-15T09:15:00Z",
        "action": "hired"
      },
      {
        "type": "Approval",
        "title": "Work Approval #123",
        "date": "2024-01-15T08:45:00Z",
        "action": "submitted"
      }
    ]
  }
}
```

**Postman Test:**
- Method: GET
- URL: `http://localhost:3000/api/managing-director/dashboard`
- Headers: `Authorization: Bearer <token>`

---

## 2. Projects Management

### GET /projects
Get all projects with detailed metrics and worker assignments.

**Response Sample:**
```json
{
  "success": true,
  "projects": [
    {
      "id": "PRJ1234567890",
      "name": "Downtown Shopping Mall",
      "description": "Construction of 5-story shopping complex",
      "location": "Dar es Salaam City Center",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "status": "Active",
      "budget": 2500000.00,
      "contract_value": 2500000.00,
      "client_name": "Tanzania Mall Developers",
      "project_code": "TM-001",
      "project_type": "Commercial",
      "priority_level": "High",
      "manager_name": "Sarah Johnson",
      "worker_count": 45,
      "active_workers": 42,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "PRJ1234567891",
      "name": "Residential Apartment Complex",
      "description": "Construction of 200-unit residential complex",
      "location": "Kigamboni, Dar es Salaam",
      "start_date": "2024-02-01",
      "end_date": "2025-02-28",
      "status": "Planning",
      "budget": 1800000.00,
      "contract_value": 1800000.00,
      "client_name": "Housing Tanzania Ltd",
      "project_code": "HT-002",
      "project_type": "Residential",
      "priority_level": "Medium",
      "manager_name": "Michael Chen",
      "worker_count": 0,
      "active_workers": 0,
      "created_at": "2024-01-10T00:00:00Z",
      "updated_at": "2024-01-10T00:00:00Z"
    }
  ]
}
```

**Postman Test:**
- Method: GET
- URL: `http://localhost:3000/api/managing-director/projects`
- Headers: `Authorization: Bearer <token>`

---

## 3. Financial Overview

### GET /financial
Get comprehensive financial data including revenue, budgets, and expenses.

**Response Sample:**
```json
{
  "success": true,
  "financial": {
    "revenueByMonth": [
      {
        "month": "2024-01",
        "revenue": 850000.00
      },
      {
        "month": "2023-12",
        "revenue": 1200000.00
      },
      {
        "month": "2023-11",
        "revenue": 950000.00
      }
    ],
    "topBudgets": [
      {
        "name": "Downtown Shopping Mall",
        "budget": 2500000.00,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "status": "Active"
      },
      {
        "name": "Highway Bridge Construction",
        "budget": 3200000.00,
        "start_date": "2023-06-01",
        "end_date": "2024-06-30",
        "status": "In Progress"
      }
    ],
    "expenses": [
      {
        "category": "Labor",
        "total": 1250000.00
      },
      {
        "category": "Materials",
        "total": 890000.00
      },
      {
        "category": "Equipment",
        "total": 340000.00
      },
      {
        "category": "Subcontractors",
        "total": 567000.00
      }
    ],
    "summary": {
      "total_revenue": 4500000.00,
      "total_expenses": 3047000.00,
      "completed_projects": 8
    }
  }
}
```

**Postman Test:**
- Method: GET
- URL: `http://localhost:3000/api/managing-director/financial`
- Headers: `Authorization: Bearer <token>`

---

## 4. Employee Performance Metrics

### GET /employees/performance
Get detailed employee performance analytics and department statistics.

**Response Sample:**
```json
{
  "success": true,
  "performance": {
    "departmentStats": [
      {
        "department": "Construction",
        "employee_count": 85,
        "active_rate": 0.95
      },
      {
        "department": "Engineering",
        "employee_count": 25,
        "active_rate": 0.98
      },
      {
        "department": "Administration",
        "employee_count": 20,
        "active_rate": 1.00
      },
      {
        "department": "Safety",
        "employee_count": 15,
        "active_rate": 0.97
      },
      {
        "department": "Finance",
        "employee_count": 5,
        "active_rate": 1.00
      }
    ],
    "topPerformers": [
      {
        "name": "James Wilson",
        "department": "Construction",
        "position": "Site Manager",
        "project_count": 8,
        "avg_quality_score": 9.2
      },
      {
        "name": "Amina Hassan",
        "department": "Engineering",
        "position": "Senior Engineer",
        "project_count": 6,
        "avg_quality_score": 9.5
      },
      {
        "name": "Peter Mwangi",
        "department": "Construction",
        "position": "Project Supervisor",
        "project_count": 7,
        "avg_quality_score": 8.8
      }
    ],
    "attendanceStats": [
      {
        "month": "2024-01",
        "present_days": 2850,
        "absent_days": 150,
        "total_days": 3000
      },
      {
        "month": "2023-12",
        "present_days": 2790,
        "absent_days": 210,
        "total_days": 3000
      }
    ],
    "hiringTrends": [
      {
        "month": "2024-01",
        "hires": 12,
        "department": "Construction"
      },
      {
        "month": "2024-01",
        "hires": 3,
        "department": "Engineering"
      },
      {
        "month": "2023-12",
        "hires": 8,
        "department": "Construction"
      }
    ]
  }
}
```

**Postman Test:**
- Method: GET
- URL: `http://localhost:3000/api/managing-director/employees/performance`
- Headers: `Authorization: Bearer <token>`

---

## 5. Pending Approvals

### GET /approvals/pending
Get all pending approvals requiring director attention.

**Response Sample:**
```json
{
  "success": true,
  "pendingApprovals": {
    "workApprovals": [
      {
        "id": 123,
        "project_id": "PRJ1234567890",
        "work_id": "WK456",
        "completed_by": "John Smith",
        "completion_date": "2024-01-14",
        "quality_assessment": "Excellent work completed on time",
        "compliance_check": "Passed all safety standards",
        "approval_comments": "Ready for final inspection",
        "safety_compliance": "100%",
        "time_completion": "On schedule",
        "quality_score": 9.5,
        "status": "Pending",
        "project_name": "Downtown Shopping Mall",
        "completed_by_name": "John Smith",
        "created_at": "2024-01-14T15:30:00Z"
      }
    ],
    "workforceRequests": [
      {
        "id": 456,
        "project_id": "PRJ1234567891",
        "request_type": "Additional Workers",
        "workers_needed": 15,
        "duration": "3 months",
        "job_categories": "Electricians, Plumbers, Carpenters",
        "justification": "Project phase requires additional skilled workers",
        "start_date": "2024-02-01",
        "end_date": "2024-04-30",
        "special_requirements": "Experience with high-rise construction",
        "status": "Pending",
        "project_name": "Residential Apartment Complex",
        "requested_by_name": "Michael Chen",
        "created_at": "2024-01-13T10:15:00Z"
      }
    ],
    "leaveRequests": [
      {
        "id": 789,
        "employee_id": "EMP001",
        "leave_type": "Annual Leave",
        "start_date": "2024-02-01",
        "end_date": "2024-02-07",
        "reason": "Family vacation",
        "status": "Pending",
        "employee_name": "Sarah Johnson",
        "department": "Management",
        "created_at": "2024-01-12T09:00:00Z"
      }
    ],
    "budgetRequests": [
      {
        "id": 101,
        "project_id": "PRJ1234567890",
        "request_type": "Additional Budget",
        "amount": 150000.00,
        "justification": "Unforeseen site conditions requiring additional foundation work",
        "urgency": "High",
        "status": "Pending",
        "project_name": "Downtown Shopping Mall",
        "requested_by_name": "Sarah Johnson",
        "created_at": "2024-01-11T14:20:00Z"
      }
    ]
  }
}
```

**Postman Test:**
- Method: GET
- URL: `http://localhost:3000/api/managing-director/approvals/pending`
- Headers: `Authorization: Bearer <token>`

---

## 6. Approve/Reject Requests

### POST /approvals/:type/:id
Approve or reject pending requests.

**Parameters:**
- `type`: work, workforce, leave, or budget
- `id`: Request ID

**Request Body Sample:**
```json
{
  "action": "approve",
  "comments": "Approved based on project requirements and budget availability",
  "approved_by": "Managing Director"
}
```

**Response Sample:**
```json
{
  "success": true,
  "message": "work request approved successfully"
}
```

**Postman Test Examples:**

1. **Approve Work Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/managing-director/approvals/work/123`
   - Headers: `Authorization: Bearer <token>`
   - Body:
     ```json
     {
       "action": "approve",
       "comments": "Work quality meets standards",
       "approved_by": "Managing Director"
     }
     ```

2. **Reject Budget Request:**
   - Method: POST
   - URL: `http://localhost:3000/api/managing-director/approvals/budget/101`
   - Headers: `Authorization: Bearer <token>`
   - Body:
     ```json
     {
       "action": "reject",
       "comments": "Budget constraints prevent approval at this time",
       "approved_by": "Managing Director"
     }
     ```

---

## 7. Risk & Compliance

### GET /risk-compliance
Get risk assessment and compliance reports.

**Response Sample:**
```json
{
  "success": true,
  "riskCompliance": {
    "safetyIncidents": [
      {
        "id": 1,
        "project_id": "PRJ1234567890",
        "incident_type": "Minor Injury",
        "severity": "Low",
        "description": "Worker slipped on wet surface, minor sprain",
        "action_taken": "First aid provided, area cleaned",
        "incident_date": "2024-01-10T14:30:00Z",
        "reported_by": "EMP123",
        "status": "Closed",
        "project_name": "Downtown Shopping Mall",
        "reported_by_name": "James Wilson"
      }
    ],
    "complianceIssues": [
      {
        "id": 1,
        "project_id": "PRJ1234567891",
        "issue_type": "Safety Protocol",
        "description": "Missing safety barriers on elevated work area",
        "severity_level": "Medium",
        "required_action": "Install proper safety barriers immediately",
        "due_date": "2024-01-20",
        "status": "Open",
        "reported_date": "2024-01-12T11:00:00Z",
        "project_name": "Residential Apartment Complex"
      }
    ],
    "riskAssessments": [
      {
        "id": 1,
        "project_id": "PRJ1234567890",
        "risk_category": "Structural",
        "risk_description": "Complex foundation requirements in soft soil",
        "risk_level": "High",
        "probability": "Medium",
        "impact": "High",
        "mitigation_plan": "Enhanced soil testing and deep foundation design",
        "review_date": "2024-01-15T09:00:00Z",
        "project_name": "Downtown Shopping Mall"
      }
    ],
    "auditReports": [
      {
        "id": 1,
        "audit_type": "Safety Compliance",
        "compliance_score": 92,
        "findings": "Minor gaps in documentation, overall good safety record",
        "recommendations": "Improve safety documentation process",
        "audit_date": "2024-01-08T00:00:00Z",
        "auditor": "External Safety Consultant"
      }
    ]
  }
}
```

**Postman Test:**
- Method: GET
- URL: `http://localhost:3000/api/managing-director/risk-compliance`
- Headers: `Authorization: Bearer <token>`

---

## 8. Executive Reports

### GET /reports/:type
Generate various types of executive reports.

**Parameters:**
- `type`: quarterly, annual, performance, or financial
- `startDate` (query): Report start date (YYYY-MM-DD)
- `endDate` (query): Report end date (YYYY-MM-DD)

### Quarterly Report Example

**URL:** `GET /reports/quarterly?startDate=2024-01-01&endDate=2024-03-31`

**Response Sample:**
```json
{
  "success": true,
  "reportType": "quarterly",
  "data": {
    "projects": {
      "total_projects": 8,
      "completed_projects": 2,
      "total_value": 3200000.00
    },
    "revenue": {
      "total_revenue": 3200000.00,
      "avg_project_value": 400000.00
    },
    "employees": {
      "total_employees": 150,
      "new_hires": 15
    }
  },
  "generatedAt": "2024-01-15T12:00:00Z"
}
```

### Annual Report Example

**URL:** `GET /reports/annual?startDate=2024-01-01&endDate=2024-12-31`

**Response Sample:**
```json
{
  "success": true,
  "reportType": "annual",
  "data": {
    "yearlyStats": {
      "total_projects": 25,
      "total_revenue": 8500000.00,
      "completed_projects": 18
    },
    "departmentPerformance": [
      {
        "department": "Construction",
        "employee_count": 85,
        "retention_rate": 0.95
      },
      {
        "department": "Engineering",
        "employee_count": 25,
        "retention_rate": 0.98
      }
    ]
  },
  "generatedAt": "2024-01-15T12:00:00Z"
}
```

### Performance Report Example

**URL:** `GET /reports/performance?startDate=2024-01-01&endDate=2024-03-31`

**Response Sample:**
```json
{
  "success": true,
  "reportType": "performance",
  "data": {
    "projectPerformance": [
      {
        "name": "Downtown Shopping Mall",
        "contract_value": 2500000.00,
        "status": "Active",
        "duration_days": 365
      },
      {
        "name": "Highway Bridge",
        "contract_value": 3200000.00,
        "status": "In Progress",
        "duration_days": 395
      }
    ],
    "employeePerformance": [
      {
        "name": "James Wilson",
        "department": "Construction",
        "projects_worked": 8
      },
      {
        "name": "Amina Hassan",
        "department": "Engineering",
        "projects_worked": 6
      }
    ]
  },
  "generatedAt": "2024-01-15T12:00:00Z"
}
```

### Financial Report Example

**URL:** `GET /reports/financial?startDate=2024-01-01&endDate=2024-03-31`

**Response Sample:**
```json
{
  "success": true,
  "reportType": "financial",
  "data": {
    "financialSummary": {
      "total_revenue": 3200000.00,
      "project_count": 8,
      "avg_project_value": 400000.00
    },
    "expenses": [
      {
        "category": "Labor",
        "total_expense": 1450000.00
      },
      {
        "category": "Materials",
        "total_expense": 890000.00
      },
      {
        "category": "Equipment",
        "total_expense": 340000.00
      }
    ]
  },
  "generatedAt": "2024-01-15T12:00:00Z"
}
```

**Postman Test Examples:**

1. **Quarterly Report:**
   - Method: GET
   - URL: `http://localhost:3000/api/managing-director/reports/quarterly?startDate=2024-01-01&endDate=2024-03-31`
   - Headers: `Authorization: Bearer <token>`

2. **Annual Report:**
   - Method: GET
   - URL: `http://localhost:3000/api/managing-director/reports/annual?startDate=2024-01-01&endDate=2024-12-31`
   - Headers: `Authorization: Bearer <token>`

3. **Performance Report:**
   - Method: GET
   - URL: `http://localhost:3000/api/managing-director/reports/performance?startDate=2024-01-01&endDate=2024-03-31`
   - Headers: `Authorization: Bearer <token>`

4. **Financial Report:**
   - Method: GET
   - URL: `http://localhost:3000/api/managing-director/reports/financial?startDate=2024-01-01&endDate=2024-03-31`
   - Headers: `Authorization: Bearer <token>`

---

## Error Handling

All endpoints return consistent error responses:

**Error Response Sample:**
```json
{
  "success": false,
  "error": "Database connection failed",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with Postman

### Setup Instructions:

1. **Create a New Collection:**
   - Name: "Managing Director API"
   - Description: "API endpoints for KASHTEC Managing Director Department"

2. **Set Collection Variables:**
   - `baseUrl`: `http://localhost:3000/api/managing-director`
   - `token`: Your JWT authentication token

3. **Authorization:**
   - Type: Bearer Token
   - Token: `{{token}}`

### Test Order:
1. First, authenticate to get JWT token (use `/api/auth/login`)
2. Test dashboard endpoint
3. Test projects endpoint
4. Test financial endpoint
5. Test employee performance endpoint
6. Test pending approvals endpoint
7. Test risk compliance endpoint
8. Test various report endpoints
9. Test approval/rejection endpoints

### Sample Postman Collection JSON Structure:
```json
{
  "info": {
    "name": "Managing Director API",
    "description": "KASHTEC Construction System - Managing Director Department API"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/managing-director"
    },
    {
      "key": "token",
      "value": "your-jwt-token-here"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  }
}
```

---

## Notes

- All dates are in ISO 8601 format
- All monetary values are in Tanzanian Shillings (TZS)
- The API uses MySQL database
- Rate limiting is applied (100 requests per 15 minutes per IP)
- All endpoints are protected with JWT authentication
- The API supports CORS for cross-origin requests
