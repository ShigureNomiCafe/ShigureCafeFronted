import i18n from '../locales';

const { t } = i18n.global;

export const formatStatus = (status: string | undefined) => {
  if (!status) return '';
  const key = `common.statuses.${status}`;
  const translated = t(key);
  return translated === key ? status : translated;
};

export const formatRole = (role: string | undefined) => {
  if (!role) return '';
  const key = `common.roles.${role}`;
  const translated = t(key);
  return translated === key ? role : translated;
};

export const truncateText = (text: string | null | undefined, length = 30) => {
  if (!text) return '';
  if (text.length > length) {
    return text.substring(0, length) + '...';
  }
  return text;
};

export const formatDateTime = (timestamp: number) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const locale = i18n.global.locale.value || i18n.global.locale;
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};
