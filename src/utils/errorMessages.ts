import i18n from '../locales';

export const getErrorMessage = (code: string, metadata?: any): string => {
    const { t, te } = i18n.global;

    if (code === 'RATE_LIMIT_EXCEEDED' && metadata?.retryAfter) {
        return t('errors.RATE_LIMIT_EXCEEDED_RETRY', { retryAfter: metadata.retryAfter });
    }
    if (code === 'NICKNAME_TOO_LONG' && metadata?.maxLength) {
        return t('errors.NICKNAME_TOO_LONG_LIMIT', { maxLength: metadata.maxLength });
    }
    if (code === 'VALIDATION_FAILED' && metadata?.reason) {
        return t('errors.VALIDATION_FAILED_REASON', { reason: metadata.reason });
    }

    if (te(`errors.${code}`)) {
        return t(`errors.${code}`);
    }

    return t('errors.UNKNOWN_ERROR', { code });
};