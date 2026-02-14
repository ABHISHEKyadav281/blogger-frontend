import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, List, Grid3X3, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import {
  fetchPosts,
  resetPosts,
  setFilters,
} from '../redux/slices/postsListSlice';
import { setModal } from '../redux/slices/uiSlice';
import BlogPreviewCard from '../components/blog/BlogPreviewCard';

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedCategory, onCategorySelect }) => {
  const categories = [
    { name: 'All Posts', slug: null },
    { name: 'Anime Reviews', slug: 'Anime Reviews' },
    { name: 'Manga Discussion', slug: 'Manga Discussion' },
    { name: 'Character Analysis', slug: 'Character Analysis' },
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
                onClick={() => onCategorySelect(category.slug)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  selectedCategory === category.slug
                    ? 'bg-primary/20 border border-primary/30 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{category.name}</span>
                {selectedCategory === category.slug && <Sparkles className="w-4 h-4 text-pink-500" />}
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
  
  // ✅ Redux state
  const postsState = useAppSelector((state) => state.postsList);
  const { posts, isLoading, error, hasMore, currentPage, filters } = postsState;
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { modals } = useAppSelector((state) => state.ui);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // ✅ Fetch posts based on filters
  const fetchWrappedPosts = useCallback((page: number) => {
    dispatch(fetchPosts({ 
      page, 
      limit: 10,
      search: filters.search,
      category: filters.category
    }));
  }, [dispatch, filters]);

  // Handle Initial Load and Filter Changes
  useEffect(() => {
    console.log('🚀 Fetching posts with filters:', filters);
    dispatch(resetPosts());
    fetchWrappedPosts(1);
  }, [dispatch, filters.search, filters.category]);

  // ✅ Category Handler
  const handleCategorySelect = (category: string | null) => {
    dispatch(setFilters({ category }));
  };

  // ✅ Intersection Observer for infinite scroll
  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchWrappedPosts(currentPage + 1);
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, currentPage, fetchWrappedPosts]
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
          <Sidebar 
            selectedCategory={filters.category} 
            onCategorySelect={handleCategorySelect} 
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 lg:ml-72 pb-24 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Categories & Tags (Visible only on mobile/tablet) */}
            <div className="lg:hidden mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleCategorySelect(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    !filters.category 
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' 
                      : 'bg-white/10 text-gray-300 border border-white/10'
                  }`}
                >
                  All Posts
                </button>
                {['Anime Reviews', 'Manga Discussion', 'Character Analysis'].map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      filters.category === cat
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' 
                        : 'bg-white/10 text-gray-300 border border-white/10'
                    }`}
                  >
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
                    <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-gradient-rose">
                      {isAuthenticated ? `Welcome back, ${user?.name}!` : 'Welcome!'} 🎌
                    </h1>
                    <p className="text-gray-300 text-sm md:text-base">
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