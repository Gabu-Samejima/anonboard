import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const AdminPage = () => {
  const session = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (!session) push('/api/auth/google');
  }, [session, push]);

  return <h1>Hi</h1>;
};
