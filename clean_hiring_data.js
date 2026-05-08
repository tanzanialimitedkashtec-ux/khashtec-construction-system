// Script to clean corrupted HTML data from senior_hiring_approval table
const mysql = require('mysql2/promise');

async function cleanHiringData() {
    let connection;

    try {
        // Connect to database
        connection = await mysql.createConnection({
            host: 'centerbeam.proxy.rlwy.net',
            user: 'root',
            password: 'LzDEYGJIiYfVRSTnBrufpsSwRIDnZRvz',
            database: 'railway',
            port: 11044
        });

        console.log('Connected to database');

        // Get all records with HTML in experience field
        const [rows] = await connection.execute(`
            SELECT id, experience, hr_recommendation
            FROM senior_hiring_approval
            WHERE experience LIKE '<%' OR hr_recommendation LIKE '<%'
        `);

        console.log(`Found ${rows.length} records with HTML content`);

        for (const row of rows) {
            console.log(`Cleaning record ID: ${row.id}`);

            // Clean experience field - extract plain text or set to default
            let cleanExperience = 'Experience details not properly recorded';
            if (row.experience && !row.experience.startsWith('<')) {
                cleanExperience = row.experience;
            }

            // Clean hr_recommendation field
            let cleanRecommendation = 'HR recommendation not properly recorded';
            if (row.hr_recommendation && !row.hr_recommendation.startsWith('<')) {
                cleanRecommendation = row.hr_recommendation;
            }

            // Update the record
            await connection.execute(`
                UPDATE senior_hiring_approval
                SET experience = ?, hr_recommendation = ?
                WHERE id = ?
            `, [cleanExperience, cleanRecommendation, row.id]);

            console.log(`Updated record ${row.id}`);
        }

        console.log('Data cleaning completed');

    } catch (error) {
        console.error('Error cleaning data:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

cleanHiringData();