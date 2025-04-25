// Browser permissions utility
const requestMicrophonePermission = async () => {
  try {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Browser does not support getUserMedia API');
      return false;
    }

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // If we got here, permission was granted
    // Stop all tracks to release the microphone
    stream.getTracks().forEach(track => track.stop());

    return true;
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
};

// Check if permission is already granted
const checkMicrophonePermission = async () => {
  try {
    if (!navigator.permissions || !navigator.permissions.query) {
      // If the browser doesn't support the permissions API, we'll have to ask for permission directly
      return null; // null means we don't know the status
    }

    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state;
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return null;
  }
};

export { requestMicrophonePermission, checkMicrophonePermission };