import Link from 'next/link';

export const Navbar = () => {
  return (
    <div className={`flex flex-row justify-between pt-4 mb-5 h-10`}>
      <div className={`flex gap-4`}>
        <Link href="/">home</Link>
        <Link href="/rules">rules</Link>
        <a href="https://discord.gg/C48nQJ7n">chat</a>
      </div>
    </div>
  );
};
