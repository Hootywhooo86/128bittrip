/** The five main tabs, shared by the native and web tab bars. */
export const TABS = [
  { name: 'index', href: '/', label: 'Quests', icon: require('@/assets/images/tabIcons/quests.png') },
  { name: 'trips', href: '/trips', label: 'Trips', icon: require('@/assets/images/tabIcons/trips.png') },
  { name: 'book', href: '/book', label: 'Book', icon: require('@/assets/images/tabIcons/book.png') },
  { name: 'ai', href: '/ai', label: 'Trip AI', icon: require('@/assets/images/tabIcons/ai.png') },
  { name: 'passport', href: '/passport', label: 'Passport', icon: require('@/assets/images/tabIcons/passport.png') },
] as const;
