/**
 * TSS Flow - DataLayer Utils
 */

declare global {
    interface Window {
        dataLayer: any[];
    }
}

const pushToDataLayer = (eventData: any): void => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push(eventData);
    }
};

export const pushTssStep1Complete = (): void => {
    pushToDataLayer({
        event: 'tss_formsubmit',
        form_name: 'tss_step1',
    });
};

export const pushTssStep2Complete = (): void => {
    pushToDataLayer({
        event: 'tss_formsubmit',
        form_name: 'tss_step2',
    });
};

export const pushTssQuoteSuccess = (): void => {
    pushToDataLayer({
        event: 'tss_formsubmit',
        form_name: 'tss_teklif_basarili',
    });
};

export const pushTssQuoteFailed = (): void => {
    pushToDataLayer({
        event: 'tss_formsubmit',
        form_name: 'tss_teklif_basarisiz',
    });
};

export const pushTssPurchaseClick = (
    quoteId: string,
    company: string | undefined,
    price: number | undefined
): void => {
    pushToDataLayer({
        event: 'tss_satinal',
        quote_id: quoteId,
        company: company,
        price: price,
    });
};

export const pushTssPaymentSuccess = (): void => {
    pushToDataLayer({
        event: 'tss_satinal',
        form_name: 'tss_odeme_basarili',
    });
};

export const pushTssPaymentFailed = (): void => {
    pushToDataLayer({
        event: 'tss_satinal',
        form_name: 'tss_odeme_basarisiz',
    });
};

