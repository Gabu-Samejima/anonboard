import reqIp from 'request-ip';
import redis from '../../../lib/redis';
import prisma from '../../../lib/prisma';

import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';

import { PinboardErrors } from '../../../lib/enums';
import { RATELIMITS } from '../../../lib/constants';

import { fetchOrCreateUser } from '../../../lib/api';
import { nanoid } from '../../../lib/nanoid';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(RATELIMITS.POST_REQS, `4 s`),
});

export default async function submit(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return handlePOST(req, res);
    default:
      return res.status(405).end('Only POST requests are allowed.');
  }
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
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

  const content: string = req.body.content;
  const postId: string = req.body.postId;
  const user = await fetchOrCreateUser(req);

  if (!postId)
    return res.status(400).json({
      error: 'Please provide a post ID.',
      errorCode: PinboardErrors.POST_NOT_FOUND,
    });

  if (!content)
    return res.status(400).json({
      error: 'Please provide content.',
      errorCode: PinboardErrors.MISSING_CONTENT,
    });

  const replyToPost = await prisma.pB_Post.findUnique({
    where: { id: postId },
  });

  if (!replyToPost)
    return res.status(404).json({
      error: "This post doesn't exist.",
      errorCode: PinboardErrors.POST_NOT_FOUND,
    });

  const comment = await prisma.pB_Comment.create({
    data: {
      id: await nanoid(15),
      content: content,
      pB_AnonymousPosterId: user.id,
      pB_PostId: replyToPost?.id,
    },
  });

  return res.status(200).json(comment);
}
