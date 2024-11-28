import { apiService } from '../services/api';

export const processVideoFrame = async (videoElement) => {
  if (!videoElement) return null;

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  // Convert to base64
  const base64Frame = canvas.toDataURL('image/jpeg').split(',')[1];
  
  try {
    const response = await apiService.post('/api/webcam/predict', {
      frame: base64Frame
    });
    return response.data;
  } catch (error) {
    console.error('Error processing frame:', error);
    return null;
  }
};

export const startVideoStream = (webcamRef, onFrame) => {
  if (!webcamRef.current?.video) return null;
  
  const intervalId = setInterval(async () => {
    const result = await processVideoFrame(webcamRef.current.video);
    if (result) {
      onFrame(result);
    }
  }, 1000); // Process every second
  
  return intervalId;
};