// Database Adapter for Browser Environment
// Provides localStorage-like interface using IndexedDB for security

class DatabaseAdapter {
    constructor() {
        this.dbName = 'KashetecConstructionDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('Database error:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('Database initialized successfully');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                const stores = [
                    'kashtec_employees',
                    'kashtec_worker_accounts', 
                    'kashtec_office_portal_users',
                    'kashtec_documents',
                    'kashtec_policies',
                    'kashtec_contracts',
                    'kashtec_meetings',
                    'kashtec_policy_revisions',
                    'kashtec_policy_rejections',
                    'kashtec_employment_actions',
                    'kashtec_assignments',
                    'kashtec_attendance',
                    'kashtec_notifications',
                    'kashtec_users'
                ];
                
                stores.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    }
                });
            };
        });
    }

    async getItem(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([key], 'readonly');
            const store = transaction.objectStore(key);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const data = request.result || [];
                // Return JSON string for compatibility with localStorage
                resolve(JSON.stringify(data));
            };
            
            request.onerror = () => {
                console.error(`Error getting ${key}:`, request.error);
                reject(request.error);
            };
        });
    }

    async setItem(key, value) {
        await this.init();
        return new Promise((resolve, reject) => {
            try {
                const data = JSON.parse(value);
                const transaction = this.db.transaction([key], 'readwrite');
                const store = transaction.objectStore(key);
                
                // Clear existing data
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => {
                    // Add new data
                    if (Array.isArray(data)) {
                        data.forEach(item => {
                            store.add(item);
                        });
                    } else {
                        // Handle single item case
                        store.add({ value: data, timestamp: Date.now() });
                    }
                    
                    transaction.oncomplete = () => {
                        console.log(`Successfully saved ${key} to database`);
                        resolve(true);
                    };
                    
                    transaction.onerror = () => {
                        console.error(`Error saving ${key}:`, transaction.error);
                        reject(transaction.error);
                    };
                };
                
                clearRequest.onerror = () => {
                    console.error(`Error clearing ${key}:`, clearRequest.error);
                    reject(clearRequest.error);
                };
            } catch (error) {
                console.error(`Error parsing data for ${key}:`, error);
                // Store as raw value if parsing fails
                const transaction = this.db.transaction([key], 'readwrite');
                const store = transaction.objectStore(key);
                const request = store.add({ value: value, timestamp: Date.now() });
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            }
        });
    }

    async removeItem(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([key], 'readwrite');
            const store = transaction.objectStore(key);
            const request = store.clear();
            
            request.onsuccess = () => {
                console.log(`Successfully removed ${key} from database`);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error(`Error removing ${key}:`, request.error);
                reject(request.error);
            };
        });
    }

    async getAll(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([key], 'readonly');
            const store = transaction.objectStore(key);
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = () => {
                console.error(`Error getting all ${key}:`, request.error);
                reject(request.error);
            };
        });
    }

    async addToArray(key, item) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([key], 'readwrite');
            const store = transaction.objectStore(key);
            const request = store.add(item);
            
            request.onsuccess = () => {
                console.log(`Successfully added item to ${key}`);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error(`Error adding item to ${key}:`, request.error);
                reject(request.error);
            };
        });
    }

    async updateInArray(key, itemId, updates) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([key], 'readwrite');
            const store = transaction.objectStore(key);
            
            // First get the item
            const getRequest = store.get(itemId);
            getRequest.onsuccess = () => {
                const existingItem = getRequest.result;
                if (existingItem) {
                    const updatedItem = { ...existingItem, ...updates };
                    const updateRequest = store.put(updatedItem);
                    
                    updateRequest.onsuccess = () => {
                        console.log(`Successfully updated item in ${key}`);
                        resolve(true);
                    };
                    
                    updateRequest.onerror = () => {
                        console.error(`Error updating item in ${key}:`, updateRequest.error);
                        reject(updateRequest.error);
                    };
                } else {
                    reject(new Error('Item not found'));
                }
            };
            
            getRequest.onerror = () => {
                console.error(`Error getting item from ${key}:`, getRequest.error);
                reject(getRequest.error);
            };
        });
    }

    async removeFromArray(key, itemId) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([key], 'readwrite');
            const store = transaction.objectStore(key);
            const request = store.delete(itemId);
            
            request.onsuccess = () => {
                console.log(`Successfully removed item from ${key}`);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error(`Error removing item from ${key}:`, request.error);
                reject(request.error);
            };
        });
    }

    // Get database statistics
    async getStats() {
        await this.init();
        const stores = ['kashtec_employees', 'kashtec_worker_accounts', 'kashtec_office_portal_users'];
        const stats = {};
        
        for (const storeName of stores) {
            try {
                const data = await this.getAll(storeName);
                stats[storeName.replace('kashtec_', '')] = {
                    count: data.length,
                    lastModified: new Date().toISOString()
                };
            } catch (error) {
                console.error(`Error getting stats for ${storeName}:`, error);
                stats[storeName.replace('kashtec_', '')] = { count: 0, error: error.message };
            }
        }
        
        return stats;
    }

    // Clear all data (for reset)
    async clearAll() {
        await this.init();
        const storeNames = this.db.objectStoreNames;
        
        for (const storeName of storeNames) {
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
        
        console.log('All database data cleared');
    }
}

// Create global database adapter instance
window.dbAdapter = new DatabaseAdapter();

// Initialize database when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.dbAdapter.init();
        console.log('Secure database system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        // Fallback to localStorage if IndexedDB fails
        console.log('Falling back to localStorage');
    }
});

// Replace localStorage functions globally
window.secureStorage = {
    getItem: (key) => window.dbAdapter.getItem(key),
    setItem: (key, value) => window.dbAdapter.setItem(key, value),
    removeItem: (key) => window.dbAdapter.removeItem(key),
    getAll: (key) => window.dbAdapter.getAll(key),
    addToArray: (key, item) => window.dbAdapter.addToArray(key, item),
    updateInArray: (key, itemId, updates) => window.dbAdapter.updateInArray(key, itemId, updates),
    removeFromArray: (key, itemId) => window.dbAdapter.removeFromArray(key, itemId)
};

// Auto-migration function to move existing localStorage data to IndexedDB
window.migrateFromLocalStorage = async () => {
    const keysToMigrate = [
        'kashtec_employees',
        'kashtec_worker_accounts',
        'kashtec_office_portal_users',
        'kashtec_documents',
        'kashtec_policies',
        'kashtec_contracts',
        'kashtec_meetings'
    ];
    
    for (const key of keysToMigrate) {
        const localStorageData = localStorage.getItem(key);
        if (localStorageData) {
            try {
                const data = JSON.parse(localStorageData);
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`Migrating ${key} with ${data.length} items`);
                    await window.dbAdapter.setItem(key, localStorageData);
                    localStorage.removeItem(key); // Remove from localStorage after migration
                }
            } catch (error) {
                console.error(`Error migrating ${key}:`, error);
            }
        }
    }
    
    console.log('Migration from localStorage completed');
};
