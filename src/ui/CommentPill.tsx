interface CommentPillProps {
  children?: React.ReactNode;
  isInput: boolean;
  content?: string;
  date?: string;
  id?: string;
}

export const CommentPill: React.FC<CommentPillProps> = ({
  children,
  isInput,
  content,
  date,
  id,
  ...props
}) => {
  return (
    <>
      <div className={`rounded-md bg-button-bg mb-3 p-2`}>
        <p>{children}</p>
        {/* <hr className={`m-0`}></hr> */}
        <h5 className={`m-0 text-zinc-500`}>
          {date} | {id}
        </h5>
      </div>
    </>
  );
};
