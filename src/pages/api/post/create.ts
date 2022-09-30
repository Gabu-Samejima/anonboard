import prisma from '../../../lib/prisma';
import reqIp from 'request-ip';
import redis from '../../../lib/redis';

import { PinboardErrors, StudentYears } from '../../../lib/enums';

import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';
import { API_TITLE_LENGTH_LIMIT, RATELIMITS } from '../../../lib/constants';
import { nanoid } from '../../../lib/nanoid';

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
    if (
      !req.headers.referer?.includes(`${process.env.NEXTAUTH_URL}`) ||
      !req.headers.referer?.includes(`https://cfboard.apap04.com/`)
    )
      return res
        .status(403)
        .end(
          'Referer check failed; Origin does not match trusted origin list.'
        );
  }

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

  const title: string = req.body.title;
  const content: string = req.body.content;
  const year: number = req.body.year;

  if (!title)
    return res.status(400).json({
      error: 'No title has been provided.',
      errorCode: PinboardErrors.MISSING_TITLE,
    });

  if (!content)
    return res.status(400).json({
      error: 'No content has been provided.',
      errorCode: PinboardErrors.MISSING_CONTENT,
    });

  if (title.length > API_TITLE_LENGTH_LIMIT)
    return res.status(400).json({
      error:
        'Use a shorter title. Your title must be at most 24 characters long.',
      errorCode: PinboardErrors.TITLE_TOO_LONG,
    });

  if (!Object.values(StudentYears).includes(year))
    return res.status(400).json({
      error: 'Please provide a valid year.',
      errorCode: PinboardErrors.INVALID_YEAR,
    });

  const anonPoster = await prisma.pB_AnonymousPoster.findFirst({
    where: {
      ipAddress: `${reqIp.getClientIp(req)}`,
    },
  });

  if (!anonPoster) {
    const newAnonPoster = await prisma.pB_AnonymousPoster.create({
      data: {
        id: `${await nanoid(10)}`,
        ipAddress: `${reqIp.getClientIp(req)}`,
      },
    });

    const post = await prisma.pB_Post.create({
      data: {
        id: `${await nanoid(10)}`,
        title: title,
        content: content,
        year: year,
        anonymousPosterId: newAnonPoster.id,
      },
    });

    return res.status(200).json(post);
  }

  const post = await prisma.pB_Post.create({
    data: {
      id: `${await nanoid(10)}`,
      title: title,
      content: content,
      year: year,
      anonymousPosterId: anonPoster.id,
    },
  });
  return res.status(200).json(post);
}
