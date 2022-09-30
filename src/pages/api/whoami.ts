import reqIp from 'request-ip';
import redis from '../../lib/redis';

import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';

import { PinboardErrors } from '../../lib/enums';
import { RATELIMITS } from '../../lib/constants';

import { fetchOrCreateUser } from '../../lib/api';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(RATELIMITS.POST_REQS, `1 h`),
});

export default async function submit(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (process.env.NODE_ENV == 'production') {
    if (!req.headers.referer?.includes(`${process.env.NEXTAUTH_URL}`))
      return res
        .status(403)
        .end(
          'Referer check failed; Origin does not match trusted origin list.'
        );
  }

  switch (method) {
    case 'GET':
      return handleGET(req, res);
    default:
      return res.status(405).end('Only GET requests are allowed.');
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV == 'production') {
    const result = await ratelimit.limit(`${reqIp.getClientIp(req)}`);
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.success) {
      res.status(403).json({
        error: 'The request has been rate limited.',
        errorCode: PinboardErrors.RATELIMITED,
        rateLimitState: result,
      });
      return;
    }
  }

  const user = await fetchOrCreateUser(req);

  return res.status(200).json(user);
}
