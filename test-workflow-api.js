const http = require('http');

const payload = JSON.stringify({
  userMessage: "Analyze my profile and generate a script",
  profileId: "test-profile-123",
  forcedClassification: "general"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v2/workflow/run',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'x-e2e-bypass': 'aios-e2e-bypass-123'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('BODY:');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(payload);
req.end();
