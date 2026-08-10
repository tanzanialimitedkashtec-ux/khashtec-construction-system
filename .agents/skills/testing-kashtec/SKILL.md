---
name: testing-kashtec-construction
description: Test the KASHTEC Construction System end-to-end. Use when verifying login, dashboard, or department portal changes.
---

# Testing KASHTEC Construction System

## Server Setup

1. Install dependencies: `npm install` from the repo root
2. Start server: `node server.js` — runs on `http://localhost:8080`
3. The server connects to a Railway MySQL database (connection string in server.js)
4. Verify server is ready: `curl http://localhost:8080/api/health`
5. Migration errors on startup (e.g., Migration 53, 62) are expected and non-blocking — the server still works

## Devin Secrets Needed

No dedicated secrets are required. Test credentials are stored in the Railway MySQL database. Query the `authentication` table to find available test users and their roles.

## Login Flow

1. Navigate to `http://localhost:8080`
2. Enter email in the email field
3. Select role from the dropdown (Managing Director, HR Manager, etc.)
4. Enter password
5. Click Login
6. After ~1.5s animation, the dashboard loads with the welcome card

## Logout / Session Reset

There is no visible logout button in the sidebar. To reset the session for testing different users:
- Use Playwright via CDP to clear session: `sessionStorage.clear(); localStorage.clear();` then reload
- Or use the browser console if available: `handleLogout()` function exists in script.js
- Alternatively, force the login page visible by toggling CSS classes on `#loginPage` and `#systemPage`

## Key Architecture Notes

- **Role mapping**: The login flow maps full role names to short codes via `roleMap` (e.g., "Managing Director" → "MD", "HR Manager" → "HR"). The welcome card and dashboard title use the mapped short code, not the full name.
- **Session management**: `sessionManager` (from `sessionManager.js`) stores user data. Use `sessionManager.getCurrentUser()` to retrieve logged-in user info on department pages.
- **Department portal**: `department.html` and `department.js` are separate from the main `script.js` login flow. They read user data from `sessionManager` on `DOMContentLoaded`.
- **Large files**: `department.html` (~90k lines) and `department.js` (~67k lines) are very large. Use `sed`, `python` scripts, or line-range reads instead of loading them fully.
- **No CI**: This repo has no CI checks configured. Testing is manual only.

## Common Test Scenarios

1. **Welcome card display**: After login, verify the card shows avatar (first letter of role), role name, email, and Quick Start section
2. **Department portal**: Navigate to `/department.html` after login to verify session data persists
3. **Different roles**: Test with multiple role logins to verify avatar letter changes correctly

## Playwright CDP Connection

Chrome exposes CDP at `http://localhost:29229`. Use Playwright to script login/logout:
```python
from playwright.async_api import async_playwright
browser = await p.chromium.connect_over_cdp("http://localhost:29229")
```
