import styled from 'styled-components';

export const MainLayout = ({ ...props }) => {
  return <Container>{props.children}</Container>;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
  line-height: 22px;

  padding-right: 10px;
  padding-left: 10px;
`;
