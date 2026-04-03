const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class FinanceEmailService {
    constructor() {
        this.transporter = null;
        this.emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'finance@kashtec.com',
                pass: process.env.SMTP_PASS || 'your-app-password'
            }
        };
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransporter(this.emailConfig);
            console.log('📧 Email service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
        }
    }

    async sendFinanceNotification(emailData) {
        const {
            recipientEmail,
            recipientName,
            subject,
            activityType,
            activityDetails,
            amount,
            department,
            priority = 'normal'
        } = emailData;

        if (!this.transporter) {
            console.log('❌ Email transporter not available');
            return false;
        }

        const emailTemplate = this.generateEmailTemplate({
            recipientName,
            activityType,
            activityDetails,
            amount,
            department,
            priority
        });

        const mailOptions = {
            from: `"KASHTEC Finance System" <${this.emailConfig.auth.user}>`,
            to: recipientEmail,
            subject: `[KASHTEC Finance] ${subject}`,
            html: emailTemplate,
            priority: priority === 'urgent' ? 'high' : 'normal'
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully to ${recipientEmail}:`, info.messageId);
            return true;
        } catch (error) {
            console.error(`❌ Failed to send email to ${recipientEmail}:`, error.message);
            return false;
        }
    }

    generateEmailTemplate(data) {
        const { recipientName, activityType, activityDetails, amount, department, priority } = data;
        
        const priorityColors = {
            urgent: '#ff4757',
            high: '#ff6348',
            normal: '#0b3d91',
            low: '#747d8c'
        };

        const activityIcons = {
            'budget_created': '💰',
            'expense_submitted': '📝',
            'expense_approved': '✅',
            'expense_rejected': '❌',
            'payroll_processed': '💵',
            'salary_structure': '📊',
            'financial_report': '📈',
            'system_alert': '🔔'
        };

        const icon = activityIcons[activityType] || '📢';
        const priorityColor = priorityColors[priority] || priorityColors.normal;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KASHTEC Finance Notification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f6f9;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0b3d91 0%, #1e5f8e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }
        .header .subtitle {
            margin-top: 5px;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .activity-icon {
            font-size: 48px;
            text-align: center;
            margin-bottom: 20px;
        }
        .activity-title {
            font-size: 20px;
            font-weight: 600;
            color: #0b3d91;
            margin-bottom: 15px;
            text-align: center;
        }
        .activity-details {
            background: #f8f9fa;
            border-left: 4px solid ${priorityColor};
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #666;
        }
        .detail-value {
            color: #333;
            text-align: right;
        }
        .amount {
            font-size: 18px;
            font-weight: 700;
            color: #27ae60;
        }
        .priority-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            background: ${priorityColor};
            color: white;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 0;
            color: #666;
            font-size: 12px;
        }
        .action-button {
            display: inline-block;
            background: #0b3d91;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: 600;
        }
        .action-button:hover {
            background: #1e5f8e;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-value {
                text-align: left;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KASHTEC Finance System</h1>
            <div class="subtitle">Construction Management Platform</div>
        </div>
        
        <div class="content">
            <div class="activity-icon">${icon}</div>
            <div class="activity-title">Finance Activity Notification</div>
            
            <p>Dear ${recipientName},</p>
            <p>There has been a new activity in the finance system that requires your attention:</p>
            
            <div class="activity-details">
                <div class="detail-row">
                    <span class="detail-label">Activity Type:</span>
                    <span class="detail-value">${this.formatActivityType(activityType)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${department || 'N/A'}</span>
                </div>
                ${amount ? `
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value amount">TZS ${amount?.toLocaleString() || 0}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value"><span class="priority-badge">${priority}</span></span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${new Date().toLocaleString()}</span>
                </div>
            </div>
            
            ${activityDetails ? `
            <div style="margin: 20px 0;">
                <strong>Details:</strong><br>
                ${activityDetails.replace(/\n/g, '<br>')}
            </div>
            ` : ''}
            
            <div style="text-align: center;">
                <a href="https://kashtec-system.com/finance" class="action-button">
                    View in Finance Dashboard
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from the KASHTEC Finance Management System.</p>
            <p>If you have any questions, please contact the finance department.</p>
            <p>&copy; 2026 KASHTEC Construction. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    }

    formatActivityType(activityType) {
        const types = {
            'budget_created': 'Budget Created',
            'expense_submitted': 'Expense Submitted',
            'expense_approved': 'Expense Approved',
            'expense_rejected': 'Expense Rejected',
            'payroll_processed': 'Payroll Processed',
            'salary_structure': 'Salary Structure Updated',
            'financial_report': 'Financial Report Generated',
            'system_alert': 'System Alert'
        };
        return types[activityType] || activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    async notifyBudgetCreation(budgetData, recipients) {
        const notifications = recipients.map(recipient => 
            this.sendFinanceNotification({
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                subject: `New Budget Created - ${budgetData.department}`,
                activityType: 'budget_created',
                activityDetails: `Budget for ${budgetData.department} department (${budgetData.period}) has been created with total allocation of TZS ${budgetData.totalBudget?.toLocaleString() || 0}.`,
                amount: budgetData.totalBudget,
                department: budgetData.department,
                priority: 'high'
            })
        );
        
        const results = await Promise.all(notifications);
        return results.filter(r => r).length;
    }

    async notifyExpenseSubmission(expenseData, recipients) {
        const notifications = recipients.map(recipient => 
            this.sendFinanceNotification({
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                subject: `New Expense Submitted - ${expenseData.category}`,
                activityType: 'expense_submitted',
                activityDetails: `Expense request for ${expenseData.category}: ${expenseData.description}`,
                amount: expenseData.amount,
                department: expenseData.department,
                priority: 'normal'
            })
        );
        
        const results = await Promise.all(notifications);
        return results.filter(r => r).length;
    }

    async notifyExpenseApproval(expenseData, recipients) {
        const notifications = recipients.map(recipient => 
            this.sendFinanceNotification({
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                subject: `Expense Approved - ${expenseData.category}`,
                activityType: 'expense_approved',
                activityDetails: `Expense for ${expenseData.category} has been approved and will be processed.`,
                amount: expenseData.amount,
                department: expenseData.department,
                priority: 'normal'
            })
        );
        
        const results = await Promise.all(notifications);
        return results.filter(r => r).length;
    }

    async notifyExpenseRejection(expenseData, recipients) {
        const notifications = recipients.map(recipient => 
            this.sendFinanceNotification({
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                subject: `Expense Rejected - ${expenseData.category}`,
                activityType: 'expense_rejected',
                activityDetails: `Expense for ${expenseData.category} has been rejected. Reason: ${expenseData.rejectionReason || 'Not provided'}`,
                amount: expenseData.amount,
                department: expenseData.department,
                priority: 'high'
            })
        );
        
        const results = await Promise.all(notifications);
        return results.filter(r => r).length;
    }

    async notifyPayrollProcessing(payrollData, recipients) {
        const notifications = recipients.map(recipient => 
            this.sendFinanceNotification({
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                subject: `Payroll Processed - ${payrollData.payrollMonth}`,
                activityType: 'payroll_processed',
                activityDetails: `Payroll for ${payrollData.payrollMonth} has been processed for ${payrollData.totalEmployees} employees. Net payment: TZS ${payrollData.netPayment?.toLocaleString() || 0}`,
                amount: payrollData.netPayment,
                department: 'Finance',
                priority: 'high'
            })
        );
        
        const results = await Promise.all(notifications);
        return results.filter(r => r).length;
    }

    async notifyFinancialReport(reportData, recipients) {
        const notifications = recipients.map(recipient => 
            this.sendFinanceNotification({
                recipientEmail: recipient.email,
                recipientName: recipient.name,
                subject: `Financial Report Generated - ${reportData.reportType}`,
                activityType: 'financial_report',
                activityDetails: `${reportData.reportType} report has been generated for the period ${reportData.period}. Key highlights available in the dashboard.`,
                department: 'Finance',
                priority: 'normal'
            })
        );
        
        const results = await Promise.all(notifications);
        return results.filter(r => r).length;
    }

    async testEmailConfiguration() {
        const testEmail = {
            recipientEmail: this.emailConfig.auth.user,
            recipientName: 'Finance Manager',
            subject: 'Email Service Test',
            activityType: 'system_alert',
            activityDetails: 'This is a test email to verify the email service configuration.',
            department: 'Finance',
            priority: 'low'
        };

        return await this.sendFinanceNotification(testEmail);
    }
}

module.exports = FinanceEmailService;
