/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import reqIp from 'request-ip';
import prisma from '../../../lib/prisma';
import redis from '../../../lib/redis';

import { PinboardErrors } from '../../../lib/enums';

import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';
import { API_TITLE_LENGTH_LIMIT, RATELIMITS } from '../../../lib/constants';
import { nanoid } from '../../../lib/nanoid';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(RATELIMITS.EDIT_REQS, '1 h'),
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

  const title: string = req.body.title;
  const content: string = req.body.content;
  const editCode: string = req.body.editCode;

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

    const post = await prisma.pB_Post.findUnique({
      where: {
        id: `${req.body.id}`,
      },
    });

    if (!post)
      return res.status(404).json({
        error: 'Could not find post to edit.',
        errorCode: PinboardErrors.POST_NOT_FOUND,
      });

    if (!post.editCode)
      return res.status(401).json({
        error: 'This post cannot be edited.',
        errorCode: PinboardErrors.POST_READONLY,
      });

    if (editCode !== post.editCode)
      return res.status(404).json({
        error: 'Your edit code is not valid.',
        errorCode: PinboardErrors.EDIT_CODE_INVALID,
      });

    const revision = await prisma.pB_Revision.create({
      data: {
        revisionId: `${await nanoid(7)}`,

        postId: post?.id,
        oldTitle: post?.title!,
        oldContent: post?.content!,
        newTitle: req.body.title,
        newContent: req.body.content,
        pB_AnonymousPosterId: newAnonPoster.id,
      },
    });

    const newPost = await prisma.pB_Post.update({
      where: {
        id: `${req.body.id}`,
      },
      data: {
        content: content,
      },
    });

    return res.status(200).json({ newPost, revision });
  }

  const post = await prisma.pB_Post.findUnique({
    where: {
      id: `${req.body.id}`,
    },
  });

  if (!post)
    return res.status(404).json({
      error: 'Could not find post to edit.',
      errorCode: PinboardErrors.POST_NOT_FOUND,
    });

  if (!post.editCode)
    return res.status(401).json({
      error: 'This post cannot be edited.',
      errorCode: PinboardErrors.POST_READONLY,
    });

  if (editCode !== post.editCode)
    return res.status(404).json({
      error: 'Your edit code is not valid.',
      errorCode: PinboardErrors.EDIT_CODE_INVALID,
    });

  const revision = await prisma.pB_Revision.create({
    data: {
      revisionId: `${await nanoid(7)}`,
      postId: post?.id,
      oldTitle: post?.title!,
      oldContent: post?.content!,
      newTitle: req.body.title,
      newContent: req.body.content,
      pB_AnonymousPosterId: anonPoster.id,
    },
  });

  const newPost = await prisma.pB_Post.update({
    where: {
      id: `${req.body.id}`,
    },
    data: {
      title: title,
      content: content,
    },
  });

  return res.status(200).json({ newPost, revision });
}
