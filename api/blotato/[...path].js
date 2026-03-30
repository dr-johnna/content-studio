export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, blotato-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = req.headers['blotato-api-key'];
  const rawUrl = req.url || '';
  const qIndex = rawUrl.indexOf('?');
  const pathname = qIndex >= 0 ? rawUrl.slice(0, qIndex) : rawUrl;
  const qs = qIndex >= 0 ? rawUrl.slice(qIndex) : '';
  const upstreamPath = pathname.replace(/^\/api\/blotato/, '') || '/';
  const blotatoUrl = 'https://backend.blotato.com' + upstreamPath + qs;

  try {
    const fetchOptions = {
      method: req.method,
      headers: { 'Content-Type': 'application/json', 'blotato-api-key': apiKey },
      signal: AbortSignal.timeout(10000)
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    const upstream = await fetch(blotatoUrl, fetchOptions);
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message, url: blotatoUrl, key: apiKey ? 'present' : 'missing' });
  }
}
