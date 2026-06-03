const fs = require('fs');
const path = './frontend/public/department.js';
let content = fs.readFileSync(path, 'utf8');

const targetBtn = '<button class="action-btn download" onclick="downloadViolationReport(\'${violation.id}\')" title="Download Report">';
const replacementBtn = targetBtn + 'ðŸ“„</button>\n                        <button class="action-btn approve" onclick="approveViolation(\'${violation.id}\')" title="Approve Violation">✅</button>\n                        <button class="action-btn reject" onclick="rejectViolation(\'${violation.id}\')" title="Reject Violation">❌</button>';

content = content.replace(targetBtn + 'ðŸ“„</button>', replacementBtn);

const targetFunc = 'function downloadViolationReport(violationId) {\n\n    customAlert(`Downloading violation report for ID: ${violationId}\\n\\nComprehensive violation report will be generated including all details, actions taken, and resolution status for documentation and compliance purposes.`, "Download Report", "info");\n\n}';
const replacementFunc = targetFunc + '\n\nfunction approveViolation(violationId) {\n\n    customAlert(`Approving violation ID: ${violationId}\\n\\nThe violation has been approved successfully.`, "Approve Violation", "success");\n\n}\n\nfunction rejectViolation(violationId) {\n\n    customAlert(`Rejecting violation ID: ${violationId}\\n\\nThe violation has been rejected.`, "Reject Violation", "warning");\n\n}';

content = content.replace(targetFunc, replacementFunc);

const targetFuncCrLf = 'function downloadViolationReport(violationId) {\r\n\r\n    customAlert(`Downloading violation report for ID: ${violationId}\\n\\nComprehensive violation report will be generated including all details, actions taken, and resolution status for documentation and compliance purposes.`, "Download Report", "info");\r\n\r\n}';
const replacementFuncCrLf = targetFuncCrLf + '\r\n\r\nfunction approveViolation(violationId) {\r\n\r\n    customAlert(`Approving violation ID: ${violationId}\\n\\nThe violation has been approved successfully.`, "Approve Violation", "success");\r\n\r\n}\r\n\r\nfunction rejectViolation(violationId) {\r\n\r\n    customAlert(`Rejecting violation ID: ${violationId}\\n\\nThe violation has been rejected.`, "Reject Violation", "warning");\r\n\r\n}';

content = content.replace(targetFuncCrLf, replacementFuncCrLf);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");