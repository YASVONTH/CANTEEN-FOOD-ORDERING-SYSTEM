export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { userId } = req.query;
  const RENDER_API = process.env.RENDER_API_URL;

  try {
    let data = null;

    if (userId && RENDER_API) {
      const r = await fetch(`${RENDER_API}/api/users/${userId}/token`);
      if (r.ok) data = await r.json();
    }

    return res.status(200).json({
      token:       data?.token   || data?.qrCode   || 'TKN-DEMO-001',
      user:        data?.name    || data?.username  || 'Canteen User',
      balance:     data?.balance || '₹0.00',
      status:      data?.status  || 'demo',
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({
      token: 'ERROR', user: 'Server Error',
      balance: '₹0.00', status: 'error',
      lastUpdated: new Date().toISOString(),
    });
  }
}
