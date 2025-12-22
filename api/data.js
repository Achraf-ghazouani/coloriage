// Serverless function for Vercel
// Store data in memory (Note: Vercel serverless functions are stateless)
// For production, use a database like MongoDB, Supabase, or Vercel KV

// In-memory storage (will reset on cold starts)
let dashboardData = [];

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // POST - Receive data from Unity
    if (req.method === 'POST') {
        const { name, mostUsedColor, designTime } = req.body;
        
        if (!name || !mostUsedColor || designTime === undefined) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, mostUsedColor, designTime' 
            });
        }

        const entry = {
            id: Date.now(),
            name,
            mostUsedColor,
            designTime,
            timestamp: new Date().toISOString()
        };

        dashboardData.push(entry);
        
        // Keep only the last 100 entries
        if (dashboardData.length > 100) {
            dashboardData = dashboardData.slice(-100);
        }

        console.log('New data received:', entry);
        return res.status(200).json({ 
            success: true, 
            message: 'Data received successfully', 
            data: entry 
        });
    }

    // GET - Return all data
    if (req.method === 'GET') {
        return res.status(200).json(dashboardData);
    }

    // DELETE - Clear all data
    if (req.method === 'DELETE') {
        dashboardData = [];
        return res.status(200).json({ 
            success: true, 
            message: 'All data cleared' 
        });
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
}
