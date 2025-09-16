import http from 'http';
import { Buffer } from 'buffer';

(async function () {
    try {
        const res = await new Promise((resolve, reject) => {
            http.get('http://localhost:8080/', (r) => resolve(r)).on('error', reject);
        });
        const headers = res.headers;
        console.log('Content-Type:', headers['content-type']);
        const chunks = [];
        for await (const chunk of res) chunks.push(chunk);
        const buf = Buffer.concat(chunks);
        console.log('Length:', buf.length);
        console.log('BOM (hex):', buf.slice(0, 3).toString('hex'));
        console.log('Sample (first 500 chars):');
        console.log(buf.slice(0, 500).toString('utf8'));
    } catch (e) {
        console.error('fetch error', e);
        process.exit(1);
    }
})();
