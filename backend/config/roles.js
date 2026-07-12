// Canonical role model for KASHTEC.
//
// The codebase historically used many spellings for the same role
// (e.g. "MD", "Managing Director", "md"; "HR", "HR Manager", "hr").
// This module provides ONE canonical name per role plus an alias map so that
// authorization checks are reliable regardless of how the role was stored or
// sent by the client.

// Canonical role names.
const ROLES = {
    MD: 'Managing Director',
    HR: 'HR Manager',
    FINANCE: 'Finance Manager',
    PROJECT: 'Project Manager',
    REAL_ESTATE: 'Real Estate Manager',
    HSE: 'HSE Manager',
    OFFICE_ASSISTANT: 'Office Assistant',
    ADMIN_ASSISTANT: 'Admin Assistant',
    EMPLOYEE: 'Employee',
    WORKER: 'Worker'
};

// Alias -> canonical name. Keys are compared case-insensitively.
const ROLE_ALIASES = {
    'md': ROLES.MD,
    'managing director': ROLES.MD,
    'managingdirector': ROLES.MD,

    'hr': ROLES.HR,
    'hr manager': ROLES.HR,
    'human resources': ROLES.HR,
    'human resources manager': ROLES.HR,

    'finance': ROLES.FINANCE,
    'finance manager': ROLES.FINANCE,
    'accountant': ROLES.FINANCE,

    'project': ROLES.PROJECT,
    'projects': ROLES.PROJECT,
    'project manager': ROLES.PROJECT,

    'realestate': ROLES.REAL_ESTATE,
    'real estate': ROLES.REAL_ESTATE,
    'real estate manager': ROLES.REAL_ESTATE,

    'hse': ROLES.HSE,
    'hse manager': ROLES.HSE,
    'safety': ROLES.HSE,

    'assistant': ROLES.OFFICE_ASSISTANT,
    'office assistant': ROLES.OFFICE_ASSISTANT,
    'admin assistant': ROLES.ADMIN_ASSISTANT,
    'administration': ROLES.ADMIN_ASSISTANT,

    'employee': ROLES.EMPLOYEE,
    'worker': ROLES.WORKER
};

/**
 * Normalize an arbitrary role string to its canonical name.
 * Falls back to the trimmed original value when the role is not recognized,
 * so unknown roles simply fail closed against permission checks.
 * @param {string} role
 * @returns {string|null}
 */
function canonicalizeRole(role) {
    if (!role || typeof role !== 'string') return null;
    const key = role.trim().toLowerCase();
    return ROLE_ALIASES[key] || role.trim();
}

/**
 * Compare two roles for equality after canonicalization.
 */
function rolesEqual(a, b) {
    const ca = canonicalizeRole(a);
    const cb = canonicalizeRole(b);
    return ca !== null && cb !== null && ca === cb;
}

// Canonical permission model. This is the single source of truth for what
// each role is allowed to do (previously duplicated in office-portal.js).
const ROLE_PERMISSIONS = {
    [ROLES.MD]: ['view_documents', 'view_policies', 'manage_personnel', 'approve_policies', 'approve_contracts', 'manage_budgets', 'view_analytics', 'approve_expenses', 'confirm_expenses'],
    [ROLES.HR]: ['view_documents', 'view_policies', 'manage_personnel', 'approve_leave_requests', 'manage_contracts', 'view_analytics'],
    [ROLES.FINANCE]: ['view_documents', 'view_policies', 'view_analytics', 'approve_expenses', 'manage_budgets'],
    [ROLES.PROJECT]: ['view_documents', 'view_policies', 'manage_projects', 'view_analytics'],
    [ROLES.REAL_ESTATE]: ['view_documents', 'view_policies', 'manage_properties', 'view_analytics'],
    [ROLES.HSE]: ['view_documents', 'view_policies', 'manage_incidents', 'view_analytics'],
    [ROLES.OFFICE_ASSISTANT]: ['view_documents', 'view_policies', 'view_analytics'],
    [ROLES.ADMIN_ASSISTANT]: ['view_documents', 'view_policies', 'view_analytics'],
    [ROLES.EMPLOYEE]: ['view_documents', 'view_policies'],
    [ROLES.WORKER]: ['view_documents', 'view_policies']
};

/**
 * Get the permission list for a role (canonicalized first).
 */
function getPermissionsForRole(role) {
    const canonical = canonicalizeRole(role);
    return ROLE_PERMISSIONS[canonical] || ['view_documents', 'view_policies'];
}

/**
 * Whether a role has a given permission.
 */
function roleHasPermission(role, permission) {
    return getPermissionsForRole(role).includes(permission);
}

module.exports = {
    ROLES,
    ROLE_ALIASES,
    ROLE_PERMISSIONS,
    canonicalizeRole,
    rolesEqual,
    getPermissionsForRole,
    roleHasPermission
};
