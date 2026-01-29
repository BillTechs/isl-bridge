
import React, { useState, useEffect } from 'react';

interface Post {
  id: number;
  author: string;
  role: string;
  content: string;
  likes: number;
  comments: number;
  tag: string;
  timestamp: number;
}

interface CommunityViewProps {
  currentUserEmail: string;
}

const CommunityView: React.FC<CommunityViewProps> = ({ currentUserEmail }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "Arun Kumar",
      role: "ISL Instructor",
      content: "Just uploaded a new guide on 'Directional Verbs' in ISL. Essential for moving from basic to intermediate!",
      likes: 24,
      comments: 5,
      tag: "Tutorial",
      timestamp: Date.now() - 3600000
    },
    {
      id: 2,
      author: "Sonia M.",
      role: "Student",
      content: "Managed to translate a full 30-second ISL sentence today using the Bridge! The built-in neural engine is incredibly accurate.",
      likes: 56,
      comments: 12,
      tag: "Success Story",
      timestamp: Date.now() - 7200000
    },
    {
      id: 3,
      author: "Rahul S.",
      role: "Developer",
      content: "Does anyone have a clearer gloss for 'Artificial Intelligence' in ISL? Looking for the most natural way to sign it.",
      likes: 12,
      comments: 18,
      tag: "Question",
      timestamp: Date.now() - 86400000
    }
  ]);

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTag, setNewPostTag] = useState('Discussion');

  const tags = ["Discussion", "Question", "Tutorial", "Success Story", "Feedback"];

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      author: currentUserEmail.split('@')[0],
      role: "Member",
      content: newPostContent,
      likes: 0,
      comments: 0,
      tag: newPostTag,
      timestamp: Date.now()
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsCreatingPost(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Community Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black tracking-tight mb-2">Community Hub</h2>
          <p className="text-emerald-50 opacity-90 text-lg">Connect with thousands of ISL learners and experts. Share, learn, and grow the bridge together.</p>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => setIsCreatingPost(!isCreatingPost)}
              className="px-6 py-3 bg-white text-emerald-600 rounded-2xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              {isCreatingPost ? 'Cancel Post' : 'Start a Discussion'}
            </button>
            <button className="px-6 py-3 bg-emerald-500/50 backdrop-blur text-white rounded-2xl font-bold border border-emerald-400 hover:bg-emerald-500/80 transition-all">
              View Guidelines
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Post Form */}
          {isCreatingPost && (
            <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-500/20 shadow-xl animate-in slide-in-from-top-4 duration-300">
              <h3 className="text-xl font-black text-slate-800 mb-6">Create New Discussion</h3>
              <form onSubmit={handleAddPost} className="space-y-4">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What's on your mind regarding ISL?"
                  className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-emerald-100 outline-none text-slate-700 transition-all resize-none"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewPostTag(tag)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${newPostTag === tag ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    disabled={!newPostContent.trim()}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    Post to Community
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800">Latest Discussions</h3>
            <div className="flex gap-2">
              {['Trending', 'Newest', 'Popular'].map(filter => (
                <button key={filter} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-500 hover:bg-slate-50">
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group animate-in fade-in">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-50 transition-colors uppercase">
                      {post.author[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{post.author}</div>
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{post.role}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {post.tag}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">{post.content}</p>
                <div className="flex items-center gap-6 border-t border-slate-50 pt-4">
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    {post.comments}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Sign Challenge Card */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2">Weekly Challenge</span>
              <h4 className="text-xl font-black text-slate-800 mb-4">Master the 'Family' Signs</h4>
              <p className="text-slate-500 text-sm mb-6">Learn and submit a video of Mother, Father, Brother, and Sister signs to earn the 'Family Link' badge.</p>
              <button className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-100">
                Join Challenge
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 text-6xl opacity-10 rotate-12">🏆</div>
          </div>

          {/* Member Spotlight */}
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Expert Spotlight</h4>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-indigo-500"></div>
              <div>
                <div className="font-bold">Ananya Deshmukh</div>
                <div className="text-xs text-slate-400">ISL Linguistics Expert</div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed italic">"Communication is a human right. Every sign translated is a wall broken down."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
