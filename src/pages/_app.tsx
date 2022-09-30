import Head from 'next/head';
import { NextPageContext } from 'next';
import { getSession, SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import {
  META_KEYWORDS,
  META_TITLE,
  SITE_BRAND_NAME,
  SITE_DESCRIPTION,
} from '../lib/constants';
import { FirstTimerDialog } from '../modules/dialogs/FirstTimerDialog';

import '../styles/global.scss';

export const getServerSideProps = async (context: NextPageContext) => {
  return {
    props: {
      session: await getSession(context),
    },
  };
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{SITE_BRAND_NAME}</title>

        <meta name="title" content={META_TITLE} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="keywords" content={META_KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="author" content="https://apap04.com" />
      </Head>
      { /* @ts-ignore */}
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <Component {...pageProps} />
        <FirstTimerDialog />
      </SessionProvider>
    </>
  );
}

export default MyApp;
