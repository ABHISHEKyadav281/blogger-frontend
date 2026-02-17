import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, List, Grid3X3, Filter, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import {
  fetchPosts,
  resetPosts,
} from '../redux/slices/postsListSlice';
import { setModal } from '../redux/slices/uiSlice';
import BlogPreviewCard from '../components/blog/BlogPreviewCard';

const Sidebar: React.FC = () => {

  const categories = [
    { name: 'All Posts', count: 1247, active: true },
    { name: 'Anime Reviews', count: 324 },
    { name: 'Manga Discussion', count: 189 },
    { name: 'News & Updates', count: 156 },
    { name: 'Character Analysis', count: 98 },
    { name: 'Studio Spotlights', count: 67 },
  ];

  const trendingTags = [
    '#AttackOnTitan', '#OnePiece', '#DemonSlayer', '#JujutsuKaisen',
    '#MyHeroAcademia', '#DragonBall', '#Naruto', '#StudioGhibli'
  ];

  return (
    <aside className="w-72 glass-panel border-r border-white/10 h-screen fixed top-16 overflow-y-auto">
      <div className="p-6">
        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Categories</span>
          </h3>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  category.active 
                    ? 'bg-primary/20 border border-primary/30 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{category.name}</span>
                <span className="text-sm bg-white/10 px-2 py-1 rounded-full">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Tags */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Trending Tags</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-white/10 hover:bg-pink-500/20 text-sm text-gray-300 hover:text-white rounded-full transition-all duration-300"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // ✅ Redux state with proper null safety - FIXED: use postsList instead of posts
  const postsState = useAppSelector((state) => state?.postsList);
  const posts = postsState?.posts || [];
  const isLoading = postsState?.isLoading || false;
  const error = postsState?.error || null;
  const hasMore = postsState?.hasMore || false;
  const currentPage = postsState?.currentPage || 1;
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { modals } = useAppSelector((state) => state?.ui);
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // ✅ Fetch initial posts
  useEffect(() => {
    console.log('🚀 Fetching initial posts...');
    dispatch(resetPosts());
    dispatch(fetchPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  // ✅ Debug state
  useEffect(() => {
    console.log('🔍 Redux State:', {
      postsCount: posts.length,
      isLoading,
      error,
      hasMore,
      currentPage
    });
  }, [posts, isLoading, error, hasMore, currentPage]);

  // ✅ Intersection Observer for infinite scroll
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) {
        console.log('⏳ Already loading, skipping...');
        return;
      }
      
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log('🔄 Loading page:', currentPage + 1);
          dispatch(fetchPosts({ 
            page: currentPage + 1, 
            limit: 10 
          }));
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, currentPage, dispatch]
  );

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      dispatch(setModal({ modal: 'login', value: true }));
      return;
    }
    navigate('/create-post');
  };

  // ✅ Initial Loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-background text-white">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-300">Loading amazing posts...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background text-white">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-400 text-xl mb-4">Error loading posts: {error}</p>
            <button 
              onClick={() => {
                dispatch(resetPosts());
                dispatch(fetchPosts({ page: 1, limit: 10 }));
              }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 lg:ml-72 pb-24 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Categories & Tags (Visible only on mobile/tablet) */}
            <div className="lg:hidden mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-lg shadow-pink-500/20">
                  All Posts
                </button>
                {['Anime Reviews', 'Manga', 'News', 'Analysis', 'Studio Ghibli'].map((cat, i) => (
                  <button key={i} className="px-4 py-2 bg-white/10 text-gray-300 hover:text-white rounded-full text-sm font-medium whitespace-nowrap transition-colors border border-white/10">
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Welcome Banner */}
            <div className="mb-8 p-6 glass-panel rounded-3xl border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-2xl shrink-0">
                    <Star className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
                      {isAuthenticated ? `Welcome back, ${user?.name}!` : 'Welcome!'} 🎌
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base line-clamp-2 md:line-clamp-none">
                      {isAuthenticated 
                        ? 'Check out the latest posts from your favorite creators.'
                        : 'Discover the latest anime discussions and reviews.'
                      }
                    </p>
                  </div>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1 self-end md:self-auto">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'list' 
                        ? 'bg-pink-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-pink-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Posts Display */}
            {posts.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">
                  Be the first to share your anime thoughts with the community!
                </p>
                <button 
                  onClick={handleCreatePost}
                  className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <>
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                    : 'space-y-6'
                }`}>
                  {posts.map((post, index) => {
                    // ✅ Attach ref to last element for infinite scroll
                    if (posts.length === index + 1) {
                      return (
                        <div ref={lastPostElementRef} key={post.id}>
                          <BlogPreviewCard post={post} />
                        </div>
                      );
                    }
                    return (
                      <BlogPreviewCard key={post.id} post={post} />
                    );
                  })}
                </div>

                {/* ✅ Loading more indicator */}
                {isLoading && (
                  <div className="mt-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
                      <p className="text-gray-300">Loading more posts...</p>
                    </div>
                  </div>
                )}

                {/* ✅ End of results */}
                {!isLoading && !hasMore && posts.length > 0 && (
                  <div className="mt-12 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-gray-400 text-lg">You've reached the end!</p>
                    <p className="text-gray-500 text-sm mt-2">No more posts to load</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {modals?.login && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          {/* Login Modal Content */}
        </div>
      )}
      
      {modals?.createPost && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          {/* Create Post Modal Content */}
        </div>
      )}
    </div>
  );
};

export default HomePage;