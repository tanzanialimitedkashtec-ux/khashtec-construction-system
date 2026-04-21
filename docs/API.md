# KASHTEC Construction System - API Documentation

## 🚀 Getting Started

### Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

### Authentication
All API endpoints (except login/register) require JWT authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+255 712 345 678",
  "location": "Dar es Salaam",
  "serviceType": "Construction",
  "customService": "Custom service description",
  "additionalInfo": "Additional information",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "Customer",
    "department": "Clients"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "Customer"
  }
}
```

## 👥 User Management Endpoints

### Get All Users
```http
GET /api/users
```

**Query Parameters:**
- `department` (optional): Filter by department
- `role` (optional): Filter by role
- `search` (optional): Search by name, email, or department

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Customer",
      "department": "Clients",
      "status": "Active",
      "registration_date": "2024-03-03"
    }
  ],
  "count": 1
}
```

### Get User by ID
```http
GET /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+255 712 345 678",
    "location": "Dar es Salaam",
    "role": "Customer",
    "department": "Clients",
    "status": "Active"
  }
}
```

### Update User
```http
PUT /api/users/:id
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+255 712 345 679",
  "location": "New Location",
  "status": "Active"
}
```

### Delete User
```http
DELETE /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 📊 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 Role-Based Access

### Role Hierarchy
1. **Managing Director** - Full access
2. **Department Managers** - Department + limited cross-department access
3. **Office Assistant** - Limited access
4. **Workers** - Basic access
5. **Customers** - Public access only

### Access Control
Endpoints are protected by middleware:
- `requireAdmin` - Managing Director + Department Managers
- `requireHR` - Managing Director + HR Manager
- `requireFinance` - Managing Director + Finance Manager
- `requireProjectManager` - Managing Director + Project Manager
- `requireRealEstate` - Managing Director + Real Estate Manager
- `requireHSE` - Managing Director + HSE Manager

## 📁 File Uploads

### Upload Endpoint
```http
POST /api/upload
```

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file`

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "filename": "document-1641000000000-123.pdf",
    "originalName": "document.pdf",
    "size": 1024000,
    "path": "/uploads/document-1641000000000-123.pdf"
  }
}
```

### Allowed File Types
- **Images**: JPEG, PNG, GIF
- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Maximum Size**: 10MB

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  service_type VARCHAR(100),
  custom_service TEXT,
  additional_info TEXT,
  password VARCHAR(255) NOT NULL,
  role ENUM('Customer', 'Managing Director', 'HR Manager', 'Finance Manager', 'Project Manager', 'Real Estate Manager', 'HSE Manager', 'Office Assistant', 'Worker'),
  department ENUM('Management', 'Human Resources', 'Finance', 'Project Management', 'Real Estate', 'Health & Safety', 'Administrative', 'Workers', 'Clients'),
  registration_date DATE DEFAULT CURRENT_DATE,
  status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status ENUM('Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'),
  budget DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  manager_id INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Running Tests
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- Authentication endpoints
- User management
- Role-based access
- File uploads
- Database operations

## 🚀 Deployment

### Environment Setup
1. **Set Environment Variables**
   ```bash
   NODE_ENV=production
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=kashtec_db
   JWT_SECRET=your_super_secret_jwt_key
   ```

2. **Database Setup**
   ```bash
   mysql -u root -p < database/migrations/001_create_tables.sql
   ```

3. **Install Dependencies**
   ```bash
   npm install --production
   ```

4. **Start Application**
   ```bash
   npm start
   ```

### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "kashtec-api"

# Monitor logs
pm2 logs kashtec-api

# Restart application
pm2 restart kashtec-api
```

## 📞 Support

For API support and documentation:
- 📧 Email: kashtectz@gmail.com
- 📱 Phone: +255 739 417 181
- 📍 Address: P.O Box 77088, Ubungo External, Mshikamano St, Dar es Salaam

---

*Last updated: March 3, 2026*
