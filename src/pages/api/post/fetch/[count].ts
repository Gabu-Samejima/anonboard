import prisma from '../../../../lib/prisma';
import reqIp from 'request-ip';

import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';
import redis from '../../../../lib/redis';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(10, '12 s'),
});

export default async function submit(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGET(req, res);
    default:
      return res.status(405).end('Only GET requests are allowed.');
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const result = await ratelimit.limit(`${reqIp.getClientIp(req)}`);
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);

  if (!result.success) {
    res.status(403).json({
      error: 'The request has been rate limited.',
      rateLimitState: result,
    });
    return;
  }

  const posts = await prisma.pB_Post.findMany({
    take: Number(req.query.count),
    where: {
      flagged: false,
      deleted: false,
    },
    select: {
      id: true,
      datePublished: true,
      lastEdited: true,
      title: true,
      content: true,
      year: true,
      anonymousPosterId: false,
    },
  });

  return res.status(200).json(posts);
}
