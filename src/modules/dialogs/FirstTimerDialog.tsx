/* eslint-disable @typescript-eslint/ban-ts-comment */
import ReactModal from 'react-modal';
import ReactMarkdown from 'react-markdown';
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import Cookies from 'js-cookie';

import { useEffect, useState } from 'react';

export const FirstTimerDialog = () => {
  const introduction = `
  ## Welcome to Pinboard
  --- 
  **Pinboard** is an anonymous community where you can talk, vent
  or just share things anonymously.
 
  ---
  Before you proceed, there's a couple of things you should be aware of.
  * **This is a moderated platform.**
    * Content which violate our [rules](/rules) will be taken down.
  * Be mindful of what you post.
    * Always be aware of what you say and how it may affect someone.
      Even if the content follows our rules.
  * Threats are strictly forbidden from this platform
    * By any chance a threat is made against a person or the school itself, 
    we will not hesitate to tell the school administration about such posts.
    This site is not Twitter. 
  
  Overall, take best practices into considaration and ensure you are safe on the internet.

  If you see a post that may violate our [rules](/rules) or you are uncomfortable with,
  feel free to [report](/report) it.

  `;

  const [isFirstTimer, setFirstTime] = useState(true);

  useEffect(() => {
    if (Cookies.get('passed-modal')) {
      return setFirstTime(false);
    }
  }, []);

  const handleClose = () => {
    setFirstTime(false);
    Cookies.set('passed-modal', 'yes');
  };

  if (Cookies.get('passed-modal')) {
    return <></>;
  } else {
    return (
      <ReactModal
        className={`absolute inset-4 md:top-[50%] md:left-[50%] md:inset-[none] bg-zinc-800 overflow-auto rounded-sm outline-none p-5 md:calc-height`}
        // style={customStyle}
        overlayClassName="pinboardoverlay"
        isOpen={isFirstTimer}
        onAfterClose={() => setFirstTime(false)}
        onRequestClose={() => {
          setFirstTime(false);
        }}
        shouldCloseOnEsc
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
          {introduction}
        </ReactMarkdown>
        <button onClick={handleClose}>Proceed</button>
      </ReactModal>
    );
  }
};
