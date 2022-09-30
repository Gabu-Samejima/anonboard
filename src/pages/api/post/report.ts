import reqIp from 'request-ip';
import prisma from '../../../lib/prisma';
import redis from '../../../lib/redis';

import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';
import { PinboardErrors, ReportReason } from '../../../lib/enums';
import { RATELIMITS } from '../../../lib/constants';
import { nanoid } from '../../../lib/nanoid';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(RATELIMITS.REPORT_REQS, '25 m'),
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
      rateLimitState: result,
    });
    return;
  }

  const reportReason: number = req.body.reason;
  const reportDetails: string = req.body.details;
  const postId: string = req.body.postId;

  if (!Object.values(ReportReason).includes(reportReason))
    return res.status(400).json({
      error: 'Please provide a valid reason.',
      errorCode: PinboardErrors.INVALID_REPORT_REASON,
    });

  if (!postId)
    return res.status(400).json({
      error: 'Please provide a valid post ID',
      errorCode: PinboardErrors.POST_NOT_FOUND,
    });

  const post = await prisma.pB_Post.findFirst({
    where: { id: postId },
  });

  if (!post)
    return res.status(400).json({
      error: 'Please provide a valid post ID.',
      errorCode: PinboardErrors.POST_NOT_FOUND,
    });

  const reporter = await prisma.pB_AnonymousPoster.findFirst({
    where: {
      ipAddress: `${reqIp.getClientIp(req)}`,
    },
  });

  if (!reporter) {
    const newReporter = await prisma.pB_AnonymousPoster.create({
      data: {
        id: `${await nanoid(10)}`,
        ipAddress: `${reqIp.getClientIp(req)}`,
      },
    });

    const report = await prisma.pB_Report.create({
      data: {
        reportReason: reportReason,
        reportDetails: reportDetails,
        postId: postId,
        reporterId: newReporter.id,
      },
    });

    return res.status(200).json(report);
  }

  const report = await prisma.pB_Report.create({
    data: {
      reportReason: reportReason,
      reportDetails: reportDetails,
      postId: postId,
      reporterId: reporter!.id,
    },
  });

  return res.status(200).json(report);
}
