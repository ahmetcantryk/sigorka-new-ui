// 🔒 Güvenli Kart Bilgisi Geçici Saklama Sistemi
// PCI DSS uyumlu - Sadece memory'de tutuluyor, localStorage'a yazılmıyor

interface CardInfo {
  number: string;
  holderName: string;
  expireMonth: number;
  expireYear: number;
  cvc: string;
}

interface SecureCardSession {
  cardInfo: CardInfo;
  sessionId: string;
  expiresAt: number;
  merchantPaymentId: string;
}

class SecureCardStorage {
  private static instance: SecureCardStorage;
  private sessions: Map<string, SecureCardSession> = new Map();
  private readonly SESSION_TIMEOUT = 10 * 60 * 1000; // 10 dakika

  private constructor() {
    // Singleton pattern
    this.startCleanupTimer();
  }

  public static getInstance(): SecureCardStorage {
    if (!SecureCardStorage.instance) {
      SecureCardStorage.instance = new SecureCardStorage();
    }
    return SecureCardStorage.instance;
  }

  // Kart bilgilerini güvenli şekilde sakla
  public storeCardInfo(merchantPaymentId: string, cardInfo: CardInfo): string {
    const sessionId = this.generateSecureSessionId();
    const expiresAt = Date.now() + this.SESSION_TIMEOUT;

    // Kart numarasını mask'le (log için)
    const maskedNumber = cardInfo.number.replace(/(.{4})(.*)(.{4})/, '$1****$3');

    this.sessions.set(sessionId, {
      cardInfo: { ...cardInfo },
      sessionId,
      expiresAt,
      merchantPaymentId
    });

    return sessionId;
  }

  // Session ID ile kart bilgilerini al
  public getCardInfo(sessionId: string): CardInfo | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session.cardInfo;
  }

  // Session'ı temizle (kullanım sonrası)
  public clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Kart bilgilerini güvenli şekilde temizle
      session.cardInfo.number = '';
      session.cardInfo.cvc = '';
      session.cardInfo.holderName = '';
    }
    
    this.sessions.delete(sessionId);
  }

  // Merchant Payment ID ile session bul
  public findSessionByMerchantId(merchantPaymentId: string): string | null {
    const entries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of entries) {
      if (session.merchantPaymentId === merchantPaymentId && Date.now() <= session.expiresAt) {
        return sessionId;
      }
    }
    return null;
  }

  // Güvenli session ID oluştur
  private generateSecureSessionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `SECURE_${timestamp}_${random}`;
  }

  // Periyodik temizlik
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      const entries = Array.from(this.sessions.entries());
      for (const [sessionId, session] of entries) {
        if (now > session.expiresAt) {
          this.clearSession(sessionId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
      }
    }, 60000); // Her dakika kontrol et
  }

  // Debug bilgisi
  public getSessionInfo(): { total: number; active: number } {
    const now = Date.now();
    const active = Array.from(this.sessions.values()).filter(s => now <= s.expiresAt).length;
    
    return {
      total: this.sessions.size,
      active: active
    };
  }
}

export const secureCardStorage = SecureCardStorage.getInstance();
export type { CardInfo }; 