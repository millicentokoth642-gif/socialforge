import { Post } from '../services/store';

export interface ProfileTemplate {
  id: string;
  name: string;
  platform: Post['platform'] | 'linkedin' | 'whatsapp' | 'reddit' | 'pinterest';
  displayName: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  followersCount: string;
  followingCount: string;
  isVerified: boolean;
  professionalType: string;
  postsCount: string;
  themeColor: string;
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: 'ig-influencer',
    name: 'Lifestyle Influencer',
    platform: 'instagram',
    displayName: 'Aria Sky',
    handle: '@ariasky_official',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&h=256&auto=format&fit=crop',
    bio: '✨ Dreamer | Explorer | Creator\n📍 Based in LA\n💌 Collabs: aria@sky.com\n"Life is a canvas, make it colorful"',
    followersCount: '452K',
    followingCount: '842',
    isVerified: true,
    professionalType: 'Digital Creator',
    postsCount: '1,240',
    themeColor: '#E1306C'
  },
  {
    id: 'x-tech-visionary',
    name: 'Tech Visionary',
    platform: 'x',
    displayName: 'Marcus Void',
    handle: '@mvoid_tech',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Building the future of Neural Networks. AI Ethics Advocate. Coffee is the primary energy source.',
    followersCount: '1.2M',
    followingCount: '42',
    isVerified: true,
    professionalType: 'CEO at Void.ai',
    postsCount: '12.4K',
    themeColor: '#000000'
  },
  {
    id: 'li-professional',
    name: 'Corporate Executive',
    platform: 'linkedin',
    displayName: 'Sarah Jenkins',
    handle: 'sarah-jenkins-mba',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Strategic Operations Leader | Growth Architect | Mentor | Focused on scaling tech startups through sustainable leadership.',
    followersCount: '15.2K',
    followingCount: '500+',
    isVerified: true,
    professionalType: 'Chief Operations Officer',
    postsCount: '156',
    themeColor: '#0077B5'
  },
  {
    id: 'tt-creator',
    name: 'TikTok Star',
    platform: 'tiktok',
    displayName: 'Kody Vibe',
    handle: '@kody_energy',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Energy is contagious! ⚡️\nDaily laughs and transitions\nCheck my latest vlog below! 👇',
    followersCount: '8.4M',
    followingCount: '120',
    isVerified: true,
    professionalType: 'Entertainer',
    postsCount: '452',
    themeColor: '#FE2C55'
  },
  {
    id: 'fb-gaming',
    name: 'Pro Gamer',
    platform: 'facebook',
    displayName: 'Ghost Sniper',
    handle: 'GhostSniperGaming',
    avatarUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Competitive FPS Player | Team Vortex | Streaming daily at 8PM PST 🎮',
    followersCount: '125K',
    followingCount: '0',
    isVerified: true,
    professionalType: 'Gaming Video Creator',
    postsCount: '8.5K',
    themeColor: '#1877F2'
  },
  {
    id: 'yt-channel',
    name: 'Science Educator',
    platform: 'youtube',
    displayName: 'Cosmos Curiosity',
    handle: '@CosmosCuriosity',
    avatarUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Exploring the universe one video at a time. Physics, Astronomy, and the unknown explained simply.',
    followersCount: '2.4M',
    followingCount: '0',
    isVerified: true,
    professionalType: 'Educational Channel',
    postsCount: '320',
    themeColor: '#FF0000'
  },
  {
    id: 'wa-business',
    name: 'Small Business Owner',
    platform: 'whatsapp',
    displayName: 'The Artisan Bakery',
    handle: '+1 234 567 8900',
    avatarUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Freshly baked sourdough and pastries delivered daily. Pre-order via the catalog! 🥐🥖☕️',
    followersCount: '5.2K',
    followingCount: '0',
    isVerified: true,
    professionalType: 'Bakery & Cafe',
    postsCount: 'Catalog: 42 Items',
    themeColor: '#25D366'
  },
  {
    id: 'rd-moderator',
    name: 'Community Lead',
    platform: 'reddit',
    displayName: 'u/CodeMaster_88',
    handle: 'r/webdev',
    avatarUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Senior Software Engineer | Mod at r/webdev | Sharing daily insights on React, Vue, and the future of the web.',
    followersCount: '42.5K Karma',
    followingCount: '3.2K',
    isVerified: false,
    professionalType: 'Top Contributor',
    postsCount: '840 Posts',
    themeColor: '#FF4500'
  },
  {
    id: 'pn-curator',
    name: 'Interior Designer',
    platform: 'pinterest',
    displayName: 'Mila Designs',
    handle: '@mila_interiors',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&auto=format&fit=crop',
    bio: 'Minimalist Interior Enthusiast | Curating timeless spaces for modern living. Follow for daily inspiration ✨',
    followersCount: '2.5M Monthly Views',
    followingCount: '450',
    isVerified: true,
    professionalType: 'Interior Designer',
    postsCount: '15.4K Pins',
    themeColor: '#E60023'
  }
];
