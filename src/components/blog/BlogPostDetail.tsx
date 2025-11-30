// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   Heart, 
//   MessageCircle, 
//   Share2, 
//   Bookmark, 
//   Eye, 
//   Calendar, 
//   Clock, 
//   Tag, 
//   Send,
//   MoreHorizontal,
//   Flag,
//   Copy,
//   Facebook,
//   Twitter,
//   Linkedin,
//   Sparkles
// } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '../../redux/slices/hooks';
// import { fetchPostById, clearDetailError } from '../../redux/slices/postDetailSlice';
// import { toggleLike, toggleBookmark, toggleSubscribe } from '../../redux/slices/postsListSlice';
// import type { Comment } from '../../types';

// // Sample comments (keeping for now until comments API is integrated)
// const sampleComments: Comment[] = [
//   {
//     id: '1',
//     author: {
//       id: 'u1',
//       name: 'OtakuMaster99',
//       username: 'otakumaster',
//       email: 'otaku@example.com',
//       avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
//       isVerified: false,
//       role: 'user',
//       stats: { posts: 0, followers: 0, following: 0 }
//     },
//     content: 'This is an incredible analysis! I never realized how much thought went into the camera work during the ODM gear scenes.',
//     timestamp: '2 hours ago',
//     likes: 23,
//     isLiked: true,
//     replies: []
//   }
// ];

// const BlogPostDetail: React.FC = () => {
//   const { postId } = useParams<{ postId: string }>();
//   const navigate = useNavigate();
//   const dispatch = useAppDispatch();
  
//   const { currentPost: post, isLoading, error } = useAppSelector((state) => state.postDetail);
  
//   const [comments, setComments] = useState<Comment[]>(sampleComments);
//   const [newComment, setNewComment] = useState('');
//   const [replyingTo, setReplyingTo] = useState<string | null>(null);
//   const [replyContent, setReplyContent] = useState('');
//   const [showShareMenu, setShowShareMenu] = useState(false);

//   useEffect(() => {
//     if (postId) {
//       dispatch(fetchPostById(postId));
//     }
//     return () => {
//       dispatch(clearDetailError());
//     };
//   }, [postId, dispatch]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
//       </div>
//     );
//   }

//   if (error || !post) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center text-white p-4">
//         <h2 className="text-2xl font-bold mb-4">Post not found</h2>
//         <p className="text-gray-300 mb-6">{error || "The post you're looking for doesn't exist."}</p>
//         <button
//           onClick={() => navigate('/home')}
//           className="px-6 py-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors"
//         >
//           Go Home
//         </button>
//       </div>
//     );
//   }

//   // Handle like post
//   const handleLikePost = () => {
//     if (post) dispatch(toggleLike(post.id));
//   };

//   // Handle bookmark post
//   const handleBookmark = () => {
//     if (post) dispatch(toggleBookmark(post.id));
//   };

//   // Handle subscribe to author
//   const handleSubscribe = () => {
//     if (post?.author?.name) dispatch(toggleSubscribe(post.author.name));
//   };

//   // Handle add comment (Local state only for now)
//   const handleAddComment = () => {
//     if (newComment.trim()) {
//       const comment: Comment = {
//         id: Date.now().toString(),
//         author: {
//           id: 'currentUser',
//           name: 'You',
//           username: 'you',
//           email: 'you@example.com',
//           avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
//           isVerified: false,
//           role: 'user',
//           stats: { posts: 0, followers: 0, following: 0 }
//         },
//         content: newComment,
//         timestamp: 'just now',
//         likes: 0,
//         isLiked: false,
//         replies: []
//       };
//       setComments([comment, ...comments]);
//       setNewComment('');
//     }
//   };

//   // Handle share
//   const handleShare = (platform: string) => {
//     const url = window.location.href;
//     const title = post.title;
    
//     const shareUrls = {
//       twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
//       facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
//       linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
//       copy: url
//     };

//     if (platform === 'copy') {
//       navigator.clipboard.writeText(url);
//       alert('Link copied to clipboard!');
//     } else {
//       window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
//     }
    
//     setShowShareMenu(false);
//   };

//   // Format content with basic markdown-like styling
//   const formatContent = (content: string) => {
//     if (!content) return null;
//     return content
//       .split('\n\n')
//       .map((paragraph, index) => {
//         if (paragraph.startsWith('## ')) {
//           return (
//             <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-8 first:mt-0">
//               {paragraph.replace('## ', '')}
//             </h2>
//           );
//         }
//         if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
//           return (
//             <h3 key={index} className="text-lg font-semibold text-pink-300 mb-3 mt-6">
//               {paragraph.replace(/\*\*/g, '')}
//             </h3>
//           );
//         }
//         if (paragraph.startsWith('- ')) {
//           const listItems = paragraph.split('\n').filter(item => item.startsWith('- '));
//           return (
//             <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-gray-300">
//               {listItems.map((item, i) => (
//                 <li key={i} className="leading-relaxed">
//                   {item.replace('- ', '')}
//                 </li>
//               ))}
//             </ul>
//           );
//         }
//         return (
//           <p key={index} className="text-gray-300 leading-relaxed mb-6">
//             {paragraph}
//           </p>
//         );
//       });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
//       {/* Background Effects */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
//       </div>

//       <div className="relative z-10 max-w-4xl mx-auto p-6">
//         {/* Back Button */}
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-all duration-300 hover:transform hover:translate-x-1"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           <span>Back to posts</span>
//         </button>

//         {/* Main Article */}
//         <article className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
//           {/* Hero Section */}
//           <div className="relative h-64 md:h-96 overflow-hidden">
//             <img 
//               src={post.coverImage || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop'} 
//               alt={post.title} 
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
//             {/* Hero Content */}
//             <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
//               <div className="flex flex-wrap items-center gap-4 mb-4">
//                 <span className="px-3 py-1 bg-pink-500/80 text-white text-sm font-medium rounded-full backdrop-blur-sm">
//                   {post.category}
//                 </span>
//                 <div className="flex items-center space-x-4 text-gray-300 text-sm">
//                   <span className="flex items-center space-x-1">
//                     <Calendar className="w-4 h-4" />
//                     <span>{post.publishDate}</span>
//                   </span>
//                   <span className="flex items-center space-x-1">
//                     <Clock className="w-4 h-4" />
//                     <span>{post.readTime}</span>
//                   </span>
//                   <span className="flex items-center space-x-1">
//                     <Eye className="w-4 h-4" />
//                     <span>{post.stats.views.toLocaleString()} views</span>
//                   </span>
//                 </div>
//               </div>
//               <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
//                 {post.title}
//               </h1>
//             </div>
//           </div>

//           <div className="p-6 md:p-8">
//             {/* Author Section */}
//             <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
//               <div className="flex items-center space-x-4">
//                 <img 
//                   src={post.author?.avatar || 'https://via.placeholder.com/150'} 
//                   alt={post.author?.name} 
//                   className="w-14 h-14 rounded-full border-2 border-white/20"
//                 />
//                 <div>
//                   <h3 className="font-semibold text-white text-lg">{post.author?.name}</h3>
//                   <p className="text-gray-400 text-sm mb-1">{(post.author?.stats?.followers || 0).toLocaleString()} followers</p>
//                   <p className="text-gray-300 text-sm">{post.author?.bio}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleSubscribe}
//                 className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
//                   post.author?.isSubscribed
//                     ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
//                     : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:shadow-lg hover:scale-105'
//                 }`}
//               >
//                 {post.author?.isSubscribed ? 'Subscribed ✓' : 'Subscribe'}
//               </button>
//             </div>

//             {/* Article Content */}
//             <div className="prose prose-invert max-w-none mb-8">
//               {formatContent(post.content)}
//             </div>

//             {/* Tags */}
//             <div className="flex flex-wrap gap-3 mb-8">
//               {post.tags?.map((tag, index) => (
//                 <button
//                   key={index}
//                   className="px-4 py-2 bg-white/10 hover:bg-pink-500/20 border border-white/20 hover:border-pink-500/30 text-gray-400 hover:text-pink-300 rounded-full transition-all duration-300 flex items-center space-x-2"
//                 >
//                   <Tag className="w-4 h-4" />
//                   <span>#{tag}</span>
//                 </button>
//               ))}
//             </div>

//             {/* Action Bar */}
//             <div className="flex items-center justify-between py-6 border-t border-b border-white/10 mb-8">
//               <div className="flex items-center space-x-6">
//                 <button
//                   onClick={handleLikePost}
//                   className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 ${
//                     post.stats.isLiked 
//                       ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
//                       : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
//                   }`}
//                 >
//                   <Heart className={`w-6 h-6 ${post.stats.isLiked ? 'fill-current' : ''}`} />
//                   <span className="font-medium">{post.stats.likes}</span>
//                 </button>

//                 <div className="flex items-center space-x-3 px-4 py-2 text-gray-400">
//                   <MessageCircle className="w-6 h-6" />
//                   <span className="font-medium">{post.stats.comments}</span>
//                 </div>

//                 <div className="relative">
//                   <button
//                     onClick={() => setShowShareMenu(!showShareMenu)}
//                     className="flex items-center space-x-3 px-4 py-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all duration-300"
//                   >
//                     <Share2 className="w-6 h-6" />
//                     <span>Share</span>
//                   </button>

