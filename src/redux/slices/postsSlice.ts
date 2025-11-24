// store/slices/postsSlice.ts
import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { BlogPost } from '../../types';
import api from '../../utils/api';

interface PostsState {
  posts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  searchResults: BlogPost[];
  isSearching: boolean;
  currentPost: BlogPost | null;
  bookmarkedPosts: BlogPost[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  filters: {
    category: string | null;
    status: string | null;
    featured: boolean | null;
    search: string | null;
  };
}

// Async thunks for API calls
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ 
    page = 1, 
    limit = 10, 
    category = null,
    status = 'PUBLISHED',
    featured = null,
    search = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }: { 
    page?: number; 
    limit?: number;
    category?: string | null;
    status?: string | null;
    featured?: boolean | null;
    search?: string | null;
    sortBy?: string;
    sortOrder?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const params: any = { page, limit, sortBy, sortOrder };
      if (category) params.category = category;
      if (status) params.status = status;
      if (featured !== null) params.featured = featured;
      if (search) params.search = search;

      const response = await api.get('/post/v1/allposts', { params });
      // setLoading(false);
      console.log(response)
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/post/v1/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const fetchFeaturedPosts = createAsyncThunk(
  'posts/fetchFeaturedPosts',
  async ({ page = 1, limit = 6 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/post/v1/featured', { 
        params: { page, limit } 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured posts');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async ({ 
    userId, 
    page = 1, 
    limit = 10 
  }: { 
    userId: number; 
    page?: number; 
    limit?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/post/v1/user/${userId}`, { 
        params: { page, limit } 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);


export const searchPosts = createAsyncThunk(
  'posts/searchPosts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await api.get('/post/v1/allposts', { 
        params: { search: query, page: 1, limit: 20 } 
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/post/v1/createPost', postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/post/v1/posts/${postId}`);
      return postId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/post/v1/posts/${postId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  currentPost: null,
  bookmarkedPosts: [],
  totalPosts: 0,
  currentPage: 1,
  totalPages: 1,
  hasMore: false,
  filters: {
    category: null,
    status: null,
    featured: null,
    search: null,
  }
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Synchronous actions for optimistic updates
    toggleLike: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const updatePostLike = (post: BlogPost) => {
        if (post.id === postId) {
          post.stats.isLiked = !post.stats.isLiked;
          post.stats.likes += post.stats.isLiked ? 1 : -1;
        }
      };
      
      state.posts.forEach(updatePostLike);
      state.searchResults.forEach(updatePostLike);
      if (state.currentPost?.id === postId) {
        updatePostLike(state.currentPost);
      }
    },

    toggleBookmark: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const updatePostBookmark = (post: BlogPost) => {
        if (post.id === postId) {
          post.stats.isBookmarked = !post.stats.isBookmarked;
          
          if (post.stats.isBookmarked) {
            if (!state.bookmarkedPosts.find(p => p.id === postId)) {
              state.bookmarkedPosts.push(post);
            }
          } else {
            state.bookmarkedPosts = state.bookmarkedPosts.filter(p => p.id !== postId);
          }
        }
      };
      
      state.posts.forEach(updatePostBookmark);
      state.searchResults.forEach(updatePostBookmark);
      if (state.currentPost?.id === postId) {
        updatePostBookmark(state.currentPost);
      }
    },

    toggleSubscribe: (state, action: PayloadAction<string>) => {
      const authorName = action.payload;
      const updateSubscription = (post: BlogPost) => {
        if (post.author.name === authorName) {
          post.author.isSubscribed = !post.author.isSubscribed;
        }
      };
      
      state.posts.forEach(updateSubscription);
      state.searchResults.forEach(updateSubscription);
      if (state.currentPost?.author.name === authorName) {
        updateSubscription(state.currentPost);
      }
    },

    incrementViews: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const updateViews = (post: BlogPost) => {
        if (post.id === postId) {
          post.stats.views += 1;
        }
      };
      
      state.posts.forEach(updateViews);
      state.searchResults.forEach(updateViews);
      if (state.currentPost?.id === postId) {
        updateViews(state.currentPost);
      }
    },

    setCurrentPost: (state, action: PayloadAction<BlogPost | null>) => {
      state.currentPost = action.payload;
    },

    addPost: (state, action: PayloadAction<BlogPost>) => {
      state.posts.unshift(action.payload);
      state.totalPosts += 1;
    },

    updatePost: (state, action: PayloadAction<{ postId: string; updates: Partial<BlogPost> }>) => {
      const { postId, updates } = action.payload;
      const updatePostData = (post: BlogPost) => {
        if (post.id === postId) {
          Object.assign(post, updates);
        }
      };
      
      state.posts.forEach(updatePostData);
      state.searchResults.forEach(updatePostData);
      state.bookmarkedPosts.forEach(updatePostData);
      if (state.currentPost?.id === postId) {
        Object.assign(state.currentPost, updates);
      }
    },

    clearSearch: (state) => {
      state.searchResults = [];
      state.isSearching = false;
      state.filters.search = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    resetPosts: (state) => {
      state.posts = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.hasMore = false;
      state.totalPosts = 0;
    },

    setFilters: (state, action: PayloadAction<Partial<PostsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.currentPage = 1;
      state.posts = [];
    },

    clearFilters: (state) => {
      state.filters = {
        category: null,
        status: null,
        featured: null,
        search: null,
      };
      state.currentPage = 1;
      state.posts = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch posts
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, totalPosts, currentPage, totalPages, hasMore } = action.payload;
        
        // For infinite scroll: append posts if not first page
        if (currentPage === 1) {
          state.posts = posts || [];
        } else {
          // Avoid duplicates
          const newPosts = (posts || []).filter(
            (newPost: BlogPost) => !state.posts.find(p => p.id === newPost.id)
          );
          state.posts.push(...newPosts);
        }
        
        state.totalPosts = totalPosts || 0;
        state.currentPage = currentPage || 1;
        state.totalPages = totalPages || 1;
        state.hasMore = hasMore || false;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch posts';
      });

    // Fetch single post by ID
    builder
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch post';
      });

    // Fetch featured posts
    builder
      .addCase(fetchFeaturedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts } = action.payload;
        state.posts = posts || [];
        state.error = null;
      })
      .addCase(fetchFeaturedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch featured posts';
      });

    // Fetch user posts
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        const { posts, totalPosts, currentPage, totalPages, hasMore } = action.payload;
        
        if (currentPage === 1) {
          state.posts = posts || [];
        } else {
          state.posts.push(...(posts || []));
        }
        
        state.totalPosts = totalPosts || 0;
        state.currentPage = currentPage || 1;
        state.totalPages = totalPages || 1;
        state.hasMore = hasMore || false;
        state.error = null;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch user posts';
      });

    // Search posts
    builder
      .addCase(searchPosts.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.posts || action.payload || [];
        state.error = null;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string || 'Search failed';
      });

    // Create post
    builder
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
        state.totalPosts += 1;
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to create post';
      });

    // Delete post
    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.posts = state.posts.filter(post => post.id !== postId);
        state.searchResults = state.searchResults.filter(post => post.id !== postId);
        state.bookmarkedPosts = state.bookmarkedPosts.filter(post => post.id !== postId);
        state.totalPosts = Math.max(0, state.totalPosts - 1);
        
        if (state.currentPost?.id === postId) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to delete post';
      });

    // Like post
    builder
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, isLiked, likesCount } = action.payload;
        
        const updatePostFromAPI = (post: BlogPost) => {
          if (post.id === postId) {
            post.stats.isLiked = isLiked;
            post.stats.likes = likesCount;
          }
        };
        
        state.posts.forEach(updatePostFromAPI);
        state.searchResults.forEach(updatePostFromAPI);
        if (state.currentPost?.id === postId) {
          updatePostFromAPI(state.currentPost);
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to like post';
      });
  },
});

export const {
  toggleLike,
  toggleBookmark,
  toggleSubscribe,
  incrementViews,
  setCurrentPost,
  addPost,
  updatePost,
  clearSearch,
  clearError,
  resetPosts,
  setFilters,
  clearFilters
} = postsSlice.actions;

export default postsSlice.reducer;