'use client';

import React from 'react';
import { Phone, X, AlertCircle } from 'lucide-react';

interface PhoneNotMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PhoneNotMatchModal: React.FC<PhoneNotMatchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full" style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Kapat"
          >
            <X size={24} />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Warning Icon */}
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-500">
                <AlertCircle className="text-orange-500" size={32} />
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <p className="text-gray-700 text-base leading-relaxed">
                Girdiğiniz Kimlik Numarası hatalı olabilir veya sistemde farklı bir telefon numarasıyla kayıtlı olabilirsiniz.<br /> Lütfen bilgilerinizi kontrol ediniz.
              </p>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Customer Service */}
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">Müşteri Hizmetleri</p>
              <a 
                href="tel:+908504040404" 
                className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 transition-colors text-lg font-semibold"
              >
                <Phone size={20} />
                0850 404 04 04
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Animasyon stilleri */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default PhoneNotMatchModal;