//                   {showShareMenu && (
//                     <div className="absolute top-full mt-2 left-0 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 min-w-48 z-50">
//                       <div className="space-y-2">
//                         <button
//                           onClick={() => handleShare('twitter')}
//                           className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
//                         >
//                           <Twitter className="w-5 h-5 text-blue-400" />
//                           <span>Twitter</span>
//                         </button>
//                         <button
//                           onClick={() => handleShare('facebook')}
//                           className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
//                         >
//                           <Facebook className="w-5 h-5 text-blue-600" />
//                           <span>Facebook</span>
//                         </button>
//                         <button
//                           onClick={() => handleShare('linkedin')}
//                           className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
//                         >
//                           <Linkedin className="w-5 h-5 text-blue-500" />
//                           <span>LinkedIn</span>
//                         </button>
//                         <button
//                           onClick={() => handleShare('copy')}
//                           className="w-full flex items-center space-x-3 p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
//                         >
//                           <Copy className="w-5 h-5" />
//                           <span>Copy Link</span>
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={handleBookmark}
//                   className={`p-3 rounded-full transition-all duration-300 ${
//                     post.stats.isBookmarked 
//                       ? 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30' 
//                       : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
//                   }`}
//                 >
//                   <Bookmark className={`w-6 h-6 ${post.stats.isBookmarked ? 'fill-current' : ''}`} />
//                 </button>

//                 <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
//                   <Flag className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>

//             {/* Comments Section */}
//             <div>
//               <h3 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
//                 <MessageCircle className="w-7 h-7" />
//                 <span>Comments ({comments.length})</span>
//               </h3>

//               {/* Add Comment */}
//               <div className="mb-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
//                 <div className="flex space-x-4">
//                   <img
//                     src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
//                     alt="Your avatar"
//                     className="w-12 h-12 rounded-full border-2 border-white/20"
//                   />
//                   <div className="flex-1">
//                     <textarea
//                       value={newComment}
//                       onChange={(e) => setNewComment(e.target.value)}
//                       placeholder="Share your thoughts about this post..."
//                       className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/10 resize-none transition-all duration-300"
//                       rows={4}
//                     />
//                     <div className="flex justify-between items-center mt-4">
//                       <div className="text-sm text-gray-400">
//                         {newComment.length}/500 characters
//                       </div>
//                       <button
//                         onClick={handleAddComment}
//                         disabled={!newComment.trim()}
//                         className="px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                       >
//                         <Send className="w-4 h-4" />
//                         <span>Post Comment</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Comments List */}
//               <div className="space-y-6">
//                 {comments.map((comment) => (
//                   <div key={comment.id} className="space-y-4">
//                     {/* Main Comment */}
//                     <div className="flex space-x-4">
//                       <img 
//                         src={comment.author.avatar} 
//                         alt={comment.author.name} 
//                         className="w-12 h-12 rounded-full border-2 border-white/20" 
//                       />
//                       <div className="flex-1">
//                         <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center space-x-3">
//                               <span className="font-medium text-white">{comment.author.name}</span>
//                               <span className="text-sm text-gray-400">{comment.timestamp}</span>
//                             </div>
//                             <button className="text-gray-400 hover:text-white transition-colors">
//                               <MoreHorizontal className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <p className="text-gray-300 leading-relaxed">{comment.content}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </article>

//         {/* Related Posts Section - Placeholder for now */}
//         <div className="mt-12">
//           <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
//             <Sparkles className="w-7 h-7 text-pink-400" />
//             <span>Related Posts</span>
//           </h2>
//           <p className="text-gray-400">Related posts coming soon...</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogPostDetail;



// Add this helper function at the top of your BlogPostDetail component

const BlogPostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentPost: post, isLoading, error } = useAppSelector((state) => state.postDetail);
  
  // ... rest of your existing state

  // ✅ ADD THIS HELPER FUNCTION
  const getImageSource = () => {
    if (!post) return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop';
    
    // Priority: coverImageData (Base64) > coverImage (URL) > placeholder
    if (post.coverImageData) {
      return post.coverImageData;
    }
    if (post.coverImage) {
      return post.coverImage;
    }
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop';
  };

  // ... rest of your component code

  // In your JSX, UPDATE THE IMAGE TAG:
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* ... existing code ... */}
      
      <article className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img 
            src={getImageSource()} 
            alt={post.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop';
            }}
          />
          {/* ... rest of hero section ... */}
        </div>
        {/* ... rest of your component ... */}
      </article>
    </div>
  );
};

export default BlogPostDetail;