const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
if (!API_KEY) {
    console.log("No API Key");
    process.exit(1);
}

// 1x1 transparent base64 image
const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const prompt = "What is in this image?";
const parts = [
    { text: prompt },
    {
        inlineData: {
            mimeType: "image/png",
            data: imageBase64
        }
    }
];

const payload = JSON.stringify({
    contents: [{ parts }],
});

const req = https.request(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    },
    (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log(res.statusCode, data));
    }
);

req.on('error', console.error);
req.write(payload);
req.end();
