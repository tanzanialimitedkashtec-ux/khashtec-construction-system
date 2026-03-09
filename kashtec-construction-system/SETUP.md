# KASHTEC Construction Management System

## Database Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kashtec-construction-system
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=kashtec_construction
   JWT_SECRET=your-super-secret-jwt-key
   PORT=3000
   ```

4. **Initialize database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Schema

The system uses the following main tables:

- **users** - User authentication and roles
- **employees** - Employee records and information
- **projects** - Project management
- **properties** - Real estate properties
- **clients** - Client registration and management
- **sales** - Property sales transactions
- **incidents** - HSE incident reporting
- **documents** - Company document management
- **attendance** - Employee attendance tracking
- **leave_requests** - Leave management

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login and JWT token generation

### Employees
- `GET /api/employees` - Fetch all employees
- `POST /api/employees` - Create new employee

### Properties
- `GET /api/properties` - Fetch all properties
- `POST /api/properties` - Add new property

### Clients
- `GET /api/clients` - Fetch all clients
- `POST /api/clients` - Register new client

## Frontend Integration

Update the frontend JavaScript modules to use these API endpoints instead of localStorage:

```javascript
// Example API call
const API_BASE_URL = 'http://localhost:3000/api';

async function createEmployee(employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(employeeData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            NotificationManager.show('Employee created successfully!', 'success', 'Success');
            return result;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        NotificationManager.show(error.message, 'error', 'Error');
    }
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers
- Input validation and sanitization

## File Upload Configuration

File uploads are handled securely with:
- File type validation
- Size limits (10MB max)
- Secure storage directory
- Path sanitization

## Development Workflow

1. **Backend Development**: Work in `/backend` directory
2. **Frontend Development**: Work in `/frontend` directory
3. **Database Changes**: Use migration scripts
4. **Testing**: Unit tests for API endpoints
5. **Deployment**: Production-ready with environment variables

## Production Deployment

### Environment Setup
- Use PM2 for process management
- Configure Nginx as reverse proxy
- Set up SSL certificates
- Configure MySQL for production
- Set up automated backups

### Security Considerations
- Change default JWT secret
- Use strong database passwords
- Enable HTTPS in production
- Regular security updates
- Monitor and log access attempts
