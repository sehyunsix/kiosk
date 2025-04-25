import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// 구글 폼 연동을 위한 설정
const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/u/0/d/e/YOUR_FORM_ID_HERE/formResponse';
const GOOGLE_FORM_EMAIL_NAME = 'entry.12345678'; // 구글 폼의 이메일 필드 이름 (실제 값으로 변경 필요)

const EmailForm = ({ onSubmit, autoMode = false }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const iframeRef = useRef(null);
  const formRef = useRef(null);

  // STA 모드 - 일정 시간이 지나면 자동으로 다음 단계로 진행
  useEffect(() => {
    // 자동 모드가 활성화된 경우에만 자동 진행
    if (!autoMode) return;

    const autoTimer = setTimeout(() => {
      if (autoProgress < 100) {
        setAutoProgress(prev => prev + 1);
      } else if (!isTyping && !isSubmitting && email.length === 0) {
        // 사용자 입력이 없고 제출 중이 아닐 때만 자동으로 진행
        handleRandomEmail();
      }
    }, 200); // 200ms마다 진행

    return () => clearTimeout(autoTimer);
  }, [autoProgress, isTyping, isSubmitting, email, autoMode]);

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // 사용자 입력이 없을 때 자동으로 랜덤 이메일을 생성하고 제출
  const handleRandomEmail = () => {
    const randomEmail = `user${Math.floor(Math.random() * 10000)}@example.com`;
    setEmail(randomEmail);
    setTimeout(() => {
      submitToGoogleForm(randomEmail);
    }, 500);
  };

  // 구글 폼에 데이터 제출
  const submitToGoogleForm = async (emailToSubmit) => {
    setIsSubmitting(true);

    try {
      // 구글 폼에 데이터 전송
      const formData = new FormData();
      formData.append(GOOGLE_FORM_EMAIL_NAME, emailToSubmit);

      // CORS 문제 해결을 위해 hidden iframe을 통해 폼 제출
      if (iframeRef.current) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_FORM_ACTION_URL;
        form.target = 'hidden-iframe';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = GOOGLE_FORM_EMAIL_NAME;
        input.value = emailToSubmit;

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }

      // 제출 완료 후 상위 컴포넌트에 알림
      onSubmit(emailToSubmit);
    } catch (error) {
      console.error('폼 제출 오류:', error);
      setError('알림 신청 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setError('');
    submitToGoogleForm(email);
  };

  return (
    <Container>
      <Header>
        <Title>출시 알림 신청</Title>
        <Subtitle>이메일 주소를 입력하시면 서비스 출시 시 알려드립니다.</Subtitle>
      </Header>

      <FormContainer onSubmit={handleSubmit} ref={formRef}>
        <KioskScreenWrapper isTyping={isTyping}>
          <KioskImage src={`${process.env.PUBLIC_URL}/images/kiosk-preview.svg`} alt="Kiosk Preview" />
          <KioskOverlay isTyping={isTyping}>
            <KioskText>실제 키오스크처럼 작동합니다</KioskText>
          </KioskOverlay>
          {/* STA 진행 상태바 추가 */}
          <ProgressBar progress={autoProgress} />
        </KioskScreenWrapper>

        <InputGroup>
          <EmailInput
            type="email"
            placeholder="이메일 주소를 입력하세요"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
              // 사용자가 입력 중이면 자동 진행 초기화
              setAutoProgress(0);
            }}
            onFocus={() => {
              setIsTyping(true);
              setAutoProgress(0);
            }}
            onBlur={() => setIsTyping(false)}
            disabled={isSubmitting}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputGroup>

        <ActionButtons>
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '알림 신청하기'}
          </SubmitButton>
        </ActionButtons>
      </FormContainer>

      <PrivacyNote>
        * 입력하신 이메일 주소는 서비스 출시 알림 외 다른 용도로 사용되지 않습니다.
      </PrivacyNote>

      {/* 구글 폼 제출을 위한 숨겨진 iframe */}
      <HiddenIframe
        name="hidden-iframe"
        ref={iframeRef}
      />
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
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const KioskScreenWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 30px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: ${props => props.isTyping ? '0 0 15px rgba(63, 81, 181, 0.5)' : '0 5px 15px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s ease;
`;

const KioskImage = styled.img`
  width: 100%;
  display: block;
`;

const KioskOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${props => props.isTyping ? 0 : 1};
  transition: opacity 0.3s ease;
`;

const KioskText = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: ${props => props.progress}%;
  height: 4px;
  background-color: #4caf50;
  transition: width 0.2s ease;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const EmailInput = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1.1rem;
  transition: border-color 0.3s;

  &:focus {
    border-color: #3f51b5;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 5px;
  padding-left: 5px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #303f9f;
  }
`;

const PrivacyNote = styled.p`
  font-size: 0.8rem;
  color: #888;
  text-align: center;
  margin-top: 20px;
`;

const HiddenIframe = styled.iframe`
  display: none;
`;

export default EmailForm;