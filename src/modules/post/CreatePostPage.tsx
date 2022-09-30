/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { createPost } from '../../lib/api';
import { API_TITLE_LENGTH_LIMIT } from '../../lib/constants';
import { PinboardErrors, StudentYears } from '../../lib/enums';
import { Button } from '../../ui/Button';
import { MainLayout } from '../../ui/layouts/MainLayout';
import { Navbar } from '../../ui/Navbar';

export const CreatePostPage = () => {
  const { push } = useRouter();

  const titleBoxRef = useRef(null);
  const contentBoxRef = useRef(null);

  const [titleBoxContent, setTitleBoxContent] = useState('');
  const [contentBox, setContentBox] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState(-1);
  const [requestFailed, setRequestFailed] = useState(false);

  const [isPosting, setPostingStatus] = useState(false);
  const [yearChoice, setYearChoice] = useState(-1);

  const postContent = () => {
    setPostingStatus(true);
    setRequestFailed(false);
    setErrorMessage('');
    setErrorCode(-1);

    createPost(titleBoxContent, contentBox, yearChoice).then(async (r) => {
      const res = await r.json();

      if (!r.ok) {
        setPostingStatus(false);
        setRequestFailed(true);
        switch (res.errorCode) {
          case PinboardErrors.RATELIMITED:
            setErrorMessage("You can't post more than 3 times in an hour!");
            setErrorCode(PinboardErrors.RATELIMITED);
            break;
          case PinboardErrors.MISSING_TITLE:
            setErrorMessage('You are missing a title.');
            setErrorCode(PinboardErrors.MISSING_TITLE);
            break;
          case PinboardErrors.TITLE_TOO_LONG:
            setErrorMessage(
              `Your title is too long. It must be at most ${API_TITLE_LENGTH_LIMIT} characters long.`
            );
            setErrorCode(PinboardErrors.TITLE_TOO_LONG);
            break;
          case PinboardErrors.MISSING_CONTENT:
            setErrorMessage('You are missing content.');
            setErrorCode(PinboardErrors.MISSING_CONTENT);
            break;
          default:
            setErrorMessage(res.error);
        }
        return;
      }

      push(`/post/${res.id}`);
    });
    // .catch((r) => {
    //   setPostingStatus(false);
    //   setRequestFailed(true);
    //   setErrorMessage('Could not make the post. Try again?');

    //   return;
    // });
  };

  // TODO(greek): Infer proper type.
  const setYearChoiceValue = (e: unknown) => {
    // @ts-ignore
    setYearChoice(`${e.target.value}`);
  };

  return (
    <MainLayout>
      <Navbar />
      <h1>Let something off your chest.</h1>

      <input
        className={`h-12 py-3 px-4 mb-2 bg-button-bg placeholder:text-zinc-600 outline-none ${
          errorCode == PinboardErrors.TITLE_TOO_LONG
            ? 'border-l-2 border-l-red-600'
            : ''
        } ${
          errorCode == PinboardErrors.MISSING_TITLE
            ? 'border-l-2 border-l-red-600'
            : ''
        }`}
        placeholder="Title"
        onChange={(e) => setTitleBoxContent(`${e.target.value}`)}
        ref={titleBoxRef}
      />
      <textarea
        className={`h-52 py-3 px-4 mb-2 bg-button-bg placeholder:text-zinc-600 outline-none ${
          errorCode == PinboardErrors.MISSING_CONTENT
            ? 'border-l-2 border-l-red-600'
            : ''
        }`}
        placeholder="Content"
        rows={3}
        onChange={(e) => setContentBox(`${e.target.value}`)}
        ref={contentBoxRef}
      />
      {/* <div onChange={setYearChoiceValue}>
        <p>What year are you in?</p>
        <input type="radio" value={StudentYears.FRESHMAN} name="year" />{' '}
        Freshman
        <br />
        <input type="radio" value={StudentYears.SOPHOMORE} name="year" />{' '}
        Sophomore
        <br />
        <input type="radio" value={StudentYears.JUNIOR} name="year" /> Junior
        <br />
        <input type="radio" value={StudentYears.SENIOR} name="year" /> Senior
      </div> */}
      {isPosting && !errorMessage ? (
        <div className={`py-2`}>
          <p>Posting...</p>
        </div>
      ) : (
        <div className={`py-2`}>
          <Button onClick={postContent}>Post</Button>
        </div>
      )}
      {requestFailed && <p>{errorMessage}</p>}
    </MainLayout>
  );
};
