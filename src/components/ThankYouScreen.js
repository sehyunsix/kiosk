import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ThankYouScreen = ({ email, onRestart, autoMode = false }) => {
  const [countdown, setCountdown] = useState(10);

  // 자동 모드일 때 카운트다운 후 자동으로 처음으로 돌아가기
  useEffect(() => {
    if (!autoMode) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onRestart();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoMode, onRestart]);

  return (
    <Container>
      <ContentWrapper>
        <IconWrapper>
          <SuccessIcon>✓</SuccessIcon>
        </IconWrapper>

        <Title>등록이 완료되었습니다!</Title>

        <Description>
          <strong>{email}</strong> 주소로 서비스 출시 소식을 보내드리겠습니다.
        </Description>

        <InfoBox>
          <InfoTitle>출시 예정 일정</InfoTitle>
          <InfoContent>2025년 6월 중</InfoContent>

          <InfoTitle>베타 테스트 참여 기회</InfoTitle>
          <InfoContent>선착순 50명 한정</InfoContent>
        </InfoBox>

        <SocialLinks>
          <SocialTitle>소식을 더 빠르게 받아보세요</SocialTitle>
          <SocialButtonsWrapper>
            <SocialButton>Instagram</SocialButton>
            <SocialButton>Twitter</SocialButton>
            <SocialButton>Facebook</SocialButton>
          </SocialButtonsWrapper>
        </SocialLinks>
      </ContentWrapper>

      <ButtonWrapper>
        <RestartButton onClick={onRestart}>
          처음으로 돌아가기 {autoMode && countdown > 0 && `(${countdown}초)`}
        </RestartButton>
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

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #4caf50;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const SuccessIcon = styled.span`
  color: white;
  font-size: 2.5rem;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #555;
  text-align: center;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const InfoBox = styled.div`
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-top: 10px;
  margin-bottom: 5px;

  &:first-child {
    margin-top: 0;
  }
`;

const InfoContent = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 15px;
`;

const SocialLinks = styled.div`
  width: 100%;
`;

const SocialTitle = styled.h3`
  font-size: 1rem;
  text-align: center;
  font-weight: 500;
  color: #555;
  margin-bottom: 15px;
`;

const SocialButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const SocialButton = styled.button`
  background-color: #f0f0f0;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 0.9rem;
  color: #555;
  transition: all 0.2s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const ButtonWrapper = styled.div`
  margin-top: 20px;
`;

const RestartButton = styled.button`
  width: 100%;
  background-color: transparent;
  color: #3f51b5;
  border: 2px solid #3f51b5;
  border-radius: 10px;
  padding: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #f0f2ff;
  }
`;

export default ThankYouScreen;