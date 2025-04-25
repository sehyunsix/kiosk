# BUT Kiosk Project

Interactive self-service kiosk application with voice command features for café ordering.

## Features

- **Voice Commands**: Order items, navigate menus, and checkout using voice recognition
- **Intuitive UI**: Easy-to-use touch interface with responsive design
- **Cart Management**: Add, remove, and modify items in your order
- **Category Filtering**: Browse items by category
- **Animated Feedback**: Visual feedback for voice commands and interactions

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/sehyunsix/kiosk.git
cd kiosk
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory (if needed for environment-specific configurations)

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Using Voice Recognition

The kiosk application supports voice commands to create a hands-free ordering experience. Here's how to use it:

### Voice Command Instructions

1. **Click the microphone button** at the top of the screen to activate voice recognition
2. When the purple indicator appears, **speak your command clearly**
3. The system will process your command and provide feedback

### Available Voice Commands

- **Category Navigation**: Say "커피" or "coffee" to navigate to the coffee category
- **Adding Items**: Say the item name to add it to your cart (e.g., "아메리카노" or "Americano")
- **Checkout**: Say "결제" or "pay" to proceed to checkout
- **Clear Cart**: Say "취소" or "clear" to empty your cart

### Troubleshooting Voice Recognition

If voice recognition isn't working in your deployed build:

1. **Check Browser Compatibility**: Ensure you're using a modern browser that supports the Web Speech API (Chrome is recommended)
2. **HTTPS Requirement**: Voice recognition requires a secure context (HTTPS) in production environments
3. **Microphone Permission**: Make sure you've granted microphone access when prompted
4. **Browser Settings**: Check that microphone permissions are enabled in your browser settings
5. **Refresh the Page**: Sometimes refreshing the page can resolve permission issues

#### Manual Permission Management

- **Chrome**: Click the lock/info icon in the address bar → Site Settings → Microphone
- **Firefox**: Click the lock icon in the address bar → Connection secure → More information → Permissions
- **Safari**: Preferences → Websites → Microphone

## Development Guide

### Project Structure

```
/soma
├── public/             # Static files
│   ├── images/         # Images used in the application
├── src/                # Source code
│   ├── components/     # React components
│   │   ├── kiosk/      # Kiosk-related components
│   ├── data/           # Data files (menu items, etc.)
│   ├── utils/          # Utility functions
│   │   ├── permissions.js  # Browser permissions handling
```

### Voice Recognition Implementation

The application uses the Web Speech API through the `react-speech-recognition` library. The implementation includes:

1. Permission handling in `utils/permissions.js`
2. Voice command processing in `components/kiosk/KioskOrderScreen.js`

### Adding New Voice Commands

To add new voice commands:

1. Open `components/kiosk/KioskOrderScreen.js`
2. Find the `handleSpeechCommand` function
3. Add your new command logic following the existing pattern:

```javascript
if (lowerCommand.includes('your-command-trigger')) {
  // Your command logic here
  setActionAnimation('appropriate-animation');
  setSpeakFeedback('Feedback to display');
  return;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Team

- Team BUT