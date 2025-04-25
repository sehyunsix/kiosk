import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { menuItems, categories } from '../../data/menuData';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { requestMicrophonePermission, checkMicrophonePermission } from '../../utils/permissions';

const KioskOrderScreen = ({ onComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speakFeedback, setSpeakFeedback] = useState('');
  const [actionAnimation, setActionAnimation] = useState(null);
  const [speechActive, setSpeechActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Check microphone permission on component mount
  useEffect(() => {
    const checkPermission = async () => {
      const permissionState = await checkMicrophonePermission();
      if (permissionState === 'denied') {
        setPermissionDenied(true);
        setSpeakFeedback('마이크 접근 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.');
      }
    };

    checkPermission();
  }, []);

  const filteredItems = selectedCategory === '전체'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  // 음성 인식에 따른 액션 처리
  useEffect(() => {
    if (!listening && transcript) {
      handleSpeechCommand(transcript);
    }
  }, [listening, transcript]);

  // 장바구니 변경시 총액 계산
  useEffect(() => {
    calculateTotal();
  }, [cart]);

  const calculateTotal = () => {
    const sum = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotalAmount(sum);
  };

  const handleSpeechCommand = (command) => {
    const lowerCommand = command.toLowerCase();

    // 피드백 메시지 표시
    setSpeakFeedback(`인식된 명령: "${command}"`);

    // "메뉴" 명령어 처리
    if (lowerCommand.includes('커피') || lowerCommand.includes('coffee')) {
      setSelectedCategory('커피');
      setActionAnimation('category');
      setSpeakFeedback('커피 메뉴로 이동합니다.');
      return;
    }

    if (lowerCommand.includes('디저트') || lowerCommand.includes('dessert')) {
      setSelectedCategory('디저트');
      setActionAnimation('category');
      setSpeakFeedback('디저트 메뉴로 이동합니다.');
      return;
    }

    if (lowerCommand.includes('전체') || lowerCommand.includes('모든 메뉴') || lowerCommand.includes('all')) {
      setSelectedCategory('전체');
      setActionAnimation('category');
      setSpeakFeedback('전체 메뉴를 보여드립니다.');
      return;
    }

    // "~~주문" 또는 "~~담아줘" 형태의 명령어 처리
    const orderTerms = ['주문', '담아', '담아줘', '추가', '추가해줘'];
    if (orderTerms.some(term => lowerCommand.includes(term))) {
      // 메뉴 이름 찾기
      const menuItem = menuItems.find(item =>
        lowerCommand.includes(item.name.toLowerCase())
      );

      if (menuItem) {
        addToCart(menuItem);
        setActionAnimation('order');
        setSpeakFeedback(`${menuItem.name}을(를) 장바구니에 담았습니다.`);
        return;
      }
    }

    // "결제" 명령어 처리
    if (lowerCommand.includes('결제') || lowerCommand.includes('계산') || lowerCommand.includes('pay')) {
      if (cart.length > 0) {
        proceedToCheckout();
        setActionAnimation('checkout');
        setSpeakFeedback('결제를 진행합니다.');
      } else {
        setSpeakFeedback('장바구니가 비어있습니다. 먼저 메뉴를 담아주세요.');
      }
      return;
    }

    // "취소" 또는 "비우기" 명령어 처리
    if (lowerCommand.includes('취소') || lowerCommand.includes('비우기') || lowerCommand.includes('clear')) {
      clearCart();
      setActionAnimation('clear');
      setSpeakFeedback('장바구니를 비웠습니다.');
      return;
    }

    // 인식된 명령어가 없는 경우
    setSpeakFeedback('명령을 이해하지 못했습니다. 다시 말씀해주세요.');
  };

  const toggleListening = async () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      setSpeechActive(false);
    } else {
      try {
        // Request microphone permission before starting speech recognition
        const permissionGranted = await requestMicrophonePermission();

        if (permissionGranted) {
          SpeechRecognition.startListening({ continuous: false, language: 'ko-KR' });
          setIsListening(true);
          setSpeechActive(true);
          setSpeakFeedback('듣고 있습니다...');
          resetTranscript();
          setPermissionDenied(false);
        } else {
          setPermissionDenied(true);
          setSpeakFeedback('마이크 사용 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
        }
      } catch (error) {
        console.error('Speech recognition error:', error);
        setSpeakFeedback('음성 인식을 시작하는 데 문제가 발생했습니다.');
      }
    }
  };

  const addToCart = (menuItem) => {
    const existingItemIndex = cart.findIndex(item => item.id === menuItem.id);

    if (existingItemIndex !== -1) {
      // 기존 아이템이 있으면 수량 증가
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // 새 아이템 추가
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const proceedToCheckout = () => {
    // 결제 화면으로 이동 또는 이메일 입력 화면으로 전환
    if (onComplete) {
      onComplete();
    }
  };

  // 애니메이션 효과 처리
  useEffect(() => {
    if (actionAnimation) {
      const timer = setTimeout(() => {
        setActionAnimation(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [actionAnimation]);

  // 음성 피드백 효과 처리
  useEffect(() => {
    if (speakFeedback) {
      const timer = setTimeout(() => {
        setSpeakFeedback('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [speakFeedback]);

  if (!browserSupportsSpeechRecognition) {
    return <div>음성 인식 기능이 지원되지 않는 브라우저입니다.</div>;
  }

  return (
    <Container>
      <TopSection>
        <Header>
          <Logo>CAFE STA</Logo>
          <SpeakButton
            onClick={toggleListening}
            isActive={isListening}
            isDisabled={permissionDenied}
          >
            {isListening ? '🎤 듣는 중...' : '🎤 음성으로 주문하기'}
          </SpeakButton>
        </Header>

        {speakFeedback && (
          <FeedbackBox className={permissionDenied ? 'error' : ''}>
            {speakFeedback}
          </FeedbackBox>
        )}

        <Categories>
          {categories.map(category => (
            <CategoryButton
              key={category}
              isSelected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={actionAnimation === 'category' && selectedCategory === category ? 'animate' : ''}
            >
              {category}
            </CategoryButton>
          ))}
        </Categories>
      </TopSection>

      <MenuSection>
        {filteredItems.map(item => (
          <MenuItem
            key={item.id}
            onClick={() => addToCart(item)}
            className={actionAnimation === 'order' && cart.find(cartItem => cartItem.id === item.id) ? 'animate' : ''}
          >
            <MenuImage src={process.env.PUBLIC_URL + item.image.replace('.jpg', '.svg')} alt={item.name} />
            <MenuInfo>
              <MenuName>{item.name}</MenuName>
              <MenuPrice>{item.price.toLocaleString()}원</MenuPrice>
            </MenuInfo>
          </MenuItem>
        ))}
      </MenuSection>

      <CartSection className={actionAnimation === 'clear' ? 'animate' : ''}>
        <CartHeader>
          <CartTitle>장바구니</CartTitle>
          <ClearButton onClick={clearCart}>비우기</ClearButton>
        </CartHeader>

        <CartItems>
          {cart.length === 0 ? (
            <EmptyCart>장바구니가 비어있습니다.</EmptyCart>
          ) : (
            cart.map(item => (
              <CartItem key={item.id} className={actionAnimation === 'order' && cart.find(cartItem => cartItem.id === item.id) ? 'animate' : ''}>
                <CartItemName>{item.name}</CartItemName>
                <CartItemQuantity>
                  <QuantityButton onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</QuantityButton>
                  <QuantityValue>{item.quantity}</QuantityValue>
                  <QuantityButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</QuantityButton>
                </CartItemQuantity>
                <CartItemPrice>{(item.price * item.quantity).toLocaleString()}원</CartItemPrice>
                <RemoveButton onClick={() => removeFromCart(item.id)}>×</RemoveButton>
              </CartItem>
            ))
          )}
        </CartItems>

        <CartFooter>
          <TotalAmount>합계: {totalAmount.toLocaleString()}원</TotalAmount>
          <CheckoutButton
            onClick={proceedToCheckout}
            disabled={cart.length === 0}
            className={actionAnimation === 'checkout' ? 'animate' : ''}
          >
            결제하기
          </CheckoutButton>
        </CartFooter>
      </CartSection>

      {/* 음성 인식 시 활성화되는 시각적 인디케이터 */}
      {speechActive && <SpeechIndicator />}
    </Container>
  );
};

// 애니메이션
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const highlightAnimation = keyframes`
  0% { background-color: transparent; }
  50% { background-color: rgba(63, 81, 181, 0.2); }
  100% { background-color: transparent; }
`;

const speechWaveAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(1); opacity: 0.8; }
`;

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .animate {
    animation: ${pulseAnimation} 0.5s ease;
  }
`;

const TopSection = styled.div`
  padding: 15px;
  background-color: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3f51b5;
  margin: 0;
`;

const SpeakButton = styled.button`
  background-color: ${props => props.isDisabled ? '#cccccc' : props.isActive ? '#e91e63' : '#3f51b5'};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.isDisabled ? '#cccccc' : props.isActive ? '#c2185b' : '#303f9f'};
  }
`;

const FeedbackBox = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  animation: ${highlightAnimation} 0.5s ease;

  &.error {
    background-color: rgba(244, 67, 54, 0.8);
  }
`;

const Categories = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 5px;

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
`;

const CategoryButton = styled.button`
  background-color: ${props => props.isSelected ? '#3f51b5' : 'white'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  border: 1px solid ${props => props.isSelected ? '#3f51b5' : '#ddd'};
  border-radius: 20px;
  padding: 6px 15px;
  font-size: 0.9rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.isSelected ? '#3f51b5' : '#f5f5f5'};
  }

  &.animate {
    animation: ${pulseAnimation} 0.5s ease;
  }
`;

const MenuSection = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 15px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
`;

const MenuItem = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }

  &.animate {
    animation: ${pulseAnimation} 0.5s ease;
  }
`;

const MenuImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
`;

const MenuInfo = styled.div`
  padding: 10px;
`;

const MenuName = styled.div`
  font-weight: 600;
  margin-bottom: 5px;
`;

const MenuPrice = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const CartSection = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-top: 1px solid #ddd;
  max-height: 40%;
  display: flex;
  flex-direction: column;

  &.animate {
    animation: ${highlightAnimation} 0.5s ease;
  }
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CartTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

const ClearButton = styled.button`
  background-color: transparent;
  color: #666;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    color: #e53935;
  }
`;

const CartItems = styled.div`
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
`;

const EmptyCart = styled.div`
  color: #999;
  text-align: center;
  padding: 20px 0;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;

  &.animate {
    animation: ${highlightAnimation} 0.5s ease;
  }
`;

const CartItemName = styled.div`
  flex: 1;
  font-weight: 500;
`;

const CartItemQuantity = styled.div`
  display: flex;
  align-items: center;
  margin: 0 15px;
`;

const QuantityButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const QuantityValue = styled.span`
  margin: 0 8px;
  min-width: 20px;
  text-align: center;
`;

const CartItemPrice = styled.div`
  width: 80px;
  text-align: right;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  background-color: transparent;
  color: #999;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 10px;

  &:hover {
    color: #e53935;
  }
`;

const CartFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
`;

const TotalAmount = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
`;

const CheckoutButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #43a047;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &.animate {
    animation: ${pulseAnimation} 0.5s ease;
  }
`;

const SpeechIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(233, 30, 99, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: rgba(233, 30, 99, 0.3);
    animation: ${speechWaveAnimation} 1.5s infinite;
  }
`;

export default KioskOrderScreen;