# Finance Email Service

## Overview

The Finance Email Service provides automated email notifications for finance department activities in the KASHTEC Construction Management System.

## Features

- **Budget Creation Notifications**: Sends emails when new budgets are created
- **Expense Submission Notifications**: Notifies when expenses are submitted for approval
- **Expense Approval/Rejection**: Alerts when expenses are approved or rejected
- **Payroll Processing Notifications**: Sends notifications when payroll is processed
- **Financial Report Notifications**: Notifies when financial reports are generated
- **System Alert Notifications**: Sends critical system alerts and updates
- **Custom Email Notifications**: Allows sending custom email notifications

## Setup

### 1. Install Dependencies

```bash
npm install nodemailer
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the email configuration:

```env
# Email Configuration for Finance Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=finance@kashtec.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

### 3. Gmail Setup (if using Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Usage

### Automatic Notifications

The system automatically sends emails for the following events:

#### Budget Creation
```javascript
// When a new budget is created via POST /api/finance/budget
// Recipients: Finance managers, admins
```

#### Expense Activities
```javascript
// When expense submitted via POST /api/finance/expense
// When expense approved via PUT /api/finance/expense/:id/approve
// When expense rejected via PUT /api/finance/expense/:id/reject
```

#### Payroll Processing
```javascript
// When payroll processed via POST /api/finance/payroll
```

### Manual Notifications

#### Test Email Configuration
```javascript
POST /api/finance/test-email
```

#### Send Custom Notification
```javascript
POST /api/finance/send-notification
{
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "subject": "Custom Notification",
  "activityType": "system_alert",
  "activityDetails": "Custom message details",
  "amount": 1000000,
  "department": "Finance",
  "priority": "high"
}
```

## Frontend Integration

The finance department interface includes:

1. **Email Notification Settings** - Configure notification preferences and recipients
2. **Test Email Configuration** - Verify email service setup
3. **Custom Notification Form** - Send ad-hoc email notifications

### Accessing Email Settings

1. Navigate to Finance Department
2. Click on "Email Notifications" in the menu
3. Configure preferences and recipients
4. Save settings

## Email Templates

The service uses responsive HTML email templates with:

- Professional KASHTEC branding
- Activity-specific icons and formatting
- Priority-based styling
- Mobile-responsive design
- Action buttons linking to the finance dashboard

## Recipient Management

### Automatic Recipients

The system automatically retrieves recipients from the database:

```sql
SELECT email, CONCAT(first_name, ' ', last_name) as name 
FROM users 
WHERE role = 'finance_manager' OR department = 'Finance' OR role = 'admin'
AND email IS NOT NULL AND email != ''
```

### Manual Recipients

Users can configure additional recipients through the frontend interface.

## Error Handling

- Failed email attempts are logged to console
- Graceful fallback to default recipient if database query fails
- Email sending failures don't block main application functionality

## Security

- Email credentials stored in environment variables
- No sensitive information logged
- Input validation on all email parameters
- HTML email content sanitized

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check SMTP credentials
   - Verify app password for Gmail
   - Ensure 2FA is enabled

2. **Connection Timeout**
   - Check SMTP host and port
   - Verify firewall settings
   - Test network connectivity

3. **Email Not Received**
   - Check spam/junk folders
   - Verify recipient email addresses
   - Check email quota limits

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=nodemailer
```

## Development

### Adding New Notification Types

1. Add new activity type to `email-service.js`
2. Create corresponding notification method
3. Update frontend activity type options
4. Add email template styling if needed

### Customizing Templates

Edit the `generateEmailTemplate` method in `email-service.js` to modify:
- Branding and styling
- Layout and structure
- Content formatting
- Action buttons

## Production Considerations

- Use a dedicated email service (SendGrid, Mailgun, etc.) for high volume
- Set up email tracking and analytics
- Configure bounce handling and retry logic
- Monitor email deliverability rates
- Set up rate limiting for bulk emails

## Support

For issues or questions about the email service:

1. Check the console logs for error messages
2. Verify environment configuration
3. Test email connectivity using the test endpoint
4. Review recipient database entries
