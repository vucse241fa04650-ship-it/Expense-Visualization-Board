// Single source of truth for categories. Colors live in index.css as tokens;
// charts read them via CSS variables, UI via static Tailwind classes.
export const CATEGORIES = [
  'Food',
  'Travel',
  'Education',
  'Entertainment',
  'Shopping',
  'Other',
]

export const CATEGORY_META = {
  Food: {
    emoji: '🍔',
    cssVar: 'var(--color-cat-food)',
    tint: 'bg-cat-food/15',
    dot: 'bg-cat-food',
    border: 'border-cat-food',
    solid: 'bg-cat-food border-cat-food text-black',
    border_l: 'border-l-cat-food',
  },
  Travel: {
    emoji: '🚌',
    cssVar: 'var(--color-cat-travel)',
    tint: 'bg-cat-travel/15',
    dot: 'bg-cat-travel',
    border: 'border-cat-travel',
    solid: 'bg-cat-travel border-cat-travel text-black',
    border_l: 'border-l-cat-travel',
  },
  Education: {
    emoji: '📚',
    cssVar: 'var(--color-cat-education)',
    tint: 'bg-cat-education/15',
    dot: 'bg-cat-education',
    border: 'border-cat-education',
    solid: 'bg-cat-education border-cat-education text-black',
    border_l: 'border-l-cat-education',
  },
  Entertainment: {
    emoji: '🎮',
    cssVar: 'var(--color-cat-entertainment)',
    tint: 'bg-cat-entertainment/15',
    dot: 'bg-cat-entertainment',
    border: 'border-cat-entertainment',
    solid: 'bg-cat-entertainment border-cat-entertainment text-black',
    border_l: 'border-l-cat-entertainment',
  },
  Shopping: {
    emoji: '🛍️',
    cssVar: 'var(--color-cat-shopping)',
    tint: 'bg-cat-shopping/15',
    dot: 'bg-cat-shopping',
    border: 'border-cat-shopping',
    solid: 'bg-cat-shopping border-cat-shopping text-black',
    border_l: 'border-l-cat-shopping',
  },
  Other: {
    emoji: '💼',
    cssVar: 'var(--color-cat-other)',
    tint: 'bg-cat-other/15',
    dot: 'bg-cat-other',
    border: 'border-cat-other',
    solid: 'bg-cat-other border-cat-other text-white',
    border_l: 'border-l-cat-other',
  },
}
