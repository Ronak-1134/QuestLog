import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatHours = (hours) => {
  if (hours == null) return '—';
  if (hours < 1)     return `${Math.round(hours * 60)}m`;
  if (hours < 10)    return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
};

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date));

export const formatRelative = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);

  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return formatDate(date);
};

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);

export const slugify = (str) =>
  str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

export const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};