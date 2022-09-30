import useSWR from 'swr';
import fetcher from '../lib/fetcher';
import { PB_Post } from '@prisma/client';
import { MainLayout } from '../ui/layouts/MainLayout';
import { Navbar } from '../ui/Navbar';
import { SubmissionCard } from '../ui/SubmissionCard';
import { useRouter } from 'next/router';
import { Button } from '../ui/Button';

export const FeedPage = () => {
  const { push } = useRouter();
  const {
    data,
    error,
    mutate: refreshFeed,
    isValidating,
  } = useSWR('/api/post/fetch/100', fetcher);
  const posts: PB_Post[] = data;

  return (
    <MainLayout>
      <Navbar />
      <h1>Main feed</h1>
      <p>Click on &quot;view&quot; on any post to view it.</p>
      <hr />
      <div className={`flex flex-row mb-7`}>
        <input
          className={`h-12 w-10/12 bg-button-bg px-4 mr-4`}
          placeholder="Click to make a new post"
          onClick={() => push('/create')}
        ></input>
        <Button onClick={refreshFeed} className={`float-right h-auto w-auto `}>
          refresh
        </Button>
      </div>

      {/* <hr /> */}
      {(!posts && !error) || (isValidating && <p>loading...</p>)}
      <div className={`flex flex-col md:justify-center md:items-center`}>
        {posts && !isValidating
          ? posts
              .sort((a, b) => (a.datePublished < b.datePublished ? 1 : -1))
              .map((post) => {
                return (
                  <SubmissionCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    year={post.year!}
                    author="OMHS Student"
                    publishedOn={new Date(
                      post.datePublished
                    ).toLocaleDateString('en-US')}
                    isPreview
                  >
                    {post.content}
                  </SubmissionCard>
                );
              })
          : ''}
        {!isValidating && posts && posts.length == 0 && (
          <div className={`flex flex-col items-center justify-center`}>
            <h1 className={`text-5xl`}>💨</h1>
            <h2>Be the first one to make a post.</h2>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
