"use client";
import React from 'react';

interface LegalTextLinksProps {
  onKVKKClick?: () => void;
  onAcikRizaClick?: () => void;
  onElektronikIletiClick?: () => void;
  showOnlyElektronik?: boolean;
}

export default function LegalTextLinks({
  onKVKKClick,
  onAcikRizaClick,
  onElektronikIletiClick,
  showOnlyElektronik = false,
}: LegalTextLinksProps) {
  const handleKVKKClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onKVKKClick) {
      onKVKKClick();
    }
  };

  const handleAcikRizaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onAcikRizaClick) {
      onAcikRizaClick();
    }
  };

  const handleElektronikIletiClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onElektronikIletiClick) {
      onElektronikIletiClick();
    }
  };

  if (showOnlyElektronik) {
    return (
      <>
        <a 
          href="#" 
          onClick={handleElektronikIletiClick}
          style={{ color: '#D9AE5F', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Ticari Elektronik İleti Metni
        </a>
        {'ni okudum, onaylıyorum.'}
      </>
    );
  }

  return (
    <>
      <a 
        href="#" 
        onClick={handleKVKKClick}
        style={{ color: '#D9AE5F', textDecoration: 'underline', cursor: 'pointer' }}
      >
        Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
      </a>
      {"'ni ve "}
      <a 
        href="#" 
        onClick={handleAcikRizaClick}
        style={{ color: '#D9AE5F', textDecoration: 'underline', cursor: 'pointer' }}
      >
        Açık Rıza Metni
      </a>
      {"'ni okudum, onaylıyorum."}
    </>
  );
}

