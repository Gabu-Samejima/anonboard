/* eslint-disable @typescript-eslint/ban-ts-comment */
import Link from 'next/link';
import ReactModal from 'react-modal';

import ReactMarkdown from 'react-markdown';
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';

import { useRef, useState } from 'react';
import { ReportReason, StudentYears } from '../lib/enums';
import { useRouter } from 'next/router';

interface SubmissionCardProps {
  children?: React.ReactNode;
  comment?: boolean;
  fullWidth?: boolean;
  title?: string;
  author?: string;
  year?: number;
  id?: string;
  isPreview?: boolean;
  rmBottom?: boolean;
  flagged?: boolean;
  deleted?: boolean;
  publishedOn?: string | Date;
  lastUpdated?: string;
  noReport?: boolean;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({
  children,
  fullWidth = false,
  title,
  id,
  author,
  year = 1,
  isPreview,
  rmBottom = false,
  flagged,
  deleted,
  publishedOn,
  noReport,
}) => {
  const [isOpen, setModalState] = useState(false);
  const [reportValue, setReportValue] = useState(-1);
  const [reportResult, setReportResult] = useState('');

  const reportTextArea = useRef(null);

  const r = useRouter();

  const resolveStudentYear = (year: number) => {
    switch (year) {
      case StudentYears.FRESHMAN:
        return 'Freshman';
      case StudentYears.SOPHOMORE:
        return 'Sophomore';
      case StudentYears.JUNIOR:
        return 'Junior';
      case StudentYears.SENIOR:
        return 'Senior';
      default:
        return '';
    }
  };

  const setCurrentReportValue = (e: any) => {
    console.log(e.target.value);
    setReportValue(e.target.value);
  };

  const submitReport = () => {
    setReportResult('Sending report...');
    fetch(`/api/post/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: `${process.env.NEXTAUTH_URL}`,
      },
      body: JSON.stringify({
        postId: `${r.query.id}`,
        reason: Number(reportValue),
        details:
          // @ts-ignore
          reportTextArea.current?.value == ''
            ? null
            : // @ts-ignore
              reportTextArea.current?.value,
      }),
    }).then(async (r) => {
      // const res = await r.json();

      if (!r.ok) {
        setReportResult('Could not send report. Try again?');
        return;
      }

      setReportResult(
        'Your report was sent and will be taken looked at soon. Thanks!'
      );
      setTimeout(() => {
        setModalState(false);
        setReportResult('');
      }, 3000);
    });
  };

  if (flagged) {
    return <h1>This post has been taken down due to reports.</h1>;
  }
  if (deleted) return <h1>This post was deleted.</h1>;

  return (
    <>
      <ReportModal
        onAfterClose={() => setModalState(false)}
        onRequestClose={() => {
          setModalState(false);
        }}
        isOpen={isOpen}
      >
        {reportResult == '' ? (
          <>
            <div onChange={setCurrentReportValue}>
              <h3>Select the reason you are reporting this</h3>
              <ul>
                <input
                  type="radio"
                  value={ReportReason.DOXXING_PRIVATE_INFO}
                  name="report"
                />{' '}
                Doxxing/releasing of private information
                <br />
                <input
                  type="radio"
                  value={ReportReason.HATE_SPEECH}
                  name="report"
                />{' '}
                Hate speech (use of slurs, etc.)
                <br />
                <input
                  type="radio"
                  value={ReportReason.THREAT_AGAINST_OTHERS}
                  name="report"
                />{' '}
                Threats against the school or others
                <br />
                <input
                  type="radio"
                  value={ReportReason.UNCOMFORTABLE}
                  name="report"
                />{' '}
                This post made me uncomfortable.
              </ul>
            </div>
            <h3>Anything else we should know?</h3>
            <textarea
              className={`h-52 py-3 px-4 mb-2 bg-button-bg placeholder:text-zinc-600 outline-none`}
              placeholder="Content"
              // rows={}
              cols={25}
              ref={reportTextArea}
            />
            <br />
            <button onClick={submitReport}>Proceed</button>
          </>
        ) : (
          <>
            <h1>
              Thanks for submitting your report, it will be handled shortly.
            </h1>
          </>
        )}
      </ReportModal>
      <div
        className={`bg-button-bg border-[1.4px] border-zinc-700 p-2 w-full ${
          fullWidth ? 'md:w-full' : 'md:w-3/4'
        } ${rmBottom ? '' : 'mb-2'}`}
      >
        <div className={`flex float-right`}>
          {isPreview ? (
            <>
              <Link href={`/post/${id}`}>view</Link>
              <h6> &nbsp;|&nbsp;</h6>
            </>
          ) : (
            ''
          )}
          {noReport ? (
            ''
          ) : (
            <a href="#" onClick={() => setModalState(true)}>
              report
            </a>
          )}
        </div>
        {isPreview ? <h2 className={`truncate`}>{title}</h2> : <h2>{title}</h2>}
        <h4>
          {author ? (
            <>
              {' '}
              by an {author} {publishedOn ? `on ${publishedOn}` : ''}
            </>
          ) : (
            ''
          )}
        </h4>
        <h4></h4>
        <hr />
        <p className={`${isPreview ? 'truncate' : ''}`}>{children}</p>
      </div>
    </>
  );
};

const ReportModal: React.FC<Record<string, unknown>> = ({ ...props }) => {
  const modalText = `
  # Report a Post

  If this post violate our [rules](/rules) or you are uncomfortable with this post,
  feel free to report it here. Below are options you can choose for reporting.

  `;

  return (
    // @ts-ignore
    <ReactModal
      className={`absolute inset-4 md:top-[50%] md:left-[50%] md:inset-[none] bg-zinc-800 overflow-auto rounded-sm outline-none p-5 md:calc-height`}
      // style={customStyle}
      overlayClassName="pinboardoverlay"
      shouldCloseOnEsc
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkEmoji,
          remarkParse,
          // @ts-ignore
          remarkRehype,
          remarkSqueezeParagraphs,
        ]}
        // className={`max-w-2xl`}
      >
        {modalText}
      </ReactMarkdown>

      {props.children}
    </ReactModal>
  );
};
