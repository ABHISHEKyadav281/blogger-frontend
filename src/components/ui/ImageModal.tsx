import React, { useEffect } from 'react';
import { X, Download, Maximize2 } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src, alt }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-4 z-[110]">
        <a 
          href={src} 
          download={alt}
          onClick={(e) => e.stopPropagation()}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10"
          title="Download Image"
        >
          <Download className="w-6 h-6" />
        </a>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/10"
          title="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image Container */}
      <div 
        className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
        />
        
        {/* Info Overlay */}
        <div className="absolute -bottom-12 left-0 right-0 text-center">
          <p className="text-gray-400 text-sm font-medium">{alt}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
