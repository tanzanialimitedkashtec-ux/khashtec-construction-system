// Shared helpers for normalizing results from the database wrapper.
//
// The project uses a custom Database wrapper (database/config/database.js) whose
// `execute()`/`query()` methods already destructure mysql2's `[rows, fields]`
// tuple and return `rows` directly:
//   - SELECT  -> an Array of row objects
//   - INSERT/UPDATE/DELETE -> a ResultSetHeader object (insertId, affectedRows)
//
// Route code historically re-implemented this unwrapping inconsistently
// (`parseDbResult`, `getRows`, `Array.isArray(...) ? ... : ...`). These helpers
// centralize it. They also tolerate a raw `[rows, fields]` tuple in case a
// caller uses the underlying pool directly.

function isResultTuple(result) {
    return Array.isArray(result) && result.length === 2 &&
        Array.isArray(result[0]) &&
        result[1] && !Array.isArray(result[1]) && typeof result[1] === 'object';
}

/**
 * Normalize a DB call result to an array of row objects.
 * @param {*} result
 * @returns {Array<object>}
 */
function getRows(result) {
    if (!result) return [];
    if (isResultTuple(result)) return result[0];
    if (Array.isArray(result)) return result;
    return [];
}

/**
 * Return the first row of a DB result, or null when there are none.
 * @param {*} result
 * @returns {object|null}
 */
function getRow(result) {
    const rows = getRows(result);
    return rows.length > 0 ? rows[0] : null;
}

function writeHeader(result) {
    if (!result) return null;
    if (Array.isArray(result)) return result[0] || null;
    return result;
}

/**
 * Extract insertId from an INSERT result.
 * @param {*} result
 * @returns {number|null}
 */
function getInsertId(result) {
    const header = writeHeader(result);
    if (header && typeof header.insertId !== 'undefined') return header.insertId;
    return null;
}

/**
 * Extract affectedRows from a write result.
 * @param {*} result
 * @returns {number}
 */
function getAffectedRows(result) {
    const header = writeHeader(result);
    if (header && typeof header.affectedRows !== 'undefined') return header.affectedRows;
    return 0;
}

module.exports = { getRows, getRow, getInsertId, getAffectedRows };
