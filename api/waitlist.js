// Waitlist API — stores emails in Vercel KV if available, otherwise logs
// Vercel KV will be set up when we get the project linked

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // GET: return count (no emails exposed)
    if (req.method === 'GET') {
        try {
            if (process.env.KV_REST_API_URL) {
                const { createClient } = require('@vercel/kv');
                const kv = createClient({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
                const count = await kv.scard('waitlist:emails');
                return res.status(200).json({ count: count || 0 });
            }
            return res.status(200).json({ count: 'unknown (KV not configured)' });
        } catch (e) {
            return res.status(200).json({ count: 'unknown' });
        }
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email, timestamp } = req.body;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required' });
        }

        const ts = timestamp || new Date().toISOString();
        console.log(`[WAITLIST] ${email} at ${ts}`);

        // Try Vercel KV
        if (process.env.KV_REST_API_URL) {
            try {
                const { createClient } = require('@vercel/kv');
                const kv = createClient({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
                await kv.sadd('waitlist:emails', email);
                await kv.hset(`waitlist:detail:${email}`, { email, timestamp: ts, source: req.headers.referer || 'direct' });
            } catch (kvErr) {
                console.error('[KV ERROR]', kvErr.message);
            }
        }

        return res.status(200).json({ success: true, message: 'You\'re on the list!' });
    } catch (err) {
        console.error('[WAITLIST ERROR]', err);
        return res.status(500).json({ error: 'Internal error' });
    }
};
