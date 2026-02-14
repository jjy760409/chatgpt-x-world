const https = require('https');

const BOT_TOKEN = "8545903698:AAEhEvAkVnYSLc8JH084zUc0f-klX4cf9YE";
const CHAT_ID = "8385241395";
const message = "🚨 [Test] ANW Alert System Check";

const payload = JSON.stringify({
    chat_id: CHAT_ID,
    text: message
});

const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(payload);
req.end();
