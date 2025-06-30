import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px 0;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
`;

const SafetyPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <Title>Safety & Security</Title>
      </PageHeader>
      <p>This feature is coming soon.</p>
    </PageContainer>
  );
};

export default SafetyPage; 