// Reusable server-side authorization middleware.
//
// `authenticateToken` (see backend/src/middleware/auth.js) is expected to have
// run first and populated `req.user` (with at least `req.user.role`). These
// middlewares enforce role / permission requirements and return 403 otherwise.

const { canonicalizeRole, rolesEqual, roleHasPermission } = require('../config/roles');

/**
 * Require that the authenticated user's role matches one of the allowed roles.
 * Role strings are canonicalized on both sides so "MD" == "Managing Director".
 *
 * Usage: router.put('/expense/:id/confirm', requireRole('Managing Director'), handler)
 * @param {...string} roles
 */
function requireRole(...roles) {
    // Allow passing an array as the single argument too.
    const allowed = roles.length === 1 && Array.isArray(roles[0]) ? roles[0] : roles;
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const userRole = req.user.role;
        const permitted = allowed.some(r => rolesEqual(r, userRole));
        if (!permitted) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                required: allowed.map(canonicalizeRole),
                role: canonicalizeRole(userRole)
            });
        }
        next();
    };
}

/**
 * Require that the authenticated user's role grants a specific permission,
 * using the canonical permission model in config/roles.js.
 * @param {string} permission
 */
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!roleHasPermission(req.user.role, permission)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                requiredPermission: permission,
                role: canonicalizeRole(req.user.role)
            });
        }
        next();
    };
}

module.exports = { requireRole, requirePermission };
