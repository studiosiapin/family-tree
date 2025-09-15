import React from 'react';
import { Message } from '../types';

interface MessageDisplayProps {
  message: Message | null;
  onClose: () => void;
}

export function MessageDisplay({ message, onClose }: MessageDisplayProps) {
  if (!message) return null;

  return (
    <div 
      className={`${
        message.type === 'error' ? 'error-message' : 'success-message'
      } cursor-pointer`}
      onClick={onClose}
    >
      {message.text}
    </div>
  );
}