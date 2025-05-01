

import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha1')
    .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest('hex');

  res.status(200).json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
