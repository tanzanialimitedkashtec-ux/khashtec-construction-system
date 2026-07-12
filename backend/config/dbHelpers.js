// Shared helpers for normalizing results from the database wrapper.
//
// The project uses a custom Database wrapper (database/config/database.js) whose
// `execute()`/`query()` methods already return the rows array (not the mysql2
// `[rows, fields]` tuple). However, route code historically re-implemented result
// unwrapping in many inconsistent ways (`parseDbResult`, `getRows`,
// `Array.isArray(...) ? ... : ...`). These helpers centralize that logic.

/**
 * Normalize a DB call result to an array of row objects.
 * Handles both the plain rows array and the raw `[rows, fields]` tuple, so it is
 * safe regardless of which access pattern produced the result.
 * @param {*} result
 * @returns {Array<object>}
 */
function getRows(result) {
    if (!result) return [];
    // Plain array of rows.
    if (Array.isArray(result)) {
        // Raw mysql2 tuple: [rows, fields] where rows is itself an array.
        if (result.length === 2 && Array.isArray(result[0]) && !Array.isArray(result[1])) {
            return result[0];
        }
        return result;
    }
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

/**
 * Extract insertId from an INSERT result (OkPacket), handling the tuple form.
 * @param {*} result
 * @returns {number|null}
 */
function getInsertId(result) {
    if (!result) return null;
    if (Array.isArray(result)) {
        const packet = result[0];
        if (packet && typeof packet.insertId !== 'undefined') return packet.insertId;
        return null;
    }
    if (typeof result.insertId !== 'undefined') return result.insertId;
    return null;
}

/**
 * Extract affectedRows from a write result (OkPacket), handling the tuple form.
 * @param {*} result
 * @returns {number}
 */
function getAffectedRows(result) {
    if (!result) return 0;
    if (Array.isArray(result)) {
        const packet = result[0];
        if (packet && typeof packet.affectedRows !== 'undefined') return packet.affectedRows;
        return 0;
    }
    if (typeof result.affectedRows !== 'undefined') return result.affectedRows;
    return 0;
}

module.exports = { getRows, getRow, getInsertId, getAffectedRows };
