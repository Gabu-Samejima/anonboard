/* eslint-disable @typescript-eslint/ban-ts-comment */
import ReactMarkdown from 'react-markdown';
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import { MainLayout } from '../ui/layouts/MainLayout';
import { Navbar } from '../ui/Navbar';
import { SubmissionCard } from '../ui/SubmissionCard';

export const RulesPage = () => {
  const text = `
  # Rules
  Like any other side, there are rules you *must* follow in order to post
  content that will not get taken down or get you banned. These are fairly
  easy to follow. You can't mess up! :wink:

  ---


  `;
  return (
    <MainLayout>
      <Navbar />
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkEmoji,
          remarkParse,
          // @ts-ignore
          remarkRehype,
          remarkSqueezeParagraphs,
        ]}
      >
        {text}
      </ReactMarkdown>
      <SubmissionCard title="1. No hate speech" fullWidth noReport>
        Hate speech includes any sort of slurs
      </SubmissionCard>
      <SubmissionCard
        title="2. No doxxing/threatening to release private information"
        fullWidth
        noReport
      >
        Any post that releases private information or threatens to release
        information will be banned.
      </SubmissionCard>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkEmoji,
          remarkParse,
          // @ts-ignore
          remarkRehype,
          remarkSqueezeParagraphs,
        ]}
      >
        These rules are subject to change at any time. More might be added, some
        might be removed.
      </ReactMarkdown>
    </MainLayout>
  );
};
