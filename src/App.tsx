import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  Edit3, 
  LayoutDashboard, 
  MessageSquare, 
  LogOut,
  User,
  BadgeCheck,
  Check,
  CheckCheck,
  Search,
  Image as ImageIcon,
  Send,
  Download,
  Upload,
  Camera,
  X,
  Smile,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Play,
  Flame,
  Music,
  Globe,
  Calendar,
  Layers,
  ShieldCheck,
  Video,
  List,
  Target,
  BarChart,
  LineChart,
  Users
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from './AuthContext';
import { postService, profileService, type Post, type Profile } from './services/store';
import { cn } from './lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Cropper from 'react-easy-crop';
import { TemplateWidget } from './components/TemplateWidget';
import { ProfileTemplate } from './constants/templates';

export default function App() {
  const { user, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'chats' | 'dashboard' | 'profile'>('feed');
  const [currentPlatform, setCurrentPlatform] = useState<Post['platform']>('x');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPostImage, setSelectedPostImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [dashboardMetrics, setDashboardMetrics] = useState({
    facebook: { reach: '1.4M', engagement: '45.2k', followers: '2.3k', reachDelta: '+24.5%', engagementDelta: '+12.8%', followersDelta: '+5.2%' },
    instagram: { reached: '8.4M', reachedDelta: '+12%', engaged: '452k', engagedDelta: '+8.4%', totalFollowers: '12.4M' },
    x: { totalSpend: '$50,650', spendDelta: '+$12k', impressions: '7.8M', impressionsDelta: '+18%', conversions: '12.4k', conversionsDelta: '+5%' },
    tiktok: { views: '4.5B', viewsDelta: '+14.2%', profileViews: '84M', profileViewsDelta: '+2.1%', likes: '122M', likesDelta: '+8.5%', comments: '1.2M', commentsDelta: '+4.2%' },
    youtube: { realtimeViews: '14,203', subscribers: '2,402,192', subsDelta: '+1.2k', watchTime: '45.1k', watchTimeDelta: '+3k', revenue: '$12,402', revenueDelta: '+$450' }
  });

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const [editingMetric, setEditingMetric] = useState<{ path: string, label: string, value: string } | null>(null);
  const [postEditFormData, setPostEditFormData] = useState({
    content: '',
    imageUrl: '',
    createdAt: '',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    retweetsCount: 0,
    reactions: {
      like: 0,
      love: 0,
      care: 0,
      haha: 0,
      wow: 0,
      sad: 0,
      angry: 0
    }
  });

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostEditFormData({
      content: post.content,
      imageUrl: post.imageUrl || '',
      createdAt: post.createdAt?.toDate ? new Date(post.createdAt.toDate().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      sharesCount: post.sharesCount || 0,
      retweetsCount: post.retweetsCount || 0,
      reactions: post.reactions || {
        like: 0,
        love: 0,
        care: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
      }
    });
  };

  const savePostEdit = async () => {
    if (!editingPost?.id) return;
    try {
      const updates: any = {
        content: postEditFormData.content,
        imageUrl: postEditFormData.imageUrl || null,
        likesCount: Number(postEditFormData.likesCount),
        commentsCount: Number(postEditFormData.commentsCount),
        sharesCount: Number(postEditFormData.sharesCount),
        retweetsCount: Number(postEditFormData.retweetsCount),
        reactions: postEditFormData.reactions
      };
      
      if (postEditFormData.createdAt) {
        updates.createdAt = new Date(postEditFormData.createdAt);
      }

      await postService.updatePost(editingPost.id, updates);
      setEditingPost(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Messenger Mockup State
  const [chatPlatform, setChatPlatform] = useState<string>('messenger');
  const [mockUser, setMockUser] = useState({
    name: 'Elon Musk',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elon',
    verified: true,
    online: true
  });
  const [showMockUserEdit, setShowMockUserEdit] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const postFileInputRef = useRef<HTMLInputElement>(null);

  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedPostImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageToCrop(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [profileFormData, setProfileFormData] = useState({
    displayName: user?.displayName || '',
    avatarUrl: editingProfile?.avatarUrl || '',
    professionalType: 'Content Creator',
    bio: '',
    followersCount: '1.2M'
  });
  const [showPostEmojiPicker, setShowPostEmojiPicker] = useState(false);
  const commonEmojis = ['😊', '😂', '🔥', '❤️', '👍', '🙌', '✨', '😍', '🤔', '😎', '💀', '💯', '📍', '✅', '❌'];
  const [showMockupEditor, setShowMockupEditor] = useState(false);
  const [mockupEditorContent, setMockupEditorContent] = useState('');

  const saveProfile = async () => {
    try {
      await profileService.updateProfile(profileFormData);
      setEditingProfile(profileFormData as any);
      setActiveTab('feed');
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = postService.subscribeToPosts(setPosts);
      profileService.subscribeToProfile(user.uid, setEditingProfile);
      return unsubscribe;
    }
  }, [user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      await postService.createPost(
        newPostContent, 
        currentPlatform, 
        selectedPostImage || undefined,
        editingProfile ? { name: editingProfile.displayName, avatar: editingProfile.avatarUrl } : undefined
      );
      setNewPostContent('');
      setSelectedPostImage(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const platforms: { id: Post['platform']; label: string; color: string }[] = [
    { id: 'x', label: 'X (Twitter)', color: 'bg-zinc-950' },
    { id: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
    { id: 'instagram', label: 'Instagram', color: 'bg-pink-600' },
    { id: 'tiktok', label: 'TikTok', color: 'bg-black' },
    { id: 'youtube', label: 'YouTube', color: 'bg-red-600' },
    { id: 'snapchat', label: 'Snapchat', color: 'bg-yellow-400' },
    { id: 'telegram', label: 'Telegram', color: 'bg-sky-500' },
    { id: 'whatsapp' as any, label: 'WhatsApp', color: 'bg-emerald-500' },
    { id: 'reddit' as any, label: 'Reddit', color: 'bg-orange-600' },
    { id: 'linkedin' as any, label: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'pinterest' as any, label: 'Pinterest', color: 'bg-red-700' },
  ];

  const exportData = async () => {
    if (!mockupRef.current) return;
    
    try {
      const element = mockupRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f8fafc', // slate-50
        onclone: (clonedDoc) => {
          // Fix for oklch and oklab color parsing error in html2canvas
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const style = styleTags[i];
            if (style.innerHTML.includes('oklch') || style.innerHTML.includes('oklab')) {
              style.innerHTML = style.innerHTML
                .replace(/oklch\([^)]+\)/g, '#64748b')
                .replace(/oklab\([^)]+\)/g, '#64748b');
            }
          }

          // Fix for inline styles
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.getAttribute && el.getAttribute('style')) {
              const style = el.getAttribute('style')!;
              if (style.includes('oklch') || style.includes('oklab')) {
                el.setAttribute('style', style
                  .replace(/oklch\([^)]+\)/g, '#64748b')
                  .replace(/oklab\([^)]+\)/g, '#64748b')
                );
              }
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`social-forge-mockup-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const exportSinglePost = async (postId: string) => {
    const element = document.getElementById(`post-${postId}`);
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            const style = styleTags[i];
            if (style.innerHTML.includes('oklch') || style.innerHTML.includes('oklab')) {
              style.innerHTML = style.innerHTML
                .replace(/oklch\([^)]+\)/g, '#64748b')
                .replace(/oklab\([^)]+\)/g, '#64748b');
            }
          }
          const allElements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.getAttribute && el.getAttribute('style')) {
              const style = el.getAttribute('style')!;
              if (style.includes('oklch') || style.includes('oklab')) {
                el.setAttribute('style', style
                  .replace(/oklch\([^)]+\)/g, '#64748b')
                  .replace(/oklab\([^)]+\)/g, '#64748b')
                );
              }
            }
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`post-${postId}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating post PDF:', error);
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        setMockupEditorContent(content);
        setShowMockupEditor(true);
      } catch (e) {
        console.error('Import error', e);
      }
    };
    reader.readAsText(file);
  };

  const applyMockupChanges = () => {
    try {
      const data = JSON.parse(mockupEditorContent);
      if (data.posts) setPosts(data.posts);
      if (data.profile) setEditingProfile(data.profile);
      setShowMockupEditor(false);
    } catch (e) {
      console.error('Invalid JSON format. Please check your edits.');
    }
  };

  const handleOpenProfileEdit = () => {
    if (editingProfile) {
      setProfileFormData({
        displayName: editingProfile.displayName || user?.displayName || '',
        avatarUrl: editingProfile.avatarUrl || '',
        professionalType: editingProfile.professionalType || 'Content Creator',
        bio: editingProfile.bio || '',
        followersCount: '1.2M'
      });
    }
    setActiveTab('profile');
  };

  const handleMetricUpdate = (newValue: string) => {
    if (!editingMetric) return;
    const [platform, key] = editingMetric.path.split('.');
    setDashboardMetrics(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform as keyof typeof prev],
        [key]: newValue
      }
    }));
    setEditingMetric(null);
  };

  const handleSelectTemplate = (template: ProfileTemplate) => {
    setProfileFormData({
      displayName: template.displayName,
      avatarUrl: template.avatarUrl,
      professionalType: template.professionalType,
      bio: template.bio,
      followersCount: template.followersCount
    });
    setCurrentPlatform(template.platform as any);
    setActiveTab('profile');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-sm px-6"
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl font-bold font-display shadow-2xl skew-x-2">S</div>
          <h1 className="text-5xl font-display font-bold tracking-tight mb-3">SocialForge</h1>
          <p className="text-slate-400 mb-8 font-sans text-sm leading-relaxed">
            The ultimate playground for simulation. Create fake feeds, mock messengers, and edit pro dashboards across 50+ platforms.
          </p>
          <button 
            onClick={signIn}
            className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            <User size={18} />
            Initialize Simulation
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAvatarUpload} 
        accept="image/*" 
        className="hidden" 
      />
      
      {imageToCrop && (
        <ImageCropperModal 
          image={imageToCrop} 
          onCancel={() => setImageToCrop(null)} 
          onCropComplete={(img) => {
            if (activeTab === 'profile') {
              setProfileFormData({ ...profileFormData, avatarUrl: img });
            } else {
              setMockUser({ ...mockUser, avatar: img });
            }
            setImageToCrop(null);
          }} 
        />
      )}

      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col p-4 z-50">
        <div className="hidden lg:flex items-center gap-2 mb-10 px-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">S</div>
          <span className="text-xl font-bold tracking-tight">Social<span className="text-indigo-600">Forge</span></span>
        </div>
        
        <div className="flex md:flex-col gap-1.5 flex-1 justify-around md:justify-start">
          <NavButton active={activeTab === 'feed'} icon={MessageCircle} label="Post Simulator" onClick={() => setActiveTab('feed')} />
          <NavButton active={activeTab === 'chats'} icon={MessageSquare} label="Messenger Mockup" onClick={() => setActiveTab('chats')} />
          <NavButton active={activeTab === 'dashboard'} icon={LayoutDashboard} label="Stats Editor" onClick={() => setActiveTab('dashboard')} />
          <NavButton active={activeTab === 'profile'} icon={User} label="Profile Editor" onClick={() => { handleOpenProfileEdit(); setActiveTab('profile'); }} />
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 hidden md:flex flex-col gap-1">
          <div className="p-4 bg-slate-900 rounded-2xl text-white mb-4 hidden lg:block">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Simulation Tier</div>
            <div className="font-bold text-sm mb-2 flex items-center gap-1.5">
              PRO Verified <BadgeCheck size={14} className="text-indigo-400 fill-indigo-400" />
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-4/5 rounded-full" />
            </div>
          </div>
          <label className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer text-sm font-medium">
            <Upload size={18} />
            Import Mockup
            <input type="file" className="hidden" onChange={importData} accept=".json" />
          </label>
          <button onClick={exportData} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
            <Download size={18} />
            <span className="hidden lg:inline text-sm font-medium">Export Mockup</span>
          </button>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={18} />
            <span className="hidden lg:inline text-sm font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header / Platform Switcher */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 h-full min-w-max">
            {platforms.map((p) => (
              <button 
                key={p.id}
                onClick={() => setCurrentPlatform(p.id)}
                className={cn(
                  "h-full px-1 border-b-2 text-sm font-semibold transition-all flex items-center gap-2",
                  currentPlatform === p.id 
                    ? "border-indigo-600 text-indigo-600" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", p.color)} />
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Sync Active</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10" ref={mockupRef}>
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div 
                   key="profile-editor"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="max-w-2xl mx-auto"
                >
                  <div className="bg-white rounded-[32px] p-10 shadow-xl border border-slate-200/60">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h2 className="text-3xl font-display font-medium mb-1">Identity Management</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Account & Brand Appearance</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <User size={24} />
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="flex flex-col items-center">
                         <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="w-32 h-32 rounded-[40px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden cursor-pointer group relative mb-4"
                         >
                            <img src={profileFormData.avatarUrl || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-indigo-600/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <Camera size={32} className="text-white mb-1" />
                              <span className="text-[10px] font-black uppercase text-white tracking-widest">Change Photo</span>
                            </div>
                         </div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Profile Avatar</p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Display Name</label>
                           <input 
                             type="text" 
                             value={profileFormData.displayName}
                             onChange={(e) => setProfileFormData({...profileFormData, displayName: e.target.value})}
                             placeholder="e.g. Romeo Jrr"
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-indigo-500/20 text-slate-700 font-medium transition-all"
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Title</label>
                           <input 
                             type="text" 
                             value={profileFormData.professionalType}
                             onChange={(e) => setProfileFormData({...profileFormData, professionalType: e.target.value})}
                             placeholder="e.g. Content Creator"
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-indigo-500/20 text-slate-700 font-medium transition-all"
                           />
                         </div>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About / Bio</label>
                         <textarea 
                           value={profileFormData.bio}
                           onChange={(e) => setProfileFormData({...profileFormData, bio: e.target.value})}
                           placeholder="Tell your audience about yourself..."
                           className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-indigo-500/20 text-slate-700 font-medium transition-all h-32 resize-none"
                         />
                       </div>

                       <div className="pt-6 flex gap-4">
                         <button 
                           onClick={() => setActiveTab('feed')}
                           className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={saveProfile}
                           className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                         >
                           <Check size={20} />
                           Save Profile Changes
                         </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'feed' && (
                <motion.div 
                  key={`feed-${currentPlatform}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8"
                >
                  <div className="space-y-6">
                    {/* Create Post Area */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Post Mockup Creator</h2>
                      <form onSubmit={handleCreatePost}>
                        <div className="relative">
                          <textarea 
                            placeholder={`Fake an ${currentPlatform} update...`}
                            className="w-full p-4 text-base resize-none outline-none min-h-[120px] bg-slate-50 rounded-2xl border border-slate-100 focus:border-indigo-200 transition-colors"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPostEmojiPicker(!showPostEmojiPicker)}
                            className="absolute bottom-4 right-4 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Smile size={20} />
                          </button>

                          <AnimatePresence>
                            {showPostEmojiPicker && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full right-0 mb-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 grid grid-cols-5 gap-2 z-20"
                              >
                                {commonEmojis.map(emoji => (
                                  <button 
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      setNewPostContent(prev => prev + emoji);
                                      setShowPostEmojiPicker(false);
                                    }}
                                    className="text-xl hover:scale-125 transition-transform"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {selectedPostImage && (
                          <div className="mt-4 relative group w-32 aspect-square rounded-xl overflow-hidden border">
                            <img src={selectedPostImage} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button"
                              onClick={() => setSelectedPostImage(null)}
                              className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4">
                          <div className="flex gap-1.5 text-slate-400">
                             <input 
                               type="file" 
                               ref={postFileInputRef} 
                               onChange={handlePostImageSelect} 
                               className="hidden" 
                               accept="image/*" 
                             />
                            <button 
                              type="button" 
                              onClick={() => postFileInputRef.current?.click()}
                              className="p-2.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <ImageIcon size={20} />
                            </button>
                            <button type="button" className="p-2.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                              <MoreHorizontal size={20} />
                            </button>
                          </div>
                          <button 
                            disabled={isPosting || !newPostContent.trim()}
                            className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                          >
                            {isPosting ? 'Injecting...' : `Post to ${currentPlatform}`}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Feed Items */}
                    <div className="space-y-4">
                      {posts.filter(p => !currentPlatform || p.platform === currentPlatform).map((post) => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          variant={currentPlatform} 
                          onEdit={() => handleEditPost(post)}
                          onDelete={async () => {
                            await postService.deletePost(post.id!);
                          }}
                          onExport={exportSinglePost}
                        />
                      ))}
                      {posts.filter(p => p.platform === currentPlatform).length === 0 && (
                        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                          <p className="text-slate-400 text-sm font-medium">No simulation data for {currentPlatform}. Create some fake noise!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar Widgets */}
                  <div className="space-y-6">
                    <div className="bg-indigo-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-xl">
                      <div className="relative z-10">
                        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Global Interaction</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-display font-bold">1.2M+</span>
                          <span className="text-emerald-400 text-xs font-bold">+12.4%</span>
                        </div>
                        <div className="text-[10px] text-indigo-200 mt-1">Impressions Simulated</div>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-10 blur-sm">
                         <LayoutDashboard size={100} />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Stats</h3>
                      <div className="space-y-3">
                        <QuickStatItem label="Likes Today" value="45.2k" />
                        <QuickStatItem label="Profile Views" value="12k" />
                        <QuickStatItem label="Growth Rate" value="+4.8%" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'chats' && (
                <motion.div 
                  key="chats"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-[calc(100vh-200px)] flex flex-col md:flex-row gap-8"
                >
                  <div className="w-full md:w-80 flex flex-col gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm">
                      <div className="mb-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Interface Skin</label>
                        <select 
                          value={chatPlatform} 
                          onChange={(e) => setChatPlatform(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 ring-indigo-500/20"
                        >
                          <option value="messenger">Messenger</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="telegram">Telegram</option>
                          <option value="x_dm">X DM</option>
                          <option value="ig_dm">Instagram DM</option>
                          <option value="snapchat">Snapchat</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-700 text-sm">Conversations</h2>
                        <Plus size={18} className="text-indigo-600 cursor-pointer" />
                      </div>
                      
                      <button 
                        onClick={() => setShowMockUserEdit(!showMockUserEdit)}
                        className="w-full flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-left"
                      >
                        <div className="relative">
                          <img src={mockUser.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Mock" />
                          {mockUser.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-sm truncate">{mockUser.name}</span>
                            {mockUser.verified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500" />}
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase truncate">Simulation Active</p>
                        </div>
                      </button>

                      <AnimatePresence>
                        {showMockUserEdit && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-4 pt-4 border-t border-slate-100 space-y-3"
                          >
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Name</label>
                              <input 
                                type="text" 
                                value={mockUser.name} 
                                onChange={(e) => setMockUser({...mockUser, name: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs outline-none"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Profile Picture</p>
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                              >
                                <Camera size={12} />
                                Change Avatar
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                <input type="checkbox" checked={mockUser.verified} onChange={(e) => setMockUser({...mockUser, verified: e.target.checked})} /> Verified
                              </label>
                              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                <input type="checkbox" checked={mockUser.online} onChange={(e) => setMockUser({...mockUser, online: e.target.checked})} /> Online
                              </label>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 shadow-lg flex flex-col overflow-hidden">
                    <ChatInterface 
                      platform={chatPlatform as any} 
                      mockUser={mockUser} 
                      onAvatarClick={() => fileInputRef.current?.click()}
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'dashboard' && (
                <motion.div 
                   key={`dashboard-${currentPlatform}`}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display font-medium mb-1">Professional Panel</h2>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{currentPlatform} Social Statistics v4.2</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => {
                          const platformMetrics = dashboardMetrics[currentPlatform as keyof typeof dashboardMetrics];
                          const path = Object.keys(platformMetrics)[0];
                          setEditingMetric({ 
                            path: `${currentPlatform}.${path}`, 
                            label: `Edit ${path.toUpperCase()}`, 
                            value: (platformMetrics as any)[path] 
                          })
                        }}
                        className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"
                       >
                         Edit Stats
                       </button>
                       <button 
                        onClick={handleOpenProfileEdit}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                       >
                         Edit Bio
                       </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {editingMetric && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                      >
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white">
                          <h2 className="text-xl font-bold mb-4">{editingMetric.label}</h2>
                          <input 
                            autoFocus
                            type="text" 
                            defaultValue={editingMetric.value}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleMetricUpdate(e.currentTarget.value);
                              if (e.key === 'Escape') setEditingMetric(null);
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 font-bold text-lg"
                          />
                          <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase">Press Enter to inject new value into simulation</p>
                          <div className="flex gap-3 pt-6">
                            <button onClick={() => setEditingMetric(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
                            <button 
                              onClick={() => {
                                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                handleMetricUpdate(input?.value || '');
                              }} 
                              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Platform Specific Dashboard Content */}
                  {currentPlatform === 'facebook' && <FacebookDashboard metrics={dashboardMetrics.facebook} onEdit={(key, label) => setEditingMetric({ path: `facebook.${key}`, label, value: (dashboardMetrics.facebook as any)[key] })} />}
                  {currentPlatform === 'instagram' && <InstagramDashboard metrics={dashboardMetrics.instagram} onEdit={(key, label) => setEditingMetric({ path: `instagram.${key}`, label, value: (dashboardMetrics.instagram as any)[key] })} />}
                  {currentPlatform === 'x' && <XDashboard metrics={dashboardMetrics.x} onEdit={(key, label) => setEditingMetric({ path: `x.${key}`, label, value: (dashboardMetrics.x as any)[key] })} />}
                  {currentPlatform === 'youtube' && <YouTubeDashboard metrics={dashboardMetrics.youtube} onEdit={(key, label) => setEditingMetric({ path: `youtube.${key}`, label, value: (dashboardMetrics.youtube as any)[key] })} />}
                  {currentPlatform === 'tiktok' && <TikTokDashboard metrics={dashboardMetrics.tiktok} onEdit={(key, label) => setEditingMetric({ path: `tiktok.${key}`, label, value: (dashboardMetrics.tiktok as any)[key] })} />}
                  
                  {/* Default Profile Section (moved down or simplified) */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col mt-12">
                    <div className={cn("h-1.5", platforms.find(p => p.id === currentPlatform)?.color || "bg-indigo-600")} />
                    <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                      <div className="flex flex-col items-center shrink-0">
                        <div 
                          onClick={handleOpenProfileEdit}
                          className="w-24 h-24 bg-slate-50 rounded-[24px] overflow-hidden border-4 border-slate-50 shadow-inner mb-4 cursor-pointer group relative"
                        >
                           <img src={editingProfile?.avatarUrl || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera size={24} className="text-white" />
                           </div>
                        </div>
                        <h3 className="text-lg font-bold flex items-center gap-1.5">
                          {editingProfile?.displayName || user.displayName}
                          <BadgeCheck size={18} className="text-blue-500 fill-blue-500" />
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{currentPlatform} Professional Profile</p>
                      </div>
                      <div className="flex-1 space-y-4">
                         <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-6">
                            "{editingProfile?.bio || "Social Simulation Architect. Creating realities, one mock post at a time. Verified status injected via global forge."}"
                         </p>
                         <div className="flex flex-wrap gap-4 pt-2">
                            <div className="px-4 py-2 bg-slate-50 border rounded-xl text-[10px] font-black uppercase text-slate-400">ID: {user.uid.slice(0, 12)}</div>
                            <div className="px-4 py-2 bg-slate-50 border rounded-xl text-[10px] font-black uppercase text-slate-400">Status: Verified Creator</div>
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      <AnimatePresence>
        {showMockupEditor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] w-full max-w-6xl h-5/6 flex flex-col shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Mockup Data Forge</h2>
                  <p className="text-xs text-slate-500 font-medium">Direct JSON manipulation with live simulation preview</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowMockupEditor(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Discard</button>
                  <button onClick={applyMockupChanges} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Inject Changes</button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Editor Side */}
                <div className="w-1/2 p-6 flex flex-col border-r border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source JSON</span>
                  </div>
                  <textarea 
                    value={mockupEditorContent}
                    onChange={(e) => setMockupEditorContent(e.target.value)}
                    className="flex-1 w-full bg-slate-900 text-indigo-300 font-mono text-xs p-6 rounded-2xl border-none outline-none resize-none shadow-inner leading-relaxed overflow-y-auto"
                    spellCheck={false}
                  />
                </div>
                
                {/* Preview Side */}
                <div className="w-1/2 flex flex-col bg-slate-50/20">
                  <div className="p-6 pb-0 flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulation Preview</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-10">
                    <div className="max-w-md mx-auto space-y-6">
                      {(() => {
                        try {
                          const data = JSON.parse(mockupEditorContent);
                          return (
                            <>
                              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-[24px] mx-auto mb-4 overflow-hidden border-4 border-slate-50 shadow-inner">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-xl">{data.profile?.displayName || 'Mock User'}</h3>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">{data.profile?.professionalType || 'Simulator'}</p>
                              </div>
                              <div className="space-y-4">
                                {data.posts?.map((p: any, i: number) => (
                                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm opacity-80 scale-95 origin-top">
                                    <div className="flex gap-3 mb-3">
                                      <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden" />
                                      <div>
                                        <div className="font-bold text-sm">{p.authorName}</div>
                                        <div className="text-[10px] text-slate-400">{p.platform} simulation</div>
                                      </div>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-3">{p.content}</p>
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        } catch (e) {
                          return (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10">
                               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                                  <Trash2 size={32} />
                               </div>
                               <h3 className="font-bold text-slate-700">Invalid JSON Structure</h3>
                               <p className="text-xs text-slate-400 mt-2">Checking syntax requirements... Ensure all quotes are balanced and comma usage is correct.</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Post</h2>
                <button onClick={() => setEditingPost(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Content</label>
                  <div className="relative">
                    <textarea 
                      value={postEditFormData.content}
                      onChange={(e) => setPostEditFormData({...postEditFormData, content: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 h-32 resize-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPostEmojiPicker(!showPostEmojiPicker)}
                      className="absolute bottom-3 right-3 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Smile size={18} />
                    </button>
                    <AnimatePresence>
                      {showPostEmojiPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 grid grid-cols-5 gap-2 z-[80]"
                        >
                          {commonEmojis.map(emoji => (
                            <button 
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setPostEditFormData(prev => ({ ...prev, content: prev.content + emoji }));
                                setShowPostEmojiPicker(false);
                              }}
                              className="text-xl hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Image URL (simulation)</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    value={postEditFormData.imageUrl}
                    onChange={(e) => setPostEditFormData({...postEditFormData, imageUrl: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Likes Count</label>
                    <input 
                      type="number" 
                      value={postEditFormData.likesCount}
                      onChange={(e) => setPostEditFormData({...postEditFormData, likesCount: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Posted Time (Fake)</label>
                    <input 
                      type="datetime-local" 
                      value={postEditFormData.createdAt}
                      onChange={(e) => setPostEditFormData({...postEditFormData, createdAt: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Comments Count</label>
                    <input 
                      type="number" 
                      value={postEditFormData.commentsCount}
                      onChange={(e) => setPostEditFormData({...postEditFormData, commentsCount: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Shares / Retweets</label>
                    <input 
                      type="number" 
                      value={currentPlatform === 'x' ? postEditFormData.retweetsCount : postEditFormData.sharesCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        if (currentPlatform === 'x') {
                          setPostEditFormData({...postEditFormData, retweetsCount: val});
                        } else {
                          setPostEditFormData({...postEditFormData, sharesCount: val});
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500/20 font-bold"
                    />
                  </div>
                </div>

                {editingPost?.platform === 'facebook' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Detailed Reactions (FB)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'].map((reaction) => (
                        <div key={reaction} className="space-y-1">
                          <div className="text-[9px] font-bold text-slate-500 uppercase text-center">{reaction}</div>
                          <input 
                            type="number" 
                            value={postEditFormData.reactions[reaction] || 0}
                            onChange={(e) => setPostEditFormData({
                              ...postEditFormData, 
                              reactions: {
                                ...postEditFormData.reactions,
                                [reaction]: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 ring-indigo-500/20 text-center font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <button onClick={() => setEditingPost(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
                  <button onClick={savePostEdit} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <TemplateWidget onSelectTemplate={handleSelectTemplate} />
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
        active ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500 hover:bg-slate-50"
      )}
    >
      <Icon size={20} className={cn("transition-transform group-hover:scale-110", active && "scale-100")} />
      <span className="hidden lg:inline text-sm">{label}</span>
      {active && <motion.div layoutId="nav-line" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-full" />}
    </button>
  );
}

function PostCard({ post, variant, onEdit, onDelete, onExport }: { post: Post, variant: any, onEdit?: () => void, onDelete?: () => any, onExport?: (id: string) => void, key?: any }) {
  const isFacebook = variant === 'facebook';
  const isX = variant === 'x';
  const [likes, setLikes] = useState(post.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<{ emoji: string, label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLikes(post.likesCount);
  }, [post.likesCount]);

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes(prev => prev + 1);
    if (!selectedReaction) setSelectedReaction({ emoji: '👍', label: 'Like' });
    if (post.id) {
      await postService.likePost(post.id);
    }
  };

  const handleReactionSelect = async (reaction: { emoji: string, label: string }) => {
    setSelectedReaction(reaction);
    setShowReactions(false);
    if (!hasLiked) {
      setHasLiked(true);
      setLikes(prev => prev + 1);
      if (post.id) {
        await postService.likePost(post.id);
      }
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
      }
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  const fbReactions = [
    { emoji: '👍', label: 'Like', color: 'text-blue-500' },
    { emoji: '❤️', label: 'Love', color: 'text-red-500' },
    { emoji: '🥰', label: 'Care', color: 'text-yellow-500' },
    { emoji: '😆', label: 'Haha', color: 'text-yellow-500' },
    { emoji: '😮', label: 'Wow', color: 'text-yellow-500' },
    { emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
    { emoji: '😡', label: 'Angry', color: 'text-orange-500' },
  ];

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  const sampleComments = [
    { id: '1', author: 'Romeo Jrr', text: 'This simulation looks incredible! 🔥', time: '2d', likes: 12 },
    { id: '2', author: 'Sarah Jenkins', text: 'How do I export this to my dashboard?', time: '5h', likes: 3 },
    { id: '3', author: 'Elon', text: 'To the moon! 🚀', time: '1h', likes: 100 }
  ];

  const totalReactions = Object.values(post.reactions || {}).reduce((a, b) => (a as number) + (b as number), 0) + likes;

  return (
    <motion.div 
      layout
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDeleting ? 0.5 : 1, y: 0 }}
      className={cn(
        "bg-white border shadow-sm overflow-hidden relative",
        isFacebook ? "rounded-xl border-slate-200 p-0" : "rounded-3xl border-slate-200 p-6",
        isDeleting && "pointer-events-none"
      )}
    >
      {isDeleting && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Deleting Post...</span>
          </div>
        </div>
      )}

      {/* Top Bar for metrics (Summary) - Simulated System Metrics */}
      {!isFacebook && !isX && (
        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Heart size={10} className={cn("fill-slate-300 text-slate-300", hasLiked && "fill-indigo-500 text-indigo-500")} /> 
              {formatCount(totalReactions)} Reactions
            </span>
            <span className="flex items-center gap-1"><MessageCircle size={10} /> {formatCount(post.commentsCount ?? 31)} Comments</span>
            <span className="flex items-center gap-1">
              <Share2 size={10} /> 
              {formatCount(post.sharesCount ?? 47)} Shares
            </span>
          </div>
          <div className="text-indigo-500 font-black">ACTIVE</div>
        </div>
      )}

      {/* Header */}
      {isFacebook ? (
        <div className="p-4 flex items-center justify-between">
           <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                <img src={post.authorAvatar} alt="av" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm hover:underline cursor-pointer leading-tight">{post.authorName}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  {post.createdAt && typeof post.createdAt.toDate === 'function' ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                  <span>•</span>
                  <Globe size={10} />
                </div>
              </div>
           </div>
           <div className="relative">
             <button onClick={() => setShowOptions(!showOptions)} className="text-slate-400 p-1 hover:bg-slate-50 rounded-lg transition-colors">
               <MoreHorizontal size={20} />
             </button>
             {showOptions && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden font-bold">
                 <button onClick={() => { onExport?.(post.id!); setShowOptions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                   <Download size={14} /> Export as PDF
                 </button>
                 <button onClick={() => { onEdit?.(); setShowOptions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                   <Edit3 size={14} /> Edit Post Data
                 </button>
                 <button onClick={() => { handleDelete(); setShowOptions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                   <Trash2 size={14} /> Remove Post
                 </button>
               </div>
             )}
           </div>
        </div>
      ) : (
        <header className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className={cn("bg-slate-100 overflow-hidden border border-slate-200 shrink-0", isX ? "w-11 h-11 rounded-full" : "w-11 h-11 rounded-2xl")}>
              <img src={post.authorAvatar} alt="Alt" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15px]">{post.authorName}</span>
                {post.isVerified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500" />}
                {isX && <span className="text-slate-500 text-sm font-normal">@simulator</span>}
              </div>
              {!isX && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {post.createdAt && typeof post.createdAt.toDate === 'function' ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="text-slate-400 p-1.5 hover:bg-slate-100 rounded-xl transition-all">
              <MoreHorizontal size={18}/>
            </button>
            {showOptions && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                 <button onClick={() => { onExport?.(post.id!); setShowOptions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 font-bold">
                   <Download size={14} /> Export as PDF
                 </button>
                 <button onClick={() => { onEdit?.(); setShowOptions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 font-bold">
                   <Edit3 size={14} /> Edit Simulation
                 </button>
                 <button onClick={() => { handleDelete(); setShowOptions(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold">
                   <Trash2 size={14} /> Delete
                 </button>
               </div>
             )}
          </div>
        </header>
      )}

      {/* Content */}
      <div className={cn("mb-4", isFacebook && "px-4")}>
        <p className={cn("leading-relaxed mb-4 whitespace-pre-wrap", isFacebook ? "text-base" : "text-[15px] text-slate-700")}>{post.content}</p>
        
        {post.imageUrl && (
          <div className={cn("overflow-hidden border border-slate-100 bg-slate-50 group relative cursor-pointer", isFacebook ? "rounded-none -mx-4" : "rounded-2xl")} onClick={handleLike}>
            <img src={post.imageUrl} alt="post" className="w-full h-auto block" />
          </div>
        )}

        {isX && (
          <div className="mt-4 pb-3 border-b border-slate-100 flex gap-4 text-sm text-slate-500">
             <span className="font-medium text-slate-400">
               {post.createdAt && typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
               {' • '}
               {post.createdAt && typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
             </span>
             <span className="flex gap-1 items-center">
               <strong className="text-slate-800">12.4k</strong> Views
             </span>
          </div>
        )}
      </div>

      {/* Engagement Summary Line */}
      {isFacebook && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-2">
             <div className="flex items-center -space-x-1">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] border border-white z-20 text-white">👍</div>
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] border border-white z-10 text-white">❤️</div>
                {post.reactions?.care > 0 && <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] border border-white text-white">🥰</div>}
             </div>
             <span className="text-sm text-slate-500 font-normal hover:underline cursor-pointer">{formatCount(totalReactions)}</span>
          </div>
          <div className="text-sm text-slate-500 font-normal hover:underline cursor-pointer flex items-center gap-1">
            <span>{formatCount(post.commentsCount ?? 31)} Comments</span>
            <span>•</span>
            <span>{formatCount(post.sharesCount ?? 47)} Shares</span>
          </div>
        </div>
      )}

      {isX && (
        <div className="py-3 border-b border-slate-100 flex gap-6 text-sm">
           <span className="flex gap-1 items-center cursor-pointer hover:underline">
             <strong className="text-slate-800">{formatCount(post.retweetsCount ?? 242)}</strong> <span className="text-slate-500">Retweets</span>
           </span>
           <span className="flex gap-1 items-center cursor-pointer hover:underline">
             <strong className="text-slate-800">12</strong> <span className="text-slate-500">Quotes</span>
           </span>
           <span className="flex gap-1 items-center cursor-pointer hover:underline">
             <strong className="text-slate-800">{formatCount(likes)}</strong> <span className="text-slate-500">Likes</span>
           </span>
           <span className="flex gap-1 items-center cursor-pointer hover:underline">
             <strong className="text-slate-800">5</strong> <span className="text-slate-500">Bookmarks</span>
           </span>
        </div>
      )}

      {/* Footer / Buttons */}
      <footer className={cn(
        "flex items-center justify-between h-12 relative",
        isFacebook ? "border-t mx-4" : (isX ? "" : "pt-4 border-t border-slate-50")
      )}>
        <div className="flex gap-2 h-full flex-1 justify-between md:justify-start">
          {/* Reaction Button (FB) or Like (Others) */}
          <div className="relative flex items-center h-full group flex-1 md:flex-none">
            {isFacebook && (
              <AnimatePresence>
                {showReactions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -45, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-2xl border border-slate-100 p-1.5 flex gap-1.5 items-center z-30"
                  >
                    {fbReactions.map((reaction) => (
                      <motion.button
                        key={reaction.label}
                        whileHover={{ scale: 1.3 }}
                        onClick={() => handleReactionSelect(reaction)}
                        className="text-2xl hover:scale-125 transition-transform p-1"
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            
            <button 
              onMouseEnter={() => isFacebook && setShowReactions(true)}
              onMouseLeave={() => isFacebook && setTimeout(() => setShowReactions(false), 3000)}
              onClick={handleLike}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 transition-colors rounded-lg h-full",
                isFacebook 
                  ? (hasLiked ? "text-[#1877F2]" : "text-slate-500 hover:bg-slate-100")
                  : (isX ? "text-slate-500 hover:text-red-500 hover:bg-red-50" : (hasLiked ? "text-indigo-600 hover:bg-slate-50" : "text-slate-500 hover:bg-slate-50"))
              )}
            >
              {isFacebook ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {selectedReaction ? (
                      selectedReaction.emoji
                    ) : (
                      "👍"
                    )}
                  </span>
                  <span className={cn("text-sm font-bold", hasLiked ? "text-[#1877F2]" : "text-[#65676B]")}>
                    {selectedReaction?.label || 'Like'}
                  </span>
                </div>
              ) : (
                isX ? (
                  <Heart size={18} className={hasLiked ? "fill-red-500 text-red-500 border-none" : ""} />
                ) : (
                  <>
                    <Heart size={16} className={hasLiked ? "fill-indigo-600 text-indigo-600" : ""} />
                    <span className="text-xs font-bold">{formatCount(totalReactions)}</span>
                  </>
                )
              )}
            </button>
          </div>

          {/* Comment / Reply Button */}
          <button 
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 transition-colors rounded-lg h-full",
              isFacebook ? "text-[#65676B] hover:bg-slate-100" : (isX ? "text-slate-500 hover:text-blue-500 hover:bg-blue-50" : "text-slate-500 hover:bg-slate-50")
            )}
          >
            {isFacebook ? <MessageCircle size={18} /> : <MessageCircle size={isX ? 18 : 16} />}
            {!isX && <span className={cn("font-bold", isFacebook ? "text-sm text-[#65676B]" : "text-xs")}>{isFacebook ? 'Comment' : formatCount(post.commentsCount ?? 31)}</span>}
          </button>
          
          {/* Share / Retweet Button */}
          <button className={cn(
            "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 transition-colors rounded-lg h-full",
            isFacebook ? "text-[#65676B] hover:bg-slate-100" : (isX ? "text-slate-500 hover:text-emerald-500 hover:bg-emerald-50" : "text-slate-500 hover:bg-slate-50")
          )}>
            {isX ? <TrendingUp size={18} /> : <Share2 size={isFacebook ? 18 : 16} />}
            {!isX && <span className={cn("font-bold text-sm text-[#65676B]", isFacebook ? "inline" : "hidden")}>Share</span>}
          </button>

          {isX && (
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 text-slate-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors h-full">
              <BarChart size={18} />
            </button>
          )}
        </div>

        {isX && (
          <button className="text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-all p-2 rounded-full">
            <Download size={18} />
          </button>
        )}
        
        {!isFacebook && !isX && (
          <button className="text-slate-400 hover:text-slate-600 transition-colors px-2">
            <Share2 size={16} />
          </button>
        )}
      </footer>

      {/* Enhanced Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50 border-t"
          >
            <div className="p-4 space-y-4">
              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">YOU</div>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-indigo-500/10 transition-all"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 p-1 rounded-full hover:bg-indigo-50">
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {sampleComments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className={cn("rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0", isX ? "w-8 h-8" : "w-8 h-8")}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} alt="av" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className={cn("inline-block px-4 py-2 border", isFacebook ? "bg-slate-100 border-transparent rounded-[18px]" : "bg-white border-slate-100 rounded-2xl shadow-sm")}>
                      <p className="text-xs font-black mb-0.5">{comment.author}</p>
                      <p className="text-[13px] text-slate-700 leading-snug">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 ml-1 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span>{comment.time}</span>
                      <button className="hover:text-indigo-600">Like</button>
                      <button className="hover:text-indigo-600">Reply</button>
                      <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-slate-100 ml-auto">
                         <Heart size={10} className="fill-red-500 text-red-500" />
                         <span className="text-[9px] text-slate-400">{formatCount(comment.likes)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {post.commentsCount > 3 && (
                <button className="text-xs font-bold text-slate-400 hover:text-indigo-600 ml-11 uppercase tracking-widest pt-2">
                  View {post.commentsCount - 3} more comments...
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ label, value, delta }: { label: string, value: string | number, delta: string }) {
  const isPositive = delta.startsWith('+');
  return (
    <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-display font-bold text-slate-800">{value}</h4>
        <div className={cn("text-[11px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1", isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
          {delta}
        </div>
      </div>
    </div>
  );
}

function DashboardMiniCard({ label, value, delta, color = "indigo", onClick }: { label: string, value: string, delta: string, color?: string, onClick?: () => void }) {
  const isPositive = delta.startsWith('+');
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm transition-all group",
        onClick && "cursor-pointer hover:border-indigo-300 hover:shadow-md"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        {onClick && <Edit3 size={10} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold">{value}</span>
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", isPositive ? "text-emerald-500 bg-emerald-50" : "text-red-500 bg-red-50")}>{delta}</span>
      </div>
    </div>
  );
}

function FacebookDashboard({ metrics, onEdit }: { metrics: any, onEdit: (key: string, label: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-8">
      {/* Sidebar */}
      <div className="space-y-1">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-4">Professional Tools</div>
        <DashboardSidebarItem icon={LayoutDashboard} label="Home" active />
        <DashboardSidebarItem icon={BarChart3} label="Insights" />
        <DashboardSidebarItem icon={TrendingUp} label="Monetization" />
        <DashboardSidebarItem icon={Target} label="Ads Center" />
        <DashboardSidebarItem icon={Plus} label="Inspiration Hub" />
      </div>

      <div className="space-y-8">
        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardMiniCard label="Reach" value={metrics.reach} delta={metrics.reachDelta} onClick={() => onEdit('reach', 'Edit Reach')} />
          <DashboardMiniCard label="Engagement" value={metrics.engagement} delta={metrics.engagementDelta} onClick={() => onEdit('engagement', 'Edit Engagement')} />
          <DashboardMiniCard label="Net Followers" value={metrics.followers} delta={metrics.followersDelta} onClick={() => onEdit('followers', 'Edit Followers')} />
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold">Weekly Progress</h3>
              <span className="text-xs text-slate-400">Week of April 21 - 27</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MilestoneCard title="Maximized Earnings" progress={85} desc="You're 15% away from your goal" />
              <MilestoneCard title="Reach More People" progress={40} desc="Create 2 more reels this week" />
           </div>
        </div>

        {/* Inspiration Hub */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="font-bold">Inspiration Hub</h3>
              <button className="text-indigo-600 text-xs font-bold">View All</button>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-[9/16] bg-slate-100 rounded-2xl overflow-hidden relative group cursor-pointer">
                   <img src={`https://images.unsplash.com/photo-${1600000000000 + i * 10000}?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3 text-white">
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                         <Play size={10} /> {Math.floor(Math.random() * 500)}k
                      </div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Trending Audio</div>
              <div className="space-y-3">
                 {[
                   { name: 'Phonk Night Drive', duration: '0:15', usage: '1.2M' },
                   { name: 'Lo-Fi Chill Beats', duration: '0:30', usage: '840k' }
                 ].map((audio, i) => (
                   <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            <Music size={14} />
                         </div>
                         <div>
                            <div className="text-xs font-bold">{audio.name}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase">{audio.duration}</div>
                         </div>
                      </div>
                      <div className="text-[10px] font-black text-indigo-500">{audio.usage} REELS</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Moderation Assist */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold">Moderation Assist</h3>
                <p className="text-slate-400 text-xs">Automate your community safety</p>
              </div>
              <ShieldCheck className="text-emerald-500" size={32} />
           </div>
           
           <div className="mb-8 p-1 bg-slate-800 rounded-xl flex">
              {['Low', 'Medium', 'High'].map(level => (
                <button key={level} className={cn("flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all", level === 'Medium' ? "bg-slate-700 text-white shadow-sm" : "text-slate-500")}>
                   {level}
                </button>
              ))}
           </div>

           <div className="space-y-4">
              <ToggleSetting label="Filter Profanity" active />
              <ToggleSetting label="Link Suppression" active />
              <ToggleSetting label="Image Auto-Blur" />
              <ToggleSetting label="Spam Keyword Filter" active />
           </div>
        </div>
      </div>
    </div>
  );
}

function InstagramDashboard({ metrics, onEdit }: { metrics: any, onEdit: (key: string, label: string) => void }) {
  return (
    <div className="space-y-8">
      {/* Account Insights Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row justify-around gap-6">
         <div className="text-center group cursor-pointer" onClick={() => onEdit('reached', 'Edit Accounts Reached')}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
               Accounts Reached <Edit3 size={8} className="opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-2xl font-bold">{metrics.reached}</div>
            <div className="text-[10px] font-black text-emerald-500">{metrics.reachedDelta} vs last 30d</div>
         </div>
         <div className="hidden md:block w-px bg-slate-100 h-10 self-center" />
         <div className="text-center group cursor-pointer" onClick={() => onEdit('engaged', 'Edit Accounts Engaged')}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
               Accounts Engaged <Edit3 size={8} className="opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-2xl font-bold">{metrics.engaged}</div>
            <div className="text-[10px] font-black text-emerald-500">{metrics.engagedDelta} vs last 30d</div>
         </div>
         <div className="hidden md:block w-px bg-slate-100 h-10 self-center" />
         <div className="text-center group cursor-pointer" onClick={() => onEdit('totalFollowers', 'Edit Total Followers')}>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
               Total Followers <Edit3 size={8} className="opacity-0 group-hover:opacity-100" />
            </div>
            <div className="text-2xl font-bold">{metrics.totalFollowers}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase">Growth Stable</div>
         </div>
      </div>

      {/* Content Breakdown Tabbed View */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
         <div className="flex border-b">
            {['Posts', 'Reels', 'Stories', 'Live'].map((tab, i) => (
              <button key={tab} className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-widest", i === 1 ? "border-b-2 border-indigo-600 text-indigo-600" : "text-slate-400")}>{tab}</button>
            ))}
         </div>
         <div className="p-8">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold">Reels Performance</h3>
               <select className="bg-slate-50 border-none outline-none text-[10px] font-bold px-4 py-2 rounded-xl">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
               </select>
            </div>
            <div className="h-64 flex items-end gap-2 border-b border-l p-4 relative">
               {[40, 70, 45, 90, 65, 80, 55, 75, 40, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-lg transition-all hover:bg-gradient-to-t hover:from-indigo-600 hover:to-indigo-400 relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}k
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Grow Your Business */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <h3 className="font-bold mb-6">Grow Your Business</h3>
            <div className="grid grid-cols-2 gap-3">
               <ToolIcon icon={ImageIcon} label="Branded Content" />
               <ToolIcon icon={Target} label="Ad Tools" />
               <ToolIcon icon={MessageSquare} label="Saved Replies" />
               <ToolIcon icon={TrendingUp} label="Monetization" />
            </div>
         </div>
         <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold uppercase tracking-tight">Competitive Performance Hub</h3>
               <button className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase">Add Account</button>
            </div>
            <div className="space-y-6">
               <div className="h-40 flex items-end gap-3 px-2">
                  <div className="flex-1 space-y-2">
                     <div className="bg-indigo-600 rounded-t-xl" style={{ height: '100%' }} />
                     <div className="text-[8px] font-black text-center text-indigo-600 uppercase">You</div>
                  </div>
                  <div className="flex-1 space-y-2 opacity-50">
                     <div className="bg-slate-300 rounded-t-xl" style={{ height: '85%' }} />
                     <div className="text-[8px] font-black text-center text-slate-400 uppercase">Kim K</div>
                  </div>
                  <div className="flex-1 space-y-2 opacity-50">
                     <div className="bg-slate-300 rounded-t-xl" style={{ height: '70%' }} />
                     <div className="text-[8px] font-black text-center text-slate-400 uppercase">Ari G</div>
                  </div>
                  <div className="flex-1 space-y-2 opacity-50">
                     <div className="bg-slate-300 rounded-t-xl" style={{ height: '40%' }} />
                     <div className="text-[8px] font-black text-center text-slate-400 uppercase">CR7</div>
                  </div>
               </div>
               <div className="pt-4 border-t border-slate-50 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                     <span className="text-slate-400 uppercase">Market Share</span>
                     <span className="text-indigo-600">+12.4% Lead</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-indigo-600 h-full" style={{ width: '45%' }} />
                    <div className="bg-slate-300 h-full opacity-50" style={{ width: '30%' }} />
                    <div className="bg-slate-200 h-full opacity-50" style={{ width: '25%' }} />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function XDashboard({ metrics, onEdit }: { metrics: any, onEdit: (key: string, label: string) => void }) {
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['Spend', 'Impressions', 'CTR', 'CPC']);

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <DashboardMiniCard label="Total Spend" value={metrics.totalSpend} delta={metrics.spendDelta} onClick={() => onEdit('totalSpend', 'Edit Total Spend')} />
         <DashboardMiniCard label="Impressions" value={metrics.impressions} delta={metrics.impressionsDelta} onClick={() => onEdit('impressions', 'Edit Impressions')} />
         <DashboardMiniCard label="Conversions" value={metrics.conversions} delta={metrics.conversionsDelta} onClick={() => onEdit('conversions', 'Edit Conversions')} />
      </div>

      {/* Trend Charts */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8">
         <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold">Campaign Performance</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Spend</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Conversions</span>
               </div>
            </div>
         </div>
         <div className="h-48 flex items-end gap-1 relative border-b border-l p-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 space-y-px h-full flex flex-col justify-end">
                <div className="w-full bg-indigo-600 rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` }} />
                <div className="w-full bg-emerald-500 opacity-40 rounded-b-sm" style={{ height: `${10 + Math.random() * 30}%` }} />
              </div>
            ))}
         </div>
      </div>

      {/* Campaign Manager Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden relative">
        <div className="p-6 border-b flex items-center justify-between">
           <h3 className="font-bold">Campaign Manager</h3>
           <button 
             onClick={() => setShowColumnSelector(!showColumnSelector)}
             className="flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
           >
              <Settings size={14} /> Customize Columns
           </button>
        </div>

        <AnimatePresence>
          {showColumnSelector && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className="absolute top-20 right-6 z-20 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 w-48"
            >
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Visible Metrics</div>
               <div className="space-y-2">
                  {['Spend', 'Impressions', 'CTR', 'CPC', 'ROAS', 'CPA'].map(col => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={visibleColumns.includes(col)} 
                         onChange={() => toggleColumn(col)}
                         className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                       />
                       <span className="text-xs font-medium">{col}</span>
                    </label>
                  ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Campaign Name</th>
                    {visibleColumns.includes('Spend') && <th className="px-6 py-4 text-right">Spend</th>}
                    {visibleColumns.includes('Impressions') && <th className="px-6 py-4 text-right">Impressions</th>}
                    {visibleColumns.includes('CTR') && <th className="px-6 py-4 text-right">CTR</th>}
                    {visibleColumns.includes('CPC') && <th className="px-6 py-4 text-right">CPC</th>}
                    {visibleColumns.includes('ROAS') && <th className="px-6 py-4 text-right">ROAS</th>}
                    {visibleColumns.includes('CPA') && <th className="px-6 py-4 text-right">CPA</th>}
                    <th className="px-6 py-4 text-center">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {[
                   { name: 'Spring Launch 2024', spend: '$12,450', imp: '1.2M', ctr: '3.2%', cpc: '$0.42', roas: '4.2x', cpa: '$2.10', status: 'Active' },
                   { name: 'Retargeting - Q1', spend: '$8,200', imp: '840k', ctr: '4.8%', cpc: '$0.31', roas: '6.0x', cpa: '$1.45', status: 'Active' },
                   { name: 'Influencer Collab', spend: '$5,000', imp: '420k', ctr: '2.1%', cpc: '$0.65', roas: '2.8x', cpa: '$4.20', status: 'Paused' },
                   { name: 'Brand Awareness', spend: '$25,000', imp: '4.5M', ctr: '1.2%', cpc: '$0.15', roas: 'N/A', cpa: 'N/A', status: 'Completed' },
                 ].map((campaign, i) => (
                   <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm whitespace-nowrap">{campaign.name}</td>
                      {visibleColumns.includes('Spend') && <td className="px-6 py-4 text-right text-sm">{campaign.spend}</td>}
                      {visibleColumns.includes('Impressions') && <td className="px-6 py-4 text-right text-sm">{campaign.imp}</td>}
                      {visibleColumns.includes('CTR') && <td className="px-6 py-4 text-right text-sm">{campaign.ctr}</td>}
                      {visibleColumns.includes('CPC') && <td className="px-6 py-4 text-right text-sm">{campaign.cpc}</td>}
                      {visibleColumns.includes('ROAS') && <td className="px-6 py-4 text-right text-sm">{(campaign as any).roas}</td>}
                      {visibleColumns.includes('CPA') && <td className="px-6 py-4 text-right text-sm">{(campaign as any).cpa}</td>}
                      <td className="px-6 py-4 text-center">
                         <span className={cn(
                           "text-[10px] font-black px-2 py-1 rounded-md uppercase",
                           campaign.status === 'Active' ? "bg-emerald-50 text-emerald-600" : (campaign.status === 'Paused' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-400")
                         )}>{campaign.status}</span>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>

      {/* Audience Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white rounded-3xl p-8 border border-slate-200">
            <h3 className="font-bold mb-8">Audience Demographics</h3>
            <div className="flex gap-10">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[12px] border-indigo-600 border-t-transparent -rotate-45" />
                  <div className="text-center">
                     <div className="text-xl font-bold">65%</div>
                     <div className="text-[10px] font-bold text-slate-400">Male</div>
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <DemographicBar label="USA" percent={45} />
                  <DemographicBar label="UK" percent={12} />
                  <DemographicBar label="Japan" percent={8} />
               </div>
            </div>
         </div>
         <div className="bg-white rounded-3xl p-8 border border-slate-200">
            <h3 className="font-bold mb-6">Follower Interests</h3>
            <div className="flex flex-wrap gap-2">
               {['Technology', 'AI', 'Gaming', 'Finance', 'Travel', 'Photography', 'Web3', 'Music'].map(tag => (
                 <span key={tag} className="px-4 py-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-600">{tag}</span>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function YouTubeDashboard({ metrics, onEdit }: { metrics: any, onEdit: (key: string, label: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const allVideos = [
    { title: 'The future of simulation', views: '1.2M', date: '2 days ago', status: 'ON' },
    { title: 'My morning routine', views: '450k', date: '1 week ago', status: 'ON' },
    { title: 'Simulating React', views: '890k', date: '2 weeks ago', status: 'Copyright' },
    { title: '10 JS Hacks', views: '2.1M', date: '3 weeks ago', status: 'ON' },
  ];

  const filteredVideos = allVideos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">
       <div className="space-y-8">
          {/* Latest Video Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold">Latest Video Performance</h3>
                <span className="text-xs text-slate-400">First 24 hours</span>
             </div>
             <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 aspect-video bg-slate-100 rounded-2xl overflow-hidden relative group cursor-pointer">
                   <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-xl">
                         <Play size={24} fill="currentColor" />
                      </div>
                   </div>
                </div>
                <div className="flex-1 space-y-4">
                   <h4 className="font-bold text-lg leading-tight uppercase tracking-tight">How I simulated the entire internet with plain JS</h4>
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-slate-50 rounded-2xl group cursor-pointer" onClick={() => onEdit('realtimeViews', 'Edit Realtime Views')}>
                            <div className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">Views <Edit3 size={8} className="opacity-0 group-hover:opacity-100" /></div>
                            <div className="text-xl font-bold">{metrics.realtimeViews}</div>
                            <div className="text-[9px] font-bold text-emerald-500 mt-1">Typical: 400k - 900k</div>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl">
                           <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Avg. View duration</div>
                           <div className="text-xl font-bold">8:45</div>
                           <div className="text-[9px] font-bold text-slate-400 mt-1">Typical: 6:10 - 7:30</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                         <TrendingUp size={14} className="text-red-500" />
                         <span className="text-xs font-bold text-red-600">This video is performing better than unusual!</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Channel Analytics Hub */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
             <div className="flex border-b">
                {['Overview', 'Reach', 'Engagement', 'Audience', 'Revenue'].map((tab, i) => (
                  <button key={tab} className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest", i === 0 ? "border-b-2 border-red-600 text-red-600" : "text-slate-400")}>{tab}</button>
                ))}
             </div>
             <div className="p-8">
                <div className="h-64 flex items-end gap-1 relative">
                   {Array.from({ length: 50 }).map((_, i) => (
                     <div key={i} className="flex-1 bg-red-500/10 rounded-t-sm relative group" style={{ height: `${30 + Math.sin(i * 0.2) * 50 + 20}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-red-600 rounded-t-sm opacity-40 h-2/3" />
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Content Library */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
             <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold">Content Library</h3>
                <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="Search videos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-100 transition-all"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
             </div>
             <div className="divide-y divide-slate-50">
                {filteredVideos.map((video, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                     <div className="w-20 aspect-video bg-slate-200 rounded-lg shrink-0 overflow-hidden">
                        <img src={`https://images.unsplash.com/photo-${1600000000000 + i * 5555}?auto=format&fit=crop&q=80&w=100`} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm truncate uppercase tracking-tight">{video.title}</h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{video.views} • {video.date}</p>
                     </div>
                     <div className={cn("px-2 py-1 rounded text-[10px] font-black uppercase shrink-0", video.status === 'ON' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                        {video.status}
                     </div>
                  </div>
                ))}
             </div>
          </div>
       </div>

       {/* Realtime Sidebar */}
       <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 text-white text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full animate-ping m-4" />
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Realtime Views</div>
                 <div className="text-4xl font-display font-bold group cursor-pointer flex items-center justify-center gap-2" onClick={() => onEdit('realtimeViews', 'Edit Realtime Views')}>
                    {metrics.realtimeViews}
                    <Edit3 size={14} className="opacity-0 group-hover:opacity-100 text-slate-500" />
                 </div>
                 <div className="text-[10px] font-bold text-emerald-400 mt-1 uppercase">Live Updates</div>
                 <div className="mt-8 flex items-end gap-1 px-4 h-24">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div key={i} className="flex-1 bg-white/20 rounded-t-sm" style={{ height: `${20 + Math.random() * 80}%` }} />
                    ))}
                 </div>
                 <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>48 Hours</span>
                    <span>Now</span>
                 </div>
              </div>
    
              <div className="bg-white rounded-3xl p-6 border border-slate-200">
                 <h3 className="font-bold mb-4">Channel Stats</h3>
                 <div className="space-y-4">
                    <ChannelStat label="Total Subscribers" value={metrics.subscribers} delta={metrics.subsDelta} onClick={() => onEdit('subscribers', 'Edit Subscribers')} />
                    <ChannelStat label="Watch Time (Hrs)" value={metrics.watchTime} delta={metrics.watchTimeDelta} onClick={() => onEdit('watchTime', 'Edit Watch Time')} />
                    <ChannelStat label="Estimated Revenue" value={metrics.revenue} delta={metrics.revenueDelta} onClick={() => onEdit('revenue', 'Edit Revenue')} />
                 </div>
              </div>
       </div>
    </div>
  );
}

function TikTokDashboard({ metrics, onEdit }: { metrics: any, onEdit: (key: string, label: string) => void }) {
  return (
    <div className="space-y-8">
       {/* Key Performance Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardMiniCard label="Video Views" value={metrics.views} delta={metrics.viewsDelta} onClick={() => onEdit('views', 'Edit Video Views')} />
          <DashboardMiniCard label="Profile Views" value={metrics.profileViews} delta={metrics.profileViewsDelta} onClick={() => onEdit('profileViews', 'Edit Profile Views')} />
          <DashboardMiniCard label="Likes" value={metrics.likes} delta={metrics.likesDelta} onClick={() => onEdit('likes', 'Edit Likes')} />
          <DashboardMiniCard label="Comments" value={metrics.comments} delta={metrics.commentsDelta} onClick={() => onEdit('comments', 'Edit Comments')} />
       </div>

       {/* Engagement Funnel */}
       <div className="bg-white rounded-3xl border border-slate-200 p-10">
          <h3 className="font-bold mb-10 text-center">Engagement Funnel</h3>
          <div className="max-w-md mx-auto space-y-2">
             <div className="h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-t-full flex items-center justify-center text-white font-bold" style={{ width: '100%' }}>
                <span>4.5B Views</span>
             </div>
             <div className="h-16 bg-gradient-to-r from-red-600/80 to-red-500/80 rounded-sm flex items-center justify-center text-white font-bold mx-auto" style={{ width: '80%' }}>
                <span>122M Likes</span>
             </div>
             <div className="h-16 bg-gradient-to-r from-red-600/60 to-red-500/60 rounded-sm flex items-center justify-center text-white font-bold mx-auto" style={{ width: '50%' }}>
                <span>45M Shares</span>
             </div>
             <div className="h-16 bg-gradient-to-r from-red-600/40 to-red-500/40 rounded-b-full flex items-center justify-center text-white font-bold mx-auto" style={{ width: '20%' }}>
                <span>1.2M Comments</span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-[1fr,320px] gap-8">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-6">
             <h3 className="font-bold mb-6">Recent Content</h3>
             <div className="grid grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-[9/16] bg-slate-100 rounded-xl overflow-hidden relative group">
                     <img src={`https://images.unsplash.com/photo-${1500000000000 + i * 1234567}?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-cover" />
                     <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-black">
                        <Play size={10} fill="currentColor" /> {Math.floor(Math.random() * 100)}k
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6">
             <h3 className="font-bold mb-6">Monetization Hub</h3>
             <div className="space-y-3">
                <MonetizationItem label="Creator Rewards" active icon={TrendingUp} />
                <MonetizationItem label="TikTok Shop" icon={ ImageIcon } />
                <MonetizationItem label="LIVE Gifts" icon={Flame} />
                <MonetizationItem label="Artist Hub" icon={Music} />
             </div>
          </div>
       </div>
    </div>
  );
}

{/* Support Components */}
function DashboardSidebarItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
      active ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
    )}>
      <Icon size={18} />
      {label}
    </button>
  );
}

function MilestoneCard({ title, progress, desc }: { title: string, progress: number, desc: string }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
       <div className="font-bold text-sm mb-1">{title}</div>
       <p className="text-[10px] text-slate-500 mb-4">{desc}</p>
       <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${progress}%` }} />
       </div>
    </div>
  );
}

function ToggleSetting({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5">
       <span className="text-sm font-medium">{label}</span>
       <div className={cn("w-10 h-5 rounded-full p-1 transition-colors", active ? "bg-emerald-500" : "bg-slate-700")}>
          <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", active ? "translate-x-5" : "translate-x-0")} />
       </div>
    </div>
  );
}

function ToolIcon({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl group cursor-pointer hover:bg-indigo-50 transition-colors">
       <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
          <Icon size={20} />
       </div>
       <span className="text-[10px] font-bold uppercase text-slate-500 text-center">{label}</span>
    </div>
  );
}

function CompetitiveAccount({ name, followers, icon }: { name: string, followers: string, icon: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
       <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs uppercase tracking-widest">{icon}</div>
       <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{name}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase">{followers} followers</p>
       </div>
       <BarChart size={16} className="text-slate-300" />
    </div>
  );
}

function DemographicBar({ label, percent }: { label: string, percent: number }) {
  return (
    <div className="space-y-1">
       <div className="flex justify-between text-[10px] font-bold text-slate-500">
          <span>{label}</span>
          <span>{percent}%</span>
       </div>
       <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }} />
       </div>
    </div>
  );
}

function ChannelStat({ label, value, delta, onClick }: { label: string, value: string, delta: string, onClick?: () => void }) {
  return (
    <div className={cn("flex items-center justify-between group", onClick && "cursor-pointer")} onClick={onClick}>
       <div className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
          {label} {onClick && <Edit3 size={8} className="opacity-0 group-hover:opacity-100" />}
       </div>
       <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold">{value}</span>
          <span className="text-[10px] font-bold text-emerald-500">{delta}</span>
       </div>
    </div>
  );
}

function MonetizationItem({ label, icon: Icon, active = false }: { label: string, icon: any, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer",
      active ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50 border border-transparent hover:border-slate-200"
    )}>
       <div className="flex items-center gap-3">
          <Icon size={18} className={active ? "text-indigo-600" : "text-slate-400"} />
          <span className={cn("text-sm font-bold", active ? "text-indigo-900" : "text-slate-600")}>{label}</span>
       </div>
       {active && <BadgeCheck size={16} className="text-indigo-600 fill-indigo-600" />}
    </div>
  );
}

function ProfileField({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
      <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{label}</span>
      <p className="mt-1.5 font-medium text-slate-700">{value}</p>
    </div>
  );
}

function QuickStatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

function ChatListItem({ active, name, platform, lastMsg, verified }: { active?: boolean, name: string, platform: string, lastMsg: string, verified?: boolean }) {
  return (
    <div className={cn(
      "p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all",
      active ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50"
    )}>
      <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0 flex items-center justify-center font-bold text-xs text-slate-400">
        {name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="font-bold text-sm truncate">{name}</span>
          {verified && <BadgeCheck size={14} className="text-blue-500 fill-blue-500" />}
        </div>
        <p className="text-[11px] text-slate-400 truncate uppercase font-bold">{platform} • {lastMsg}</p>
      </div>
    </div>
  );
}

function ChatInterface({ platform, mockUser, onAvatarClick }: { platform: string; mockUser: any; onAvatarClick: () => void }) {
  const isFacebook = platform === 'messenger';
  const isWhatsApp = platform === 'whatsapp';
  const isTelegram = platform === 'telegram';
  const isSnapchat = platform === 'snapchat';

  const [messages, setMessages] = useState<{ 
    id: string; 
    text: string; 
    isMe: boolean; 
    timestamp: string; 
    status: 'sent' | 'delivered' | 'read';
    type?: 'text' | 'image' | 'voice' | 'video';
    mediaUrl?: string;
  }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMeToggle, setIsMeToggle] = useState(true);
  const [msgType, setMsgType] = useState<'text' | 'image' | 'voice'>('text');
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  const commonEmojis = ['😊', '😂', '🔥', '❤️', '👍', '🙌', '✨', '😍', '🤔', '😎', '💀', '💯', '📍', '✅', '❌'];

  const addEmoji = (emoji: string) => {
    setInputValue(prev => prev + emoji);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && msgType === 'text') return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text: inputValue,
      isMe: isMeToggle,
      timestamp: timeStr,
      status: 'read' as const,
      type: msgType,
      mediaUrl: msgType === 'image' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400' : undefined
    };
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <>
      <AnimatePresence>
        {showCallOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white"
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-6">
              <img src={mockUser.avatar} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{mockUser.name}</h2>
            <p className="text-emerald-400 font-medium animate-pulse mb-20">{platform.toUpperCase()} VIDEO CALL...</p>
            
            <div className="flex gap-8">
              <button onClick={() => setShowCallOverlay(false)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40">
                <X size={32} />
              </button>
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <Camera size={32} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn(
        "p-4 border-b flex items-center justify-between",
        isWhatsApp ? "bg-[#075e54] text-white" : "bg-white border-slate-100"
      )}>
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={onAvatarClick}>
            <img src={mockUser.avatar} className="w-10 h-10 rounded-full border border-slate-100 object-cover" alt="Avatar" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity">
              <Camera size={14} className="text-white" />
            </div>
            {mockUser.online && (
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full",
                isWhatsApp ? "bg-emerald-400" : "bg-emerald-500"
              )} />
            )}
          </div>
          <div>
            <div className={cn("font-bold text-sm flex items-center gap-1", isWhatsApp ? "text-white" : "text-slate-800")}>
              {mockUser.name} 
              {mockUser.verified && <BadgeCheck size={14} className={cn("fill-blue-500", isWhatsApp ? "text-white" : "text-blue-500")} />}
            </div>
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-widest leading-none cursor-pointer hover:underline",
              isWhatsApp ? "text-emerald-300" : "text-emerald-500"
            )} onClick={() => setIsTyping(!isTyping)}>
              {isTyping ? 'Typing...' : (mockUser.online ? 'Online' : 'Offline')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowCallOverlay(true)} className={cn("hover:opacity-70", isWhatsApp ? "text-white" : "text-slate-400")}>
             <Camera size={20} />
          </button>
          <button className={cn("hover:opacity-70", isWhatsApp ? "text-white" : "text-slate-400")}>
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
      <div className={cn(
        "flex-1 p-6 space-y-4 overflow-y-auto",
        isWhatsApp ? "bg-[#e5ddd5]" : (isTelegram ? "bg-[#7195ba]" : "bg-slate-50/20")
      )}>
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-40">
            <MessageSquare size={48} className="mb-4" />
            <p className="text-sm font-medium">No messages yet. <br/> Start faking the conversation.</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <ChatMessage 
            key={msg.id} 
            theme={platform} 
            {...msg} 
            onEdit={(updates) => {
              const newMsgs = [...messages];
              newMsgs[idx] = { ...newMsgs[idx], ...updates };
              setMessages(newMsgs);
            }} 
          />
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl rounded-tl-none text-xs font-bold text-slate-400 animate-pulse">
               {mockUser.name} is typing...
             </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center justify-between mb-4">
           <div className="flex gap-2">
             <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => setIsMeToggle(false)}
                  className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", !isMeToggle ? "bg-white shadow-sm text-slate-800" : "text-slate-400")}
                >
                  THEM
                </button>
                <button 
                  onClick={() => setIsMeToggle(true)}
                  className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", isMeToggle ? "bg-white shadow-sm text-slate-800" : "text-slate-400")}
                >
                  YOU
                </button>
             </div>
             
             <button 
               onClick={() => setShowEmojis(!showEmojis)}
               className={cn(
                 "px-3 py-1 rounded-lg border transition-all flex items-center gap-2",
                 showEmojis ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-100 text-slate-400"
               )}
             >
               <Smile size={14} />
               <span className="text-[10px] font-bold">EMOJIS</span>
             </button>
           </div>
           <div className="flex gap-2">
             <select 
               value={msgType} 
               onChange={(e) => setMsgType(e.target.value as any)}
               className="text-[10px] font-bold bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 outline-none"
             >
               <option value="text">Text</option>
               <option value="image">Image</option>
               <option value="voice">Voice</option>
             </select>
           </div>
        </div>

        <AnimatePresence>
          {showEmojis && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100"
            >
              {commonEmojis.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-xl hover:scale-125 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className={cn(
            "flex items-center gap-2 p-2 px-4 rounded-xl border transition-colors",
            isWhatsApp ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200 focus-within:border-indigo-400"
          )}
        >
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm" 
            placeholder={msgType === 'text' ? `Type a ${platform} message...` : msgType === 'voice' ? 'Record voice message...' : 'Select image...'} 
          />
          <button 
            type="submit"
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg active:scale-90 transition-all",
              isWhatsApp ? "bg-[#075e54]" : "bg-indigo-600 shadow-indigo-600/20"
            )}
          >
            <Send size={14} className="rotate-45" />
          </button>
        </form>
      </div>
    </>
  );
}

