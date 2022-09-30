import tw from 'tailwind-styled-components';
export const TextBox = tw.input`
    h-12
    bg-button-bg
    px-4
    mb-2
    placeholder:text-zinc-600
    outline-none
`;

export const BigTextBox = tw.textarea`
    h-12
    py-3
    px-4
    placeholder:text-zinc-600
    bg-button-bg
    outline-none
`;
