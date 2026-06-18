import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  console.log('Rate limit check from IP:', ip);
  console.log('Headers:', req.headers);
  
  res.status(200).json({
    success: true,
    ip: ip,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
}