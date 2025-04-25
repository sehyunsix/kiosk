import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const KioskScreen = ({ onStart, autoMode = false }) => {
  const [autoProgress, setAutoProgress] = useState(0);

  // STA 모드 - 자동으로 다음 화면으로 진행
  useEffect(() => {
    if (!autoMode) return;

    const timer = setTimeout(() => {
      if (autoProgress < 100) {
        setAutoProgress(prev => prev + 1);
      } else {
        onStart(); // 자동으로 다음 화면으로 이동
      }
    }, 50); // 더 빠른 진행 (총 5초)

    return () => clearTimeout(timer);
  }, [autoProgress, autoMode, onStart]);

  return (
    <Container>
      <Header>
        <Logo>KIOSK</Logo>
        <Title>새로운 키오스크 서비스</Title>
      </Header>
      <Content>
        <Description>
          곧 출시될 혁신적인 키오스크 서비스를 미리 만나보세요!
        </Description>
        <Features>
          <Feature>
            <FeatureIcon>🚀</FeatureIcon>
            <FeatureText>빠른 주문 처리</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureText>안전한 결제 시스템</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>🎯</FeatureIcon>
            <FeatureText>맞춤형 추천 서비스</FeatureText>
          </Feature>
          <Feature>
            <FeatureIcon>🔄</FeatureIcon>
            <FeatureText>STA 방식의 자동 프로세스</FeatureText>
          </Feature>
        </Features>
      </Content>
      <ButtonWrapper>
        {autoMode && <ProgressBar progress={autoProgress} />}
        <StartButton onClick={onStart}>
          서비스 알림 신청하기
        </StartButton>
      </ButtonWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 30px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #3f51b5;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 500;
  color: #333;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Description = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.6;
  color: #555;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 15px;
`;

const FeatureIcon = styled.span`
  font-size: 2rem;
  margin-right: 15px;
`;

const FeatureText = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
`;

const ButtonWrapper = styled.div`
  margin-top: auto;
`;

const StartButton = styled.button`
  width: 100%;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: 500;
  transition: background-color 0.3s;

  &:hover {
    background-color: #303f9f;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  margin-bottom: 10px;
  border-radius: 2px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: #4caf50;
    transition: width 0.05s linear;
  }
`;

export default KioskScreen;