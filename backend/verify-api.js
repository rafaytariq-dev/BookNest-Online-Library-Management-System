const http = require('http');

console.log('Testing API connection to http://localhost:3000/books ...');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/books',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY:', data);
        try {
            const books = JSON.parse(data);
            if (Array.isArray(books)) {
                console.log(`SUCCESS: Retrieved ${books.length} books.`);
            } else {
                console.log('WARNING: Response is not an array.');
            }
        } catch (e) {
            console.error('ERROR: Failed to parse JSON response.');
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
