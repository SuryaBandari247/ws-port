export interface WithSwagApp {
  name: string;
  path: string;
  icon: string;
  description: string;
}

export const WITHSWAG_APPS: WithSwagApp[] = [
  { name: 'Passport Photo', path: '/portrait/', icon: 'Camera', description: 'Passport & visa photos for 50+ countries' },
  { name: 'Photo Guides', path: '/guides/', icon: 'BookOpen', description: 'Country-specific photo requirements' },
];
