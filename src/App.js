import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import KioskScreen from './components/KioskScreen';
import EmailForm from './components/EmailForm';
import ThankYouScreen from './components/ThankYouScreen';
import KioskOrderScreen from './components/kiosk/KioskOrderScreen';
import 'regenerator-runtime/runtime';

function App() {
  const [currentScreen, setCurrentScreen] = useState('kiosk');
  const [email, setEmail] = useState('');
  const [staActive, setStaActive] = useState(false);
  const [speakMessage, setSpeakMessage] = useState('');

  // Speak to Action 기능 토글
  const toggleStaMode = () => {
    setStaActive(!staActive);
  };

  // 주문 완료 처리
  const handleOrderComplete = () => {
    setCurrentScreen('emailForm');
    if (speakMessage) {
      // 음성 안내 메시지 재생
      speak('주문이 완료되었습니다. 이메일을 입력하시면 서비스 출시 소식을 알려드립니다.');
    }
  };

  const handleStartClick = () => {
    setCurrentScreen('emailForm');
  };

  const handleEmailSubmit = (submittedEmail) => {
    setEmail(submittedEmail);
    setCurrentScreen('thankYou');
    if (speakMessage) {
      speak('감사합니다. 출시 소식을 이메일로 알려드리겠습니다.');
    }
  };

  const handleRestart = () => {
    setCurrentScreen('kiosk');
    setEmail('');
    if (speakMessage) {
      speak('키오스크 화면으로 돌아갑니다.');
    }
  };

  // 텍스트를 음성으로 변환하는 함수
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      window.speechSynthesis.speak(utterance);
      setSpeakMessage(text);

      // 음성 출력이 끝나면 메시지 초기화
      utterance.onend = () => {
        setSpeakMessage('');
      };
    }
  };

  // STA 모드가 활성화되면 시작 메시지 출력
  useEffect(() => {
    if (staActive && currentScreen === 'kiosk') {
      speak('안녕하세요. 음성으로 주문할 수 있는 키오스크입니다. 화면 우측 상단의 음성 버튼을 눌러 주문해보세요.');
    }
  }, [staActive, currentScreen]);

  return (
    <AppContainer>
      <KioskWrapper>
        {currentScreen === 'kiosk' && (
          <KioskOrderScreen onComplete={handleOrderComplete} />
        )}
        {currentScreen === 'welcome' && (
          <KioskScreen onStart={handleStartClick} />
        )}
        {currentScreen === 'emailForm' && (
          <EmailForm onSubmit={handleEmailSubmit} />
        )}
        {currentScreen === 'thankYou' && (
          <ThankYouScreen email={email} onRestart={handleRestart} />
        )}
      </KioskWrapper>

      <ControlPanel>
        <StaToggle onClick={toggleStaMode} isActive={staActive}>
          {staActive ? 'STA 모드 On' : 'STA 모드 Off'}
        </StaToggle>
        {speakMessage && (
          <SpeakFeedback>
            <SpeakIcon>🔊</SpeakIcon>
            {speakMessage}
          </SpeakFeedback>
        )}
      </ControlPanel>

      <KioskInfo>
        이 키오스크는 <strong>STA(Speak to Action)</strong> 기능이 적용되어 음성 명령으로 작동합니다.
      </KioskInfo>

      <StaExamples>
        <ExampleTitle>사용 가능한 음성 명령:</ExampleTitle>
        <ExampleCommand>"아메리카노 주문해줘"</ExampleCommand>
        <ExampleCommand>"커피 메뉴 보여줘"</ExampleCommand>
        <ExampleCommand>"장바구니 비워줘"</ExampleCommand>
        <ExampleCommand>"결제할게"</ExampleCommand>
      </StaExamples>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  padding: 20px;
`;

const KioskWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  height: 700px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ControlPanel = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const StaToggle = styled.button`
  padding: 10px 15px;
  background-color: ${props => props.isActive ? '#4caf50' : '#f0f0f0'};
  color: ${props => props.isActive ? 'white' : '#333'};
  border: 1px solid ${props => props.isActive ? '#4caf50' : '#ccc'};
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.isActive ? '#43a047' : '#e0e0e0'};
  }
`;

const SpeakFeedback = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SpeakIcon = styled.span`
  margin-right: 8px;
  font-size: 1.1rem;
`;

const KioskInfo = styled.p`
  margin-top: 15px;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  max-width: 500px;
  line-height: 1.5;
`;

const StaExamples = styled.div`
  margin-top: 10px;
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
`;

const ExampleTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #333;
`;

const ExampleCommand = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin: 5px 0;
  padding-left: 12px;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0;
  }
`;

export default App;