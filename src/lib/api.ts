import reqIp from 'request-ip';
import prisma from './prisma';

import { NextApiRequest } from 'next/types';
import { nanoid } from './nanoid';

export const createPost = (title: string, content: string, year: number) => {
  return fetch(`/api/post/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: `${process.env.NEXTAUTH_URL}`,
    },
    body: JSON.stringify({
      title: title,
      content: content,
      year: 1,
    }),
  });
};

export const createComment = async (postId: string, content: string) => {
  return fetch(`/api/comment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: `${process.env.NEXTAUTH_URL}`,
    },
    body: JSON.stringify({
      postId: postId,
      content: content,
    }),
  });
};

export const fetchOrCreateUser = async (req: NextApiRequest) => {
  const anonPoster = await prisma.pB_AnonymousPoster.findFirst({
    where: {
      ipAddress: `${reqIp.getClientIp(req)}`,
    },
  });

  if (!anonPoster) {
    const anonPoster = await prisma.pB_AnonymousPoster.create({
      data: {
        id: `${await nanoid(10)}`,
        ipAddress: `${reqIp.getClientIp(req)}`,
      },
    });

    return anonPoster;
  }
  return anonPoster;
};