function ImageCropperModal({ image, onCropComplete, onCancel }: { image: string, onCropComplete: (croppedImg: string) => void, onCancel: () => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: { x: number, y: number }) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);
  const onCropAreaChange = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => (img.onload = resolve));

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );
      }

      onCropComplete(canvas.toDataURL('image/jpeg'));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl overflow-hidden w-full max-w-lg flex flex-col h-[600px] shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg">Crop Profile Picture</h3>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 relative bg-slate-100">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
          />
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase text-slate-400">Zoom</span>
            <input 
              type="range" 
              min={1} 
              max={3} 
              step={0.1} 
              value={zoom} 
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Cancel</button>
            <button onClick={createCroppedImage} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">Apply Crop</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ 
  text, 
  isMe, 
  timestamp, 
  status, 
  theme, 
  type, 
  mediaUrl, 
  onEdit 
}: { 
  text: string; 
  isMe: boolean; 
  timestamp: string; 
  status: 'sent' | 'delivered' | 'read'; 
  theme: string; 
  type?: 'text' | 'image' | 'voice' | 'video';
  mediaUrl?: string;
  onEdit: (updates: any) => void;
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(text);

  const isWhatsApp = theme === 'whatsapp';
  const isTelegram = theme === 'telegram';
  const isMessenger = theme === 'messenger';

  const handleTextSubmit = () => {
    onEdit({ text: editText });
    setIsEditingText(false);
  };

  return (
    <div className={cn("flex flex-col group", isMe ? "items-end" : "items-start")}>
      <div className="mb-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <select 
            value={status} 
            onChange={(e) => onEdit({ status: e.target.value })}
            className="text-[8px] font-black uppercase bg-white border border-slate-100 rounded px-1 outline-none"
         >
           <option value="sent">Sent</option>
           <option value="delivered">Delivered</option>
           <option value="read">Read</option>
         </select>
         <input 
           type="text" 
           value={timestamp} 
           onChange={(e) => onEdit({ timestamp: e.target.value })}
           className="text-[8px] font-black bg-white border border-slate-100 rounded px-1 w-12 text-center"
         />
      </div>

      <div 
        onClick={() => isMe && !isEditingText && setIsEditingText(true)}
        className={cn(
          "max-w-[75%] px-4 py-2.5 shadow-sm text-sm relative transition-all",
          isMe 
            ? (isWhatsApp ? "bg-[#dcf8c6] text-slate-800 rounded-lg rounded-tr-none shadow-none" : 
               (isMessenger ? "bg-blue-600 text-white rounded-2xl rounded-tr-none" : "bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-indigo-600/10")) 
            : (isWhatsApp ? "bg-white text-slate-800 rounded-lg rounded-tl-none shadow-none" : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none"),
          isMe && !isEditingText && "cursor-pointer hover:ring-2 ring-indigo-500/20"
        )}
      >
        {type === 'image' && mediaUrl && (
          <img src={mediaUrl} className="rounded-lg mb-2 max-w-full h-auto" alt="Attached" />
        )}
        
        {type === 'voice' && (
          <div className="flex items-center gap-3 py-1">
             <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                <Send size={12} className="rotate-45" />
             </div>
             <div className="flex-1 h-3 flex items-center gap-0.5">
                {[1,2,3,4,5,6,7,8,9,10].map(i => (
                  <div key={i} className="w-0.5 bg-current opacity-30 rounded-full" style={{ height: `${Math.random() * 100}%` }} />
                ))}
             </div>
             <span className="text-[10px] font-bold opacity-60">0:12</span>
          </div>
        )}

        {isEditingText ? (
          <input 
            autoFocus
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            className="bg-black/10 text-inherit rounded px-1 outline-none w-full"
          />
        ) : (
          <p className="break-words">
            {text}
          </p>
        )}
        
        <div className="flex items-center gap-1 mt-1 justify-end">
          <span className={cn("text-[9px]", isMe && !isWhatsApp ? "text-white/60" : "text-slate-400")}>
            {timestamp}
          </span>
          {isMe && (
            <div className="flex -space-x-2 ml-1">
              {isWhatsApp ? (
                status === 'sent' ? (
                  <Check size={13} className="text-slate-400" />
                ) : (
                  <CheckCheck size={13} className={cn(status === 'read' ? "text-sky-400" : "text-slate-400")} />
                )
              ) : isTelegram ? (
                <Check size={11} className="text-white/60" />
              ) : (
                <div className={cn("w-3 h-3 rounded-full flex items-center justify-center border", status === 'read' ? "bg-blue-600 border-blue-600" : "border-slate-300")}>
                  {status === 'read' && <Check size={8} className="text-white font-black" />}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isMe && (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 mr-1">
          You
        </span>
      )}
    </div>
  );
}
