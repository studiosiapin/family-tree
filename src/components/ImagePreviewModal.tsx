import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Trap focus within modal
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Since we only have one focusable element (close button), 
        // prevent default tab behavior to keep focus on the button
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="image-preview-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-preview-title"
      ref={modalRef}
    >
      <div className="image-preview-content">
        <button
          ref={closeButtonRef}
          className="image-preview-close"
          onClick={onClose}
          aria-label="Close image preview"
          title="Close (Esc)"
        >
          <X size={24} />
        </button>
        <img
          src={imageUrl}
          alt="Profile picture preview"
          className="image-preview-img"
          id="image-preview-title"
        />
      </div>
    </div>
  );
}