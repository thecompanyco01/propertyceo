const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { email, timestamp } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required' });
        }
        
        // Log to console (visible in Vercel logs)
        console.log(`[WAITLIST] ${email} at ${timestamp || new Date().toISOString()}`);
        
        return res.status(200).json({ success: true, message: 'Added to waitlist' });
    } catch (err) {
        console.error('[WAITLIST ERROR]', err);
        return res.status(500).json({ error: 'Internal error' });
    }
};
