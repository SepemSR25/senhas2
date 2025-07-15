import { useCallback } from 'react';

export function useAudio() {
  const playNotification = useCallback(() => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play audio notification:', error);
    }
  }, []);

  const playTicketCall = useCallback((ticketCode: string, roomNumber: number) => {
    try {
      // Play notification sound
      playNotification();

      // Use Speech Synthesis API for voice announcement
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Senha ${ticketCode}, Sala ${roomNumber.toString().padStart(2, '0')}`
        );
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;
        utterance.volume = 0.8;
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Failed to play ticket call:', error);
    }
  }, [playNotification]);

  return {
    playNotification,
    playTicketCall,
  };
}
