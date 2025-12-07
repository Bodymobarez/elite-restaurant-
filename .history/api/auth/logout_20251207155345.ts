import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In serverless environment, there's no session to clear
  // Just return success
  res.status(200).json({ message: 'Logged out successfully' });
}
