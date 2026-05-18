import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, X, Search, ChevronRight, Check, Zap, Sparkles } from 'lucide-react';
import { PROFILE_TEMPLATES, ProfileTemplate } from '../constants/templates';
import { cn } from '../lib/utils';

interface TemplateWidgetProps {
  onSelectTemplate: (template: ProfileTemplate) => void;
}

export const TemplateWidget: React.FC<TemplateWidgetProps> = ({ onSelectTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = PROFILE_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Side Tab */}
      <div 
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60]"
      >
        <button
          id="template-widget-tab"
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-3 rounded-l-2xl shadow-lg border-l border-y border-indigo-400/30 flex flex-col items-center gap-2 hover:bg-indigo-500 transition-all hover:pr-5 group"
        >
          <Layers size={20} className="group-hover:scale-110 transition-transform" />
          <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-widest text-indigo-100">Templates</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70]"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-slate-200 z-[80] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display">Template Gallery</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quick-Inject Identities</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search platform or niche..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 ring-indigo-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    layoutId={template.id}
                    className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => {
                      onSelectTemplate(template);
                      setIsOpen(false);
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: template.themeColor }} />
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <img 
                          src={template.avatarUrl} 
                          alt={template.name}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                        {template.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                            <Sparkles size={10} className="text-indigo-600 fill-indigo-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-800">{template.name}</h3>
                          <span 
                            className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border"
                            style={{ 
                              color: template.themeColor, 
                              borderColor: `${template.themeColor}33`,
                              backgroundColor: `${template.themeColor}11`
                            }}
                          >
                            {template.platform}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">@{template.handle}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 italic mb-3">
                      "{template.bio.split('\n')[0]}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Check size={10} className="text-emerald-500" />
                          {template.followersCount} Follows
                        </span>
                        <span>{template.postsCount} Posts</span>
                      </div>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                ))}

                {filteredTemplates.length === 0 && (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                      <Zap size={24} />
                    </div>
                    <p className="text-sm text-slate-400 font-medium whitespace-pre-wrap">
                      No matching identities found.{"\n"}Try a different search.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                  <Sparkles size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Pro Design Tip</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Selecting a template will instantly overwrite your current identity stats in the Profile Editor.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
