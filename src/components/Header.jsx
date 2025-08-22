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

export default function Header({ logo, title }) {
  return (
    <Container>
      <Logo src={logo} alt="pizzas" />
      <Title>{title}</Title>
    </Container>
  );
}