# Khashtec Construction System - API Endpoints for Postman Testing

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT token. Include in headers:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### POST /api/auth/login
**Description:** Login to get JWT token

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "username": "admin",
    "password": "admin123", 
    "role": "ADMIN"
}
```

**Available Test Credentials:**
- `username: "admin", password: "admin123", role: "ADMIN"`
- `username: "md", password: "md123", role: "MD"`
- `username: "hr", password: "hr123", role: "HR"`
- `username: "hse", password: "hse123", role: "HSE"`
- `username: "finance", password: "finance123", role: "FINANCE"`
- `username: "projects", password: "projects123", role: "PROJECT"`
- `username: "realestate", password: "realestate123", role: "REALESTATE"`
- `username: "assistant", password: "assistant123", role: "ASSISTANT"`

**Response:**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "admin",
        "role": "ADMIN"
    }
}
```

---

## 2. EMPLOYEE ENDPOINTS

### GET /api/employees
**Description:** Get all employees
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
    {
        "id": 1,
        "full_name": "John Smith",
        "gmail": "john.smith@kashtec.com",
        "phone": "+255123456789",
        "department": "IT",
        "job_category": "Developer",
        "status": "active",
        "hire_date": "2024-01-15",
        "nida": "1234567890123456",
        "passport": "P12345678",
        "contract_type": "Permanent"
    }
]
```

### POST /api/employees
**Description:** Create new employee
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "employee_id": "EMP004",
    "position": "Software Engineer",
    "department": "IT",
    "salary": 1500000,
    "hire_date": "2024-01-20",
    "status": "Active",
    "full_name": "Alice Johnson",
    "gmail": "alice.johnson@kashtec.com",
    "phone": "+255112233445",
    "nida": "1122334455667788",
    "passport": "P11223344",
    "contract_type": "Permanent"
}
```

### GET /api/employees/:id
**Description:** Get employee by ID
**Headers:** `Authorization: Bearer <token>`

### PUT /api/employees/:id
**Description:** Update employee
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "position": "Senior Software Engineer",
    "salary": 1800000,
    "status": "Active"
}
```

### DELETE /api/employees/:id
**Description:** Delete employee
**Headers:** `Authorization: Bearer <token>`

---

## 3. CLIENT ENDPOINTS

### GET /api/clients
**Description:** Get all clients
**Headers:** `Authorization: Bearer <token>`

### POST /api/clients
**Description:** Create new client
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "type": "Individual",
    "fullName": "John Doe",
    "companyName": "",
    "phone": "+255123456789",
    "email": "john.doe@example.com",
    "nida": "1234567890123456",
    "tin": "",
    "address": "Dar es Salaam, Tanzania",
    "propertyInterest": "Residential",
    "budgetRange": "100M-200M TZS",
    "notes": "Interested in 3-bedroom apartments",
    "registeredBy": "Real Estate Agent"
}
```

### GET /api/clients/:id
**Description:** Get client by ID
**Headers:** `Authorization: Bearer <token>`

---

## 4. PROPERTY ENDPOINTS

### GET /api/properties
**Description:** Get all properties
**Headers:** `Authorization: Bearer <token>`

### POST /api/properties
**Description:** Create new property
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "plotNumber": "PLOT-003",
    "type": "Commercial",
    "location": "Dar es Salaam City Center",
    "area": 450,
    "price": 200000000,
    "status": "Available",
    "tpNumber": "TP123456",
    "description": "Prime commercial property with high visibility",
    "utilities": "Water, Electricity, Internet",
    "zoning": "Commercial",
    "addedBy": "Real Estate Agent"
}
```

### GET /api/properties/:id
**Description:** Get property by ID
**Headers:** `Authorization: Bearer <token>`

---

## 5. ATTENDANCE ENDPOINTS

### GET /api/attendance
**Description:** Get all attendance records
**Headers:** `Authorization: Bearer <token>`

### POST /api/attendance
**Description:** Create attendance record
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "employeeId": "EMP001",
    "employeeName": "John Smith",
    "date": "2024-01-15",
    "checkIn": "08:00",
    "checkOut": "17:00",
    "status": "present",
    "department": "IT",
    "notes": "Regular work day"
}
```

### GET /api/attendance/:id
**Description:** Get attendance by ID
**Headers:** `Authorization: Bearer <token>`

### GET /api/attendance/employee/:employeeId
**Description:** Get attendance by employee
**Headers:** `Authorization: Bearer <token>`

### GET /api/attendance/date/:date
**Description:** Get attendance by date
**Headers:** `Authorization: Bearer <token>`

---

## 6. LEAVE REQUESTS ENDPOINTS

### GET /api/leave-requests
**Description:** Get all leave requests
**Headers:** `Authorization: Bearer <token>`

### POST /api/leave-requests
**Description:** Create leave request
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "employee": "EMP001",
    "employee_name": "John Smith",
    "leaveType": "annual",
    "startDate": "2024-02-01",
    "endDate": "2024-02-05",
    "daysRequested": 5,
    "reasonForLeave": "Family vacation"
}
```

### GET /api/leave-requests/:id
**Description:** Get leave request by ID
**Headers:** `Authorization: Bearer <token>`

### PUT /api/leave-requests/:id
**Description:** Update leave request
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "approval_status": "approved",
    "approved_by": "HR Manager",
    "approved_date": "2024-01-25"
}
```

---

## 7. SCHEDULE MEETINGS ENDPOINTS

### GET /api/schedule-meetings/all
**Description:** Get all scheduled meetings
**Headers:** `Authorization: Bearer <token>`

### GET /api/schedule-meetings/upcoming
**Description:** Get upcoming meetings
**Headers:** `Authorization: Bearer <token>`

### POST /api/schedule-meetings/
**Description:** Schedule new meeting
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "meeting_title": "Project Review Meeting",
    "meeting_type": "Project Planning",
    "meeting_date": "2024-02-01",
    "start_time": "09:00",
    "end_time": "10:30",
    "location": "Conference Room A",
    "organizing_department": "PROJECT",
    "expected_attendees": 8,
    "meeting_description": "Monthly project review and planning session",
    "projector_required": true,
    "whiteboard_required": true,
    "refreshments_required": false,
    "parking_required": true,
    "created_by": "Project Manager"
}
```

### GET /api/schedule-meetings/:id
**Description:** Get meeting by ID
**Headers:** `Authorization: Bearer <token>`

### PUT /api/schedule-meetings/:id
**Description:** Update meeting
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

### DELETE /api/schedule-meetings/:id
**Description:** Delete meeting
**Headers:** `Authorization: Bearer <token>`

---

## 8. NOTIFICATIONS ENDPOINTS

### GET /api/notifications
**Description:** Get all notifications
**Headers:** `Authorization: Bearer <token>`

### POST /api/notifications/broadcast
**Description:** Send broadcast notification
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "title": "System Maintenance",
    "message": "System will be under maintenance from 10 PM to 2 AM",
    "type": "info",
    "category": "system",
    "recipientType": "all"
}
```

---

## 9. DOCUMENTS ENDPOINTS

### GET /api/documents
**Description:** Get all documents
**Headers:** `Authorization: Bearer <token>`

### POST /api/documents
**Description:** Upload document
**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Body (form-data):**
- `title`: "Project Proposal"
- `description`: "Initial project proposal document"
- `department`: "PROJECT"
- `document`: (file upload)

### GET /api/documents/:id
**Description:** Get document by ID
**Headers:** `Authorization: Bearer <token>`

### GET /api/documents/:id/download
**Description:** Download document
**Headers:** `Authorization: Bearer <token>`

---

## 10. CONTRACTS ENDPOINTS

### GET /api/contracts
**Description:** Get all contracts
**Headers:** `Authorization: Bearer <token>`

### POST /api/contracts
**Description:** Create new contract
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "contract_number": "CNT-2024-001",
    "contract_type": "Employment",
    "party_a": "Khashtec Construction Ltd",
    "party_b": "John Smith",
    "start_date": "2024-01-15",
    "end_date": "2025-01-15",
    "value": 12000000,
    "status": "Active",
    "description": "Employment contract for Software Engineer position"
}
```

---

## 11. WORKFORCE BUDGET ENDPOINTS

### GET /api/workforce-budget
**Description:** Get workforce budget data
**Headers:** `Authorization: Bearer <token>`

---

## 12. PERSONNEL ENDPOINTS

### GET /api/personnel
**Description:** Get personnel records
**Headers:** `Authorization: Bearer <token>`

---

## 13. POLICIES ENDPOINTS

### GET /api/policies
**Description:** Get all policies
**Headers:** `Authorization: Bearer <token>`

### GET /api/policies/:id
**Description:** Get policy by ID
**Headers:** `Authorization: Bearer <token>`

---

## 14. WORK ENDPOINTS

### GET /api/work
**Description:** Get work assignments
**Headers:** `Authorization: Bearer <token>`

---

## 15. SENIOR HIRING ENDPOINTS

### GET /api/senior-hiring/requests
**Description:** Get senior hiring requests
**Headers:** `Authorization: Bearer <token>`

### POST /api/senior-hiring/requests
**Description:** Create senior hiring request
**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
    "position": "Senior Project Manager",
    "department": "PROJECT",
    "employment_type": "Permanent",
    "experience_required": "5+ years",
    "qualifications": "PMP Certification, Engineering Degree",
    "salary_range": "2.5M-3.5M TZS",
    "request_reason": "New project expansion",
    "requested_by": "Department Head"
}
```

---

## TESTING SEQUENCE

1. **First**: Login to get token
   ```
   POST /api/auth/login
   ```

2. **Copy the token** from response and use it in Authorization header for all other requests

3. **Test endpoints in order**:
   - GET /api/employees (test basic data retrieval)
   - POST /api/employees (test data creation)
   - GET /api/attendance (test attendance system)
   - POST /api/leave-requests (test leave management)
   - POST /api/schedule-meetings/ (test meeting scheduling)

---

## Common Error Responses

### 401 Unauthorized
```json
{
    "error": "No token provided"
}
```

### 400 Bad Request
```json
{
    "error": "Missing required fields"
}
```

### 404 Not Found
```json
{
    "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error",
    "details": "Database connection failed"
}
```

---

## Postman Collection Tips

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:3000`
   - `token`: (set after login)

2. **Use Pre-request Script for auto-authorization:**
   ```javascript
   if (!pm.environment.get("token")) {
       pm.environment.set("token", "your-jwt-token-here");
   }
   ```

3. **Set Authorization header in collection:**
   - Type: Bearer Token
   - Token: `{{token}}`

---

## Health Check Endpoints (No Auth Required)

### GET /api/employees-status
### GET /api/clients-status  
### GET /api/properties-status
### GET /api/policies-status
### GET /api/meeting-minutes-status
### GET /api/senior-hiring-status
### GET /api/office-portal-status

Use these to verify routes are working without authentication.
