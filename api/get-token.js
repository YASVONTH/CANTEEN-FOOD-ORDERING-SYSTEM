// ============================================================
//  📁 FILE LOCATION IN YOUR REPO:  api/get-token.js
//  📡 ESP32 CALLS:  https://canteenhub.vercel.app/api/get-token
//  ✅ Auto-deployed by Vercel when pushed to GitHub main branch
// ============================================================

export default async function handler(req, res) {

  // ── CORS Headers (Required for ESP32 HTTP requests) ──────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Read device / user ID from ESP32 query param ─────────
  // ESP32 calls: /api/get-token?deviceId=ESP32_CANTEEN_01
  const { deviceId, userId } = req.query;

  try {
    // ── Option A: Fetch from your Render backend ──────────
    // Replace the URL below with your actual Render API endpoint.
    // Your Render backend is already connected to your database.
    //
    // Example Render API call:
    const RENDER_API_BASE = process.env.RENDER_API_URL || 'https://your-canteenhub-backend.onrender.com';

    let tokenData = null;

    if (userId) {
      // Fetch real user token from your Render backend
      const renderResponse = await fetch(`${RENDER_API_BASE}/api/users/${userId}/token`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_SECRET_KEY || ''}`,
          'Content-Type': 'application/json',
        },
      });

      if (renderResponse.ok) {
        const data = await renderResponse.json();

        // ── Map your Render API response to ESP32 format ──
        // Adjust these field names to match your actual API response
        tokenData = {
          token:   data.token   || data.qrCode    || data.accessCode  || 'N/A',
          user:    data.name    || data.username   || data.studentName || 'Unknown',
          balance: data.balance || data.walletBalance || '₹0.00',
          status:  data.status  || data.isActive ? 'active' : 'inactive',
          userId:  userId,
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    // ── Option B: Fallback / Demo data (for testing) ──────
    // Remove this block once your Render backend is connected
    if (!tokenData) {
      tokenData = {
        token:   'TKN-DEMO-001',
        user:    deviceId ? `Device: ${deviceId}` : 'Canteen User',
        balance: '₹0.00',
        status:  'demo',
        userId:  userId || 'none',
        lastUpdated: new Date().toISOString(),
      };
    }

    // ── Send response to ESP32 ────────────────────────────
    return res.status(200).json(tokenData);

  } catch (error) {
    console.error('ESP32 API Error:', error);

    // Return error in a format ESP32 can display
    return res.status(500).json({
      token:   'API-ERROR',
      user:    'Server Error',
      balance: '₹0.00',
      status:  'error',
      lastUpdated: new Date().toISOString(),
    });
  }
}
