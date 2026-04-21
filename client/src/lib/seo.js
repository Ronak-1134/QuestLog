const BASE = {
  title:       'QuestLog — Track Your Games. Know Your Time.',
  description: 'Community-sourced game completion times, Steam sync, and playtime analytics. Free forever.',
  image:       'https://questlog.gg/og-image.png',
  url:         'https://questlog.gg',
};

const setMeta = (name, content, attr = 'name') => {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setLink = (rel, href) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export const setSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
  noindex = false,
} = {}) => {
  const t = title       ? `${title} — QuestLog` : BASE.title;
  const d = description ?? BASE.description;
  const i = image       ?? BASE.image;
  const u = url         ?? BASE.url;

  // Title
  document.title = t;

  // Primary
  setMeta('description', d);
  setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
  setLink('canonical', u);

  // OG
  setMeta('og:title',       t,    'property');
  setMeta('og:description', d,    'property');
  setMeta('og:image',       i,    'property');
  setMeta('og:url',         u,    'property');
  setMeta('og:type',        type, 'property');

  // Twitter
  setMeta('twitter:title',       t);
  setMeta('twitter:description', d);
  setMeta('twitter:image',       i);
};

export const setGameSEO = (game) => {
  if (!game) return;

  const median = game.playtimeStats?.mainStory?.median;
  const timeStr = median ? ` · ~${median}h to beat` : '';

  setSEO({
    title:       game.name,
    description: game.summary
      ? `${game.summary.slice(0, 140)}…${timeStr}`
      : `Track your ${game.name} playtime${timeStr}. Community completion times and stats on QuestLog.`,
    image:       game.artworks?.[0] ?? game.cover ?? BASE.image,
    url:         `https://questlog.gg/games/${game.slug}`,
    type:        'article',
  });
};

export const resetSEO = () => setSEO();