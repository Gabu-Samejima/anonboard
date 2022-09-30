import prisma from '../../lib/prisma';
import { NextPageContext } from 'next';
import { PostPage } from '../../modules/post/PostPage';

export default PostPage;

export const getServerSideProps = async (context: NextPageContext) => {
  let post = await prisma.pB_Post.findUnique({
    where: {
      id: `${context.query.id}`,
    },
    include: {
      comments: true,
    },
  });

  post = JSON.parse(JSON.stringify(post));
  const postDate = new Date(`${post?.datePublished}`);
  const postUpdateDate = new Date(`${post?.lastEdited}`);

  const newDate = `${postDate?.toLocaleDateString(
    'en-US'
  )} ${postDate.toLocaleTimeString('en-US')}`;
  const newUpdateDate = postUpdateDate.toLocaleDateString('en-US');

  return {
    props: { post, newDate, newUpdateDate },
  };
};
