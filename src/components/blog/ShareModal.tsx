import React, { useEffect, useState } from "react";
import { X, Link, MessageCircle, Linkedin, Check } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-[#25D366]",
      onClick: () => {
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(
            title + " " + url
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-6 h-6" />,
      color: "bg-[#0077B5]",
      onClick: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-panel border border-white/20 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Share Post</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.onClick}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div
                  className={`${option.color} p-3 rounded-xl mb-2 text-white shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {option.icon}
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {option.name}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              Copy Link
            </label>
            <div className="flex items-center space-x-2 p-2 bg-white/5 border border-white/10 rounded-xl">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-300 truncate px-2"
              />
              <button
                onClick={handleCopyLink}
                className={`p-2 rounded-lg transition-all ${
                  copied
                    ? "bg-green-500/20 text-green-400"
                    : "bg-primary text-white hover:bg-rose-600"
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
