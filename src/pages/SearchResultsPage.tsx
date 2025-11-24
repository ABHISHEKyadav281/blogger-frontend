import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft, 
  RefreshCw,
  AlertCircle,
  Heart,
  MessageCircle,
  Eye,
  Star,
  Calendar,
  Clock
} from 'lucide-react';

// Types
interface SearchResult {
  id: string;
  type: 'post' | 'user';
  title: string;
  excerpt?: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  coverImage?: string;
  category?: string;
  publishDate?: string;
  readTime?: string;
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
  // For user results
  bio?: string;
  location?: string;
  followers?: number;
}

// API Functions - Replace these with your actual API calls
const searchContent = async (query: string): Promise<SearchResult[]> => {
  // TODO: Replace with your actual API endpoint
  /*
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // if needed
      }
    });
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
  */
  
  // Dummy data with delay simulation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const dummyResults: SearchResult[] = [
    {
      id: '1',
      type: 'post',
      title: 'Attack on Titan Final Season: A Masterpiece Conclusion',
      excerpt: 'An in-depth analysis of how the final season brought Hajime Isayama\'s epic tale to a satisfying close...',
      author: {
        name: 'AnimeCritic Pro',
        username: 'animecritic',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      },
      coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      category: 'Anime Reviews',
      publishDate: 'March 20, 2024',
      readTime: '12 min read',
      stats: {
        likes: 1247,
        comments: 189,
        views: 5632
      }
    },
    {
      id: '2',
      type: 'user',
      title: 'OtakuMaster99',
      bio: 'Passionate anime reviewer with 5+ years of experience. Specializing in psychological anime and character analysis.',
      author: {
        name: 'OtakuMaster99',
        username: 'otakumaster99',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
      },
      location: 'Tokyo, Japan',
      followers: 2340,
      stats: {
        likes: 15600,
        comments: 0,
        views: 45200
      }
    },
    {
      id: '3',
      type: 'post',
      title: 'One Piece: The Greatest Storytelling Achievement in Manga',
      excerpt: 'After 1000+ chapters, Eiichiro Oda continues to surprise fans with incredible world-building...',
      author: {
        name: 'MangaExpert',
        username: 'mangaexpert',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      coverImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=250&fit=crop',
      category: 'Manga Discussion',
      publishDate: 'March 15, 2024',
      readTime: '15 min read',
      stats: {
        likes: 2156,
        comments: 342,
        views: 8974
      }
    }
  ];
  
  // Filter results based on query
  if (!query) return dummyResults;
  
  const searchText = query.toLowerCase();
  return dummyResults.filter(result => 
    result.title.toLowerCase().includes(searchText) ||
    result.excerpt?.toLowerCase().includes(searchText) ||
    result.bio?.toLowerCase().includes(searchText) ||
    result.author.name.toLowerCase().includes(searchText)
  );
};

// Search Result Components
const PostResult: React.FC<{ 
  result: SearchResult; 
  searchTerm: string; 
  onView: (id: string) => void;
}> = ({ result, searchTerm, onView }) => {
  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400/30 text-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:border-pink-500/30"
      onClick={() => onView(result.id)}
    >
      <div className="flex">
        <img 
          src={result.coverImage} 
          alt={result.title}
          className="w-48 h-32 object-cover flex-shrink-0"
        />
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                  {result.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                {highlightText(result.title)}
              </h3>
              <p className="text-gray-300 mb-3 line-clamp-2">
                {highlightText(result.excerpt || '')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={result.author.avatar} 
                  alt={result.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-gray-400 text-sm">{result.author.name}</span>
              </div>
              <span className="text-gray-500 text-sm flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{result.publishDate}</span>
              </span>
              <span className="text-gray-500 text-sm flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{result.readTime}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{result.stats.likes}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{result.stats.comments}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{result.stats.views}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserResult: React.FC<{ 
  result: SearchResult; 
  searchTerm: string; 
  onView: (id: string) => void;
}> = ({ result, searchTerm, onView }) => {
  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400/30 text-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:border-pink-500/30"
      onClick={() => onView(result.id)}
    >
      <div className="flex items-start space-x-4">
        <img
          src={result.author.avatar}
          alt={result.author.name}
          className="w-16 h-16 rounded-full border-2 border-white/20"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-white text-lg">
                {highlightText(result.author.name)}
              </h3>
              <p className="text-pink-400 text-sm">@{result.author.username}</p>
            </div>
          </div>
          
          <p className="text-gray-300 mb-3 line-clamp-2">
            {highlightText(result.bio || '')}
          </p>
          
          {result.location && (
            <p className="text-gray-400 text-sm mb-3">{result.location}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-white">
                <strong>{result.followers?.toLocaleString()}</strong>
                <span className="text-gray-400 ml-1">followers</span>
              </span>
              <span className="text-white">
                <strong>{result.stats.likes.toLocaleString()}</strong>
                <span className="text-gray-400 ml-1">likes</span>
              </span>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm">
              Follow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Search Results Page
const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const initialQuery = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update search term when URL changes
  useEffect(() => {
    const query = searchParams.get('q') || '';
    if (query !== searchTerm) {
      setSearchTerm(query);
      if (query) {
        handleSearch(query, false);
      }
    }
  }, [searchParams]);

  // Main search function
  const handleSearch = async (query: string, updateUrl: boolean = true) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      
      if (updateUrl) {
        setSearchTerm(query);
        setSearchParams({ q: query });
      }
      
      // Call your search API here
      const searchResults = await searchContent(query);
      setResults(searchResults);
      
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultView = (id: string) => {
    navigate(`/post/${id}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Redirect to home if no search query
  useEffect(() => {
    if (!initialQuery && !searchTerm) {
      navigate('/');
    }
  }, [initialQuery, searchTerm, navigate]);

  // Separate posts and users
  const posts = results.filter(r => r.type === 'post');
  const users = results.filter(r => r.type === 'user');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                    placeholder="Search posts and users..."
                    className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300"
                  />
                  {isSearching ? (
                    <RefreshCw className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400 animate-spin" />
                  ) : (
                    <button
                      onClick={() => handleSearch(searchTerm)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-pink-400 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Search Results for "{searchTerm}"
            </h1>
            <p className="text-gray-400">
              Found {results.length} results {isSearching ? '...' : 'in 0.34 seconds'}
            </p>
          </div>

          {/* Loading State */}
          {isSearching && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-48 h-32 bg-white/10 rounded"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                      <div className="h-3 bg-white/10 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {!isSearching && (
            <>
              {results.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-400 mb-6">
                    Try different search terms to find what you're looking for.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                  >
                    Browse All Posts
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Posts Section */}
                  {posts.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                        <Star className="w-6 h-6 text-pink-400" />
                        <span>Posts ({posts.length})</span>
                      </h2>
                      <div className="space-y-4">
                        {posts.map((result) => (
                          <PostResult
                            key={result.id}
                            result={result}
                            searchTerm={searchTerm}
                            onView={handleResultView}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users Section */}
                  {users.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                        <Star className="w-6 h-6 text-blue-400" />
                        <span>Users ({users.length})</span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {users.map((result) => (
                          <UserResult
                            key={result.id}
                            result={result}
                            searchTerm={searchTerm}
                            onView={handleResultView}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResultsPage;