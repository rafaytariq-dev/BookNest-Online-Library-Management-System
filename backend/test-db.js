const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Read .env from src/.env (where we found it)
const envPath = path.join(__dirname, 'src', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('ENV Content Length:', envContent.length);
// console.log('ENV Content Preview:', envContent.substring(0, 100)); // Be careful not to expose implementation secrets provided by the user if possible, but here we need to debug.
// Try simpler match
const match = envContent.match(/DATABASE_URL\s*=\s*['"]?([^'"\r\n]+)['"]?/);
if (!match) {
    console.error('No DATABASE_URL found. Dumping content safely:');
    console.log(envContent.replace(/postgres:\/\/[^@]+@/, 'postgres://***@'));
    process.exit(1);
}

let connectionString = match[1].trim();
// Strip quotes if any
connectionString = connectionString.replace(/['"]+/g, '');

console.log('Original URL:', connectionString);

// Test 1: Raw URL
// runTest(connectionString, 'Raw URL');

// Test 2: Sanitized URL
const sanitized = connectionString
    .replace(/&channel_binding=require/g, '')
    .replace(/\?channel_binding=require&?/g, '?')
    .replace(/&sslmode=require/g, '')
    .replace(/\?sslmode=require&?/g, '?');

console.log('Sanitized URL:', sanitized);

runTest(sanitized, 'Sanitized URL');

async function runTest(url, label) {
    console.log(`\nTesting: ${label}`);
    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Time:', res.rows[0]);
    } catch (err) {
        console.error('FAILURE:', err.message);
        // console.error(err);
    } finally {
        await client.end();
    }
}
