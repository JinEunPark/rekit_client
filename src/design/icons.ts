// SVG path data for line icons used across the app.
// Each entry returns inner <svg> markup; rendered inside IconBase.vue.

export type IconName =
  | 'home' | 'search' | 'user' | 'cart' | 'heart'
  | 'chevronRight' | 'chevronLeft' | 'chevronDown'
  | 'close' | 'check' | 'plus' | 'minus'
  | 'filter' | 'sort' | 'truck' | 'shield' | 'box'
  | 'info' | 'warning' | 'bell' | 'star' | 'grid' | 'list'
  | 'leaf' | 'phone' | 'mail' | 'lock'
  | 'arrowRight' | 'arrowLeft' | 'edit' | 'trash'
  | 'chart' | 'refresh' | 'eye' | 'menu' | 'map'
  | 'wallet' | 'download' | 'settings'

export const ICON_PATHS: Record<IconName, string> = {
  home: '<path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="M16 16l4 4" />',
  user: '<circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />',
  cart: '<path d="M4 4h2.5l2.6 11.5a2 2 0 0 0 2 1.5h7.4a2 2 0 0 0 2-1.5L22 7H7" /><circle cx="10" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />',
  heart: '<path d="M12 20.5c-1-.7-8.5-5.7-8.5-11A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8.5 2.5c0 5.3-7.5 10.3-8.5 11z" />',
  chevronRight: '<path d="M9 6l6 6-6 6" />',
  chevronLeft: '<path d="M15 6l-6 6 6 6" />',
  chevronDown: '<path d="M6 9l6 6 6-6" />',
  close: '<path d="M5 5l14 14" /><path d="M19 5L5 19" />',
  check: '<path d="M4 12l5 5L20 6" />',
  plus: '<path d="M12 5v14" /><path d="M5 12h14" />',
  minus: '<path d="M5 12h14" />',
  filter: '<path d="M3 5h18" /><path d="M6 12h12" /><path d="M10 19h4" />',
  sort: '<path d="M3 6h13" /><path d="M3 12h9" /><path d="M3 18h5" /><path d="M17 4v16" /><path d="M14 17l3 3 3-3" />',
  truck: '<path d="M2 6h11v10H2z" /><path d="M13 9h4l4 4v3h-8z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" />',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />',
  box: '<path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /><path d="M12 11v10" />',
  info: '<circle cx="12" cy="12" r="9" /><path d="M12 8v.01" /><path d="M12 12v5" />',
  warning: '<path d="M12 3l10 18H2z" /><path d="M12 10v5" /><path d="M12 18v.01" />',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7" /><path d="M10 21h4" />',
  star: '<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9z" />',
  grid: '<rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />',
  list: '<path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />',
  leaf: '<path d="M5 19c0-8 6-14 16-14 0 10-6 16-14 16-1.5 0-2-1-2-2z" /><path d="M5 19c4-4 7-7 12-12" />',
  phone: '<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2z" />',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />',
  arrowRight: '<path d="M5 12h14" /><path d="M13 6l6 6-6 6" />',
  arrowLeft: '<path d="M19 12H5" /><path d="M11 6l-6 6 6 6" />',
  edit: '<path d="M4 20h4l11-11-4-4L4 16z" /><path d="M14 5l4 4" />',
  trash: '<path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />',
  chart: '<path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" />',
  refresh: '<path d="M4 4v6h6" /><path d="M20 20v-6h-6" /><path d="M4 10a8 8 0 0 1 14-3" /><path d="M20 14a8 8 0 0 1-14 3" />',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />',
  menu: '<path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" />',
  map: '<path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14" /><path d="M15 6v14" />',
  wallet: '<path d="M3 7h18v12H3z" /><path d="M3 7l3-3h12l3 3" /><circle cx="17" cy="13" r="1.5" />',
  download: '<path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" />',
  settings:
    '<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />',
}
