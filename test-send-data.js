// Test script to send sample data to the dashboard
// Run with: node test-send-data.js

const http = require('http');

const testData = {
    name: "TestUser" + Math.floor(Math.random() * 100),
    mostUsedColor: ["#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#F5FF33"][Math.floor(Math.random() * 5)],
    designTime: Math.floor(Math.random() * 300) + 30 // 30-330 seconds
};

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/data',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        console.log('\nTest data sent successfully!');
        console.log('Check the dashboard at: http://localhost:3000');
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
    console.log('\nMake sure the server is running with: npm start');
});

req.write(JSON.stringify(testData));
req.end();

console.log('Sending test data:', testData);
