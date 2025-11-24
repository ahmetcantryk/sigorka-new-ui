"use client";

import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const API_URL = "https://bipol.com.tr/api/SigorkaTools";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Mail alanı boş bırakılamaz.', { className: 'toast-custom toast-error' });
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch(`${API_URL}/AddSigorkaMail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: email.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Üyelik işleminiz başarıyla gerçekleşti.', { className: 'toast-custom toast-success' });
        setEmail('');
      } else {
        toast.error('Geçersiz mail adresi girdiniz.', { className: 'toast-custom toast-error' });
      }
    } catch {
      toast.error('Bir hata oluştu.', { className: 'toast-custom toast-error' });
    } finally {
      setStatus('idle');
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <form className="newsletter-section__form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="form-control"
          placeholder="E-posta Adresiniz"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={status === 'loading'}
        />
        <button type="submit" className="btn btn-link" disabled={status === 'loading'}>
          {status === 'loading' ? 'Gönderiliyor...' : <>Gönder <span className="icon-arrow-right"></span></>}
        </button>
      </form>
    </>
  );
} 