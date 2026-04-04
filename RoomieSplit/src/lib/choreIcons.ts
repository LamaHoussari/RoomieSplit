const CHORE_ICON_RULES = [
  { keywords: ['trash', 'garbage', 'bin', 'recycling', 'recycle'], icons: ['🗑️', '♻️'] },
  { keywords: ['dish', 'dishes', 'dishwasher', 'plate'], icons: ['🍽️', '🫧'] },
  { keywords: ['laundry', 'wash', 'dryer', 'fold', 'clothes'], icons: ['🧺', '👕'] },
  { keywords: ['vacuum', 'sweep', 'mop', 'floor'], icons: ['🧹', '🪣'] },
  { keywords: ['bathroom', 'toilet', 'shower', 'sink'], icons: ['🧼', '🚿'] },
  { keywords: ['kitchen', 'counter', 'fridge', 'stove'], icons: ['🍳', '🧽'] },
  { keywords: ['dust', 'wipe', 'clean'], icons: ['🧽', '✨'] },
  { keywords: ['grocer', 'shopping', 'shop', 'market'], icons: ['🛒', '🥬'] },
  { keywords: ['bill', 'rent', 'payment', 'utility'], icons: ['🧾', '💸'] },
  { keywords: ['pet', 'cat', 'dog', 'litter', 'feed'], icons: ['🐾', '🦴'] },
  { keywords: ['plant', 'water'], icons: ['🪴', '💧'] },
  { keywords: ['bed', 'sheet', 'linen'], icons: ['🛏️', '🧺'] },
  { keywords: ['organize', 'tidy', 'declutter'], icons: ['🗂️', '✨'] },
] as const;

const DEFAULT_CHORE_ICONS = ['🧹', '🧽', '✨', '📋', '🏠'] as const;

function hashText(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  }
  return hash;
}

function pickDeterministically(icons: readonly string[], seed: string) {
  return icons[hashText(seed) % icons.length];
}

export function getChoreIcon(title: string) {
  const normalizedTitle = title.trim().toLowerCase();
  const seed = normalizedTitle || 'chore';

  for (const rule of CHORE_ICON_RULES) {
    if (rule.keywords.some(keyword => normalizedTitle.includes(keyword))) {
      return pickDeterministically(rule.icons, seed);
    }
  }

  return pickDeterministically(DEFAULT_CHORE_ICONS, seed);
}
