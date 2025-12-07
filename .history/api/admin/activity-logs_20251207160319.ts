import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Return empty activity logs array for now
  res.status(200).json([]);
}
