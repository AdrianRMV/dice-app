import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
`;

const Logo = styled.img`
  max-width: 150px;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  color: #fff;
  text-align: center;
`;

interface HeaderProps {
  logo: string;
  title: string;
}

const Header: React.FC<HeaderProps> = ({ logo, title }) => {
  return (
    <Container>
      <Logo src={logo} alt="pizzas" />
      <Title>{title}</Title>
    </Container>
  );
};

export default Header;