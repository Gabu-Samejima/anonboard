import moment from 'moment';

import { useEffect, useState } from 'react';
import { PB_Comment } from '@prisma/client';

import { MainLayout } from '../../ui/layouts/MainLayout';
import { Navbar } from '../../ui/Navbar';
import { SubmissionCard } from '../../ui/SubmissionCard';

import { CommentPill } from '../../ui/CommentPill';
import { createComment } from '../../lib/api';
import { Button } from '../../ui/Button';
import { PinboardErrors } from '../../lib/enums';

export const PostPage = ({ ...props }) => {
  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState<Array<any>>([]);

  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState(-1);

  useEffect(() => {
    setCommentList(props.post.comments);
  }, []);

  const handleCommentCreate = async () => {
    const newComment = {
      content: comment,
      dateCreated: new Date(),
      id: '👀',
    };

    const res = await createComment(props.post.id, comment);
    const resJson = await res.json();

    if (!res.ok) {
      setError(true);
      switch (resJson.errorCode) {
        case PinboardErrors.MISSING_CONTENT:
          setErrorMessage("You're missing a comment.");
          setErrorCode(PinboardErrors.MISSING_CONTENT);
          break;
        default:
          setErrorMessage(resJson.error);
      }
      return;
    }

    setCommentList([newComment, ...props.post.comments]);
    setComment('');
    setErrorMessage('');
    setErrorCode(-1);
  };

  return (
    <MainLayout>
      <Navbar />
      <SubmissionCard
        fullWidth
        title={props.post.title}
        year={props.post.year}
        publishedOn={props.newDate}
        lastUpdated={props.newUpdateDate ? props.newUpdateDate : null}
        author="anonymous poster"
        flagged={props.post.flagged}
        deleted={props.post.deleted}
      >
        {props.post.content}
      </SubmissionCard>
      <hr />
      <h1>Comments ({props.post.comments.length})</h1>
      <div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            handleCommentCreate();
          }}
        >
          <input
            value={comment}
            className={`h-12 w-10/12 bg-button-bg px-4 mb-3 ${
              errorCode == PinboardErrors.MISSING_CONTENT
                ? 'border-l-2 border-l-red-600'
                : ''
            } outline-none`}
            placeholder="Post a new comment here!"
            onChange={(e) => setComment(e.currentTarget.value)}
          ></input>
          <Button className={`ml-4`}>
            Post
            <input type="submit" value="Submit" hidden />
          </Button>
        </form>
        {isError ? (
          <>
            <p className={`pt-0`}>{errorMessage}</p>
            <br></br>
          </>
        ) : (
          <></>
        )}
      </div>
      {/* <hr /> */}
      {commentList
        .sort((a: PB_Comment, b: PB_Comment) =>
          a.dateCreated < b.dateCreated ? 1 : -1
        )
        .map((comment: PB_Comment) => {
          const date = new Date(comment.dateCreated);
          return (
            <>
              <CommentPill
                isInput={false}
                date={`Posted ${moment(date).fromNow()}`}
                id={comment.id}
                key={comment.id}
              >
                {comment.content}
              </CommentPill>
            </>
          );
        })}
    </MainLayout>
  );
};
