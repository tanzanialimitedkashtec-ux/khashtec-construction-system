// KASHTEC Construction Management System - Database Layer
// Secure database replacement for localStorage

const fs = require('fs');
const path = require('path');

class KashtecDatabase {
    constructor() {
        this.dataDir = path.join(__dirname, 'data');
        this.ensureDataDirectory();
        this.initializeCollections();
    }

    // Ensure data directory exists
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    // Initialize all collections
    initializeCollections() {
        this.collections = {
            employees: 'kashtec_employees.json',
            workers: 'kashtec_worker_accounts.json',
            office_portal_users: 'kashtec_office_portal_users.json',
            documents: 'kashtec_documents.json',
            policies: 'kashtec_policies.json',
            contracts: 'kashtec_contracts.json',
            meetings: 'kashtec_meetings.json',
            notifications: 'kashtec_notifications.json',
            users: 'kashtec_users.json',
            audit_log: 'kashtec_audit_log.json'
        };
    }

    // Get file path for a collection
    getCollectionPath(collectionName) {
        return path.join(this.dataDir, this.collections[collectionName] || `${collectionName}.json`);
    }

    // Read data from collection
    read(collectionName) {
        try {
            const filePath = this.getCollectionPath(collectionName);
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error(`Error reading collection ${collectionName}:`, error.message);
            return [];
        }
    }

    // Write data to collection
    write(collectionName, data) {
        try {
            const filePath = this.getCollectionPath(collectionName);
            const jsonData = JSON.stringify(data, null, 2);
            fs.writeFileSync(filePath, jsonData, 'utf8');
            
            // Log the write operation
            this.logAudit('WRITE', collectionName, `Wrote ${data.length} items to ${collectionName}`);
            return true;
        } catch (error) {
            console.error(`Error writing collection ${collectionName}:`, error.message);
            return false;
        }
    }

    // Add item to collection
    add(collectionName, item) {
        const data = this.read(collectionName);
        data.push(item);
        return this.write(collectionName, data);
    }

    // Update item in collection
    update(collectionName, itemId, updates) {
        const data = this.read(collectionName);
        const index = data.findIndex(item => item.id === itemId);
        
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            return this.write(collectionName, data);
        }
        return false;
    }

    // Delete item from collection
    delete(collectionName, itemId) {
        const data = this.read(collectionName);
        const filteredData = data.filter(item => item.id !== itemId);
        return this.write(collectionName, filteredData);
    }

    // Find item in collection
    find(collectionName, predicate) {
        const data = this.read(collectionName);
        return data.find(predicate);
    }

    // Filter items in collection
    filter(collectionName, predicate) {
        const data = this.read(collectionName);
        return data.filter(predicate);
    }

    // Get all items from collection
    all(collectionName) {
        return this.read(collectionName);
    }

    // Clear collection
    clear(collectionName) {
        return this.write(collectionName, []);
    }

    // Get collection statistics
    stats(collectionName) {
        const data = this.read(collectionName);
        return {
            count: data.length,
            lastModified: this.getLastModified(collectionName),
            size: JSON.stringify(data).length
        };
    }

    // Get last modified time
    getLastModified(collectionName) {
        try {
            const filePath = this.getCollectionPath(collectionName);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                return stats.mtime;
            }
        } catch (error) {
            console.error(`Error getting stats for ${collectionName}:`, error.message);
        }
        return null;
    }

    // Backup collection
    backup(collectionName) {
        try {
            const filePath = this.getCollectionPath(collectionName);
            const backupPath = path.join(this.dataDir, 'backups');
            
            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFilePath = path.join(backupPath, `${this.collections[collectionName]}-${timestamp}.json`);
            
            if (fs.existsSync(filePath)) {
                fs.copyFileSync(filePath, backupFilePath);
                this.logAudit('BACKUP', collectionName, `Created backup of ${collectionName}`);
                return true;
            }
        } catch (error) {
            console.error(`Error backing up collection ${collectionName}:`, error.message);
        }
        return false;
    }

    // Restore collection from backup
    restore(collectionName, backupTimestamp) {
        try {
            const backupPath = path.join(this.dataDir, 'backups');
            const backupFileName = `${this.collections[collectionName]}-${backupTimestamp}.json`;
            const backupFilePath = path.join(backupPath, backupFileName);
            const targetFilePath = this.getCollectionPath(collectionName);
            
            if (fs.existsSync(backupFilePath)) {
                fs.copyFileSync(backupFilePath, targetFilePath);
                this.logAudit('RESTORE', collectionName, `Restored ${collectionName} from backup ${backupTimestamp}`);
                return true;
            }
        } catch (error) {
            console.error(`Error restoring collection ${collectionName}:`, error.message);
        }
        return false;
    }

    // Log audit trail
    logAudit(action, collection, details) {
        const auditLog = this.read('audit_log');
        const auditEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: action,
            collection: collection,
            details: details,
            user: 'system', // This would be replaced with actual user in production
            ip: 'localhost' // This would be replaced with actual IP in production
        };
        
        auditLog.push(auditEntry);
        
        // Keep only last 1000 audit entries
        if (auditLog.length > 1000) {
            auditLog.splice(0, auditLog.length - 1000);
        }
        
        this.write('audit_log', auditLog);
    }

    // Get audit log
    getAuditLog(limit = 100) {
        const auditLog = this.read('audit_log');
        return auditLog.slice(-limit);
    }

    // Validate data integrity
    validate(collectionName) {
        try {
            const data = this.read(collectionName);
            const validation = {
                isValid: true,
                errors: [],
                warnings: []
            };
            
            // Check for required fields based on collection type
            if (collectionName === 'employees' || collectionName === 'workers') {
                data.forEach((item, index) => {
                    if (!item.id) {
                        validation.errors.push(`Item at index ${index} missing required field: id`);
                        validation.isValid = false;
                    }
                    if (!item.name) {
                        validation.warnings.push(`Item at index ${index} missing field: name`);
                    }
                    if (!item.email) {
                        validation.warnings.push(`Item at index ${index} missing field: email`);
                    }
                });
            }
            
            if (collectionName === 'documents' || collectionName === 'policies' || collectionName === 'contracts') {
                data.forEach((item, index) => {
                    if (!item.id) {
                        validation.errors.push(`Item at index ${index} missing required field: id`);
                        validation.isValid = false;
                    }
                    if (!item.title) {
                        validation.errors.push(`Item at index ${index} missing required field: title`);
                        validation.isValid = false;
                    }
                });
            }
            
            return validation;
        } catch (error) {
            return {
                isValid: false,
                errors: [`Validation error: ${error.message}`],
                warnings: []
            };
        }
    }

    // Export collection to CSV
    exportToCSV(collectionName) {
        try {
            const data = this.read(collectionName);
            if (data.length === 0) {
                return null;
            }
            
            // Get headers from first item
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(item => headers.map(header => `"${item[header] || ''}"`).join(','))
            ].join('\n');
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const csvPath = path.join(this.dataDir, 'exports', `${collectionName}-${timestamp}.csv`);
            
            // Ensure exports directory exists
            const exportsDir = path.dirname(csvPath);
            if (!fs.existsSync(exportsDir)) {
                fs.mkdirSync(exportsDir, { recursive: true });
            }
            
            fs.writeFileSync(csvPath, csvContent, 'utf8');
            this.logAudit('EXPORT', collectionName, `Exported ${collectionName} to CSV`);
            return csvPath;
        } catch (error) {
            console.error(`Error exporting ${collectionName} to CSV:`, error.message);
            return null;
        }
    }

    // Search across collections
    search(query, collections = null) {
        const results = [];
        const searchCollections = collections || Object.keys(this.collections);
        
        searchCollections.forEach(collectionName => {
            const data = this.read(collectionName);
            const matches = data.filter(item => {
                const itemString = JSON.stringify(item).toLowerCase();
                return itemString.includes(query.toLowerCase());
            });
            
            results.push({
                collection: collectionName,
                matches: matches,
                count: matches.length
            });
        });
        
        return results;
    }

    // Get database statistics
    getDatabaseStats() {
        const stats = {};
        Object.keys(this.collections).forEach(collectionName => {
            stats[collectionName] = this.stats(collectionName);
        });
        
        return {
            collections: stats,
            totalCollections: Object.keys(this.collections).length,
            dataDirectory: this.dataDir,
            lastBackup: this.getLastBackupTime()
        };
    }

    // Get last backup time
    getLastBackupTime() {
        try {
            const backupPath = path.join(this.dataDir, 'backups');
            if (fs.existsSync(backupPath)) {
                const backups = fs.readdirSync(backupPath);
                if (backups.length > 0) {
                    const latestBackup = backups.sort().pop();
                    const backupStats = fs.statSync(path.join(backupPath, latestBackup));
                    return backupStats.mtime;
                }
            }
        } catch (error) {
            console.error('Error getting last backup time:', error.message);
        }
        return null;
    }

    // Compact database (remove old audit logs, etc.)
    compact() {
        try {
            // Keep only last 30 days of audit logs
            const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
            const auditLog = this.read('audit_log');
            const recentAuditLog = auditLog.filter(entry => 
                new Date(entry.timestamp) > thirtyDaysAgo
            );
            
            this.write('audit_log', recentAuditLog);
            this.logAudit('COMPACT', 'audit_log', `Compacted audit log, removed ${auditLog.length - recentAuditLog.length} old entries`);
            return true;
        } catch (error) {
            console.error('Error compacting database:', error.message);
            return false;
        }
    }
}

