import useSWR from 'swr';
import fetcher from '../lib/fetcher';
import { CenterLayout } from '../ui/layouts/CenterLayout';

interface Quote {
  content: string;
  author: string;
}

export const NotFoundPage = () => {
  const quoteQuery = useSWR(
    'https://api.quotable.io/random?maxLength=100&tags=inspirational',
    fetcher,
    {
      refreshInterval: 0,
    }
  );
  const quote: Quote = quoteQuery.data;

  return (
    <CenterLayout>
      <h1>Could not find this page</h1>
      <p>{quote ? quote?.content : <>&nbsp;</>}</p>
      {quote ? <p>&mdash;{quote?.author}</p> : <>&nbsp;</>}
    </CenterLayout>
  );
};