// Create singleton instance
const kashtecDB = new KashtecDatabase();

// Export for use in browser environment
if (typeof window !== 'undefined') {
    // Browser-compatible version using IndexedDB
    class BrowserKashtecDatabase {
        constructor() {
            this.dbName = 'KashetecConstructionDB';
            this.dbVersion = 1;
            this.db = null;
        }

        async init() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.dbVersion);
                
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    this.db = request.result;
                    resolve(this.db);
                };
                
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    // Create object stores
                    if (!db.objectStoreNames.contains('employees')) {
                        db.createObjectStore('employees', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('workers')) {
                        db.createObjectStore('workers', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('office_portal_users')) {
                        db.createObjectStore('office_portal_users', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('documents')) {
                        db.createObjectStore('documents', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('policies')) {
                        db.createObjectStore('policies', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('contracts')) {
                        db.createObjectStore('contracts', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('meetings')) {
                        db.createObjectStore('meetings', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('notifications')) {
                        db.createObjectStore('notifications', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('users')) {
                        db.createObjectStore('users', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('audit_log')) {
                        db.createObjectStore('audit_log', { keyPath: 'id' });
                    }
                };
            });
        }

        async read(storeName) {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        }

        async write(storeName, data) {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Clear existing data
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => {
                    // Add new data
                    data.forEach(item => {
                        store.add(item);
                    });
                    
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = () => reject(transaction.error);
                };
                clearRequest.onerror = () => reject(clearRequest.error);
            });
        }

        async add(storeName, item) {
            const data = await this.read(storeName);
            data.push(item);
            return this.write(storeName, data);
        }

        async find(storeName, predicate) {
            const data = await this.read(storeName);
            return data.find(predicate);
        }

        async filter(storeName, predicate) {
            const data = await this.read(storeName);
            return data.filter(predicate);
        }

        async all(storeName) {
            return this.read(storeName);
        }

        async clear(storeName) {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        }
    }

    // Create browser database instance
    window.kashtecDB = new BrowserKashtecDatabase();
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = kashtecDB;
}
