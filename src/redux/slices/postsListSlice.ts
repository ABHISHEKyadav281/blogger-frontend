import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { BlogPost } from '../../types';
import api from '../../utils/api';

interface PostsListState {
    posts: BlogPost[];
    isLoading: boolean;
    error: string | null;
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

const initialState: PostsListState = {
    posts: [],
    isLoading: false,
    error: null,
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

// Async thunks
export const fetchPosts = createAsyncThunk(
    'postsList/fetchPosts',
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
            console.log('📡 Full API Response:', response);
            const resAny = response as any;
            console.log('📡 Response Keys:', Object.keys(response));
            console.log('📡 Response.data:', resAny.data);
            console.log('📡 Response.content:', resAny.content);
            console.log('📡 Response.posts:', resAny.posts);
            return response as any;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

export const fetchFeaturedPosts = createAsyncThunk(
    'postsList/fetchFeaturedPosts',
    async ({ page = 1, limit = 6 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/post/v1/featured', {
                params: { page, limit }
            });
            return response as any;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured posts');
        }
    }
);

export const fetchUserPosts = createAsyncThunk(
    'postsList/fetchUserPosts',
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
            return response as any;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
        }
    }
);

export const createPost = createAsyncThunk(
    'postsList/createPost',
    async (postData: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/post/v1/createPost', postData);
            return response as any;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create post');
        }
    }
);

export const deletePost = createAsyncThunk(
    'postsList/deletePost',
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
    'postsList/likePost',
    async ({ postId, isLiked }: { postId: string, isLiked: boolean }, { rejectWithValue }) => {
        console.log("Inside likePost thunk for:", postId, "Current State:", isLiked);
        try {
            console.log("Calling API...");
            // If already liked, send DISLIKE to unlike it
            // If not liked, send LIKE to like it
            const reactionType = isLiked ? 'DISLIKE' : 'LIKE';
            console.log("Sending reactionType:", reactionType);

            const response = await api.post(`/reaction/post/react`, null, {
                params: {
                    postId,
                    reactionType
                }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to like post');
        }
    }
);

export const dislikePost = createAsyncThunk(
    'postsList/dislikePost',
    async ({ postId, isDisliked }: { postId: string, isDisliked: boolean }, { rejectWithValue }) => {
        console.log("Inside dislikePost thunk for:", postId, "Current State:", isDisliked);
        try {
            const response = await api.post(`/reaction/post/react`, null, {
                params: {
                    postId,
                    reactionType: 'DISLIKE'
                }
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to dislike post');
        }
    }
);

export const bookmarkPost = createAsyncThunk(
    'postsList/bookmarkPost',
    async ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }, { rejectWithValue }) => {
        try {
            const endpoint = isBookmarked ? `/user/action/unbookmark?postId=${postId}` : `/user/action/bookmark?postId=${postId}`;
            await api.post(endpoint);
            // Return the NEW state (if we were bookmarked, we are now NOT bookmarked, so return false)
            return { postId, isBookmarked: !isBookmarked };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update bookmark');
        }
    }
);

export const fetchBookmarkedPosts = createAsyncThunk(
    'postsList/fetchBookmarkedPosts',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/user/action/bookmarked/posts', {
                params: { page, limit }
            });
            return response as any;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookmarked posts');
        }
    }
);

const postsListSlice = createSlice({
    name: 'postsList',
    initialState,
    reducers: {
        toggleLike: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const updatePostLike = (post: BlogPost) => {
                if (post.id === postId) {
                    post.isLiked = !post.isLiked;
                    post.likesCount += post.isLiked ? 1 : -1;
                }
            };
            state.posts.forEach(updatePostLike);
            state.bookmarkedPosts.forEach(updatePostLike);
        },
        toggleDislike: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const updatePostDislike = (post: BlogPost) => {
                if (post.id === postId) {
                    // If already liked, remove like
                    if (post.isLiked) {
                        post.isLiked = false;
                        post.likesCount = Math.max(0, post.likesCount - 1);
                    }

                    post.isDisliked = !post.isDisliked;
                    // We don't strictly track dislikesCount in UI often, but let's update it if we have it
                    post.likesCount = (post.likesCount || 0) + (post.isDisliked ? -1 : 1);
                }
            };
            state.posts.forEach(updatePostDislike);
            state.bookmarkedPosts.forEach(updatePostDislike);
        },
        toggleBookmark: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const updatePostBookmark = (post: BlogPost) => {
                if (post.id === postId) {
                    post.isBookmarked = !post.isBookmarked;
                    if (post.isBookmarked) {
                        if (!state.bookmarkedPosts.find(p => p.id === postId)) {
                            state.bookmarkedPosts.push(post);
                        }
                    } else {
                        state.bookmarkedPosts = state.bookmarkedPosts.filter(p => p.id !== postId);
                    }
                }
            };
            state.posts.forEach(updatePostBookmark);
        },
        toggleSubscribe: (state, action: PayloadAction<string>) => {
            const authorName = action.payload;
            const updateSubscription = (post: BlogPost) => {
                if (post.author.name === authorName) {
                    post.author.isSubscribed = !post.author.isSubscribed;
                }
            };
            state.posts.forEach(updateSubscription);
            state.bookmarkedPosts.forEach(updateSubscription);
        },
        incrementViews: (state, action: PayloadAction<string>) => {
            const postId = action.payload;
            const updateViews = (post: BlogPost) => {
                if (post.id === postId) {
                    post.stats.views += 1;
                }
            };
            state.posts.forEach(updateViews);
            state.bookmarkedPosts.forEach(updateViews);
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
            state.bookmarkedPosts.forEach(updatePostData);
        },
        resetPosts: (state) => {
            state.posts = [];
            state.currentPage = 1;
            state.totalPages = 1;
            state.hasMore = false;
            state.totalPosts = 0;
        },
        setFilters: (state, action: PayloadAction<Partial<PostsListState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
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
        },
        clearListError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // fetchPosts
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                const payload = action.payload;

                const payloadAny = payload as any;
                // Robust mapping for posts
                const posts = payloadAny?.posts || payloadAny?.data || payloadAny?.content || (Array.isArray(payloadAny) ? payloadAny : []);
                const totalPosts = payloadAny?.totalPosts || payloadAny?.totalElements || 0;
                const currentPage = payloadAny?.currentPage || payloadAny?.number + 1 || 1;
                const totalPages = payloadAny?.totalPages || 1;
                const hasMore = payloadAny?.hasMore || (currentPage < totalPages) || false;

                if (currentPage === 1) {
                    state.posts = posts;
                } else {
                    const newPosts = posts.filter(
                        (newPost: BlogPost) => !state.posts.find(p => p.id === newPost.id)
                    );
                    state.posts.push(...newPosts);
                }

                state.totalPosts = totalPosts;
                state.currentPage = currentPage;
                state.totalPages = totalPages;
                state.hasMore = hasMore;
                state.error = null;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch posts';
            });

        // fetchFeaturedPosts
        builder
            .addCase(fetchFeaturedPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFeaturedPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.posts = action.payload.posts || [];
                state.error = null;
            })
            .addCase(fetchFeaturedPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch featured posts';
            });

        // fetchUserPosts
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

        // createPost
        builder
            .addCase(createPost.fulfilled, (state, action) => {
                state.posts.unshift(action.payload);
                state.totalPosts += 1;
            });

        // deletePost
        builder
            .addCase(deletePost.fulfilled, (state, action) => {
                const postId = action.payload;
                state.posts = state.posts.filter(post => post.id !== postId);
                state.bookmarkedPosts = state.bookmarkedPosts.filter(post => post.id !== postId);
                state.totalPosts = Math.max(0, state.totalPosts - 1);
            });

        // likePost
        builder
            .addCase(likePost.fulfilled, (state, action) => {
                const { postId, liked, likesCount } = action.payload;
                const updatePostFromAPI = (post: BlogPost) => {
                    if (post.id === postId) {
                        post.isLiked = liked;
                        post.likesCount = likesCount;
                    }
                };
                state.posts.forEach(updatePostFromAPI);
                state.bookmarkedPosts.forEach(updatePostFromAPI);
            });

        // dislikePost
        builder
            .addCase(dislikePost.fulfilled, (state, action) => {
                const { postId, isDisliked, dislikesCount, isLiked, likesCount } = action.payload;
                const updatePostFromAPI = (post: BlogPost) => {
                    if (post.id === postId) {
                        post.isDisliked = isDisliked;
                        if (dislikesCount !== undefined) post.dislikesCount = dislikesCount;
                        // Also update like status/count as they might change (mutual exclusion)
                        if (isLiked !== undefined) post.isLiked = isLiked;
                        if (likesCount !== undefined) post.likesCount = likesCount;
                    }
                };
                state.posts.forEach(updatePostFromAPI);
                state.bookmarkedPosts.forEach(updatePostFromAPI);
            });

        // bookmarkPost
        builder
            .addCase(bookmarkPost.fulfilled, (state, action) => {
                const { postId, isBookmarked } = action.payload;
                const updatePostBookmark = (post: BlogPost) => {
                    if (post.id === postId) {
                        post.isBookmarked = isBookmarked;
                    }
                };
                state.posts.forEach(updatePostBookmark);

                // Sync bookmarkedPosts array
                if (!isBookmarked) {
                    state.bookmarkedPosts = state.bookmarkedPosts.filter(p => p.id !== postId);
                } else {
                    // Logic to add to bookmarkedPosts if not present is complex without full post object, 
                    // but usually we toggle on existing list so it might be there.
                    // If we don't have the post object in payload, we can't push it easily unless we find it in state.posts.
                    const foundPost = state.posts.find(p => p.id === postId);
                    if (foundPost && !state.bookmarkedPosts.find(p => p.id === postId)) {
                        state.bookmarkedPosts.push(foundPost);
                    }
                }
            });


        // fetchBookmarkedPosts
        builder
            .addCase(fetchBookmarkedPosts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBookmarkedPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                // Handle various potential API response formats: 
                // 1. { posts: [...] }
                // 2. { data: [...] }
                // 3. { content: [...] } (Spring/JPA)
                // 4. [...] (Direct array)
                const payload = action.payload;
                const posts = payload?.posts || payload?.data || payload?.content || (Array.isArray(payload) ? payload : []);

                const totalPosts = payload?.totalPosts || payload?.totalElements || posts.length;
                const currentPage = payload?.currentPage || payload?.number + 1 || 1;
                const totalPages = payload?.totalPages || 1;
                const hasMore = payload?.hasMore || (currentPage < totalPages) || false;

                state.bookmarkedPosts = posts;
                state.posts = posts;
                state.totalPosts = totalPosts;
                state.currentPage = currentPage;
                state.totalPages = totalPages;
                state.hasMore = hasMore;
            })
            .addCase(fetchBookmarkedPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch bookmarked posts';
            });
    },
});

export const {
    toggleLike,
    toggleDislike,
    toggleBookmark,
    toggleSubscribe,
    incrementViews,
    addPost,
    updatePost,
    resetPosts,
    setFilters,
    clearFilters,
    clearListError
} = postsListSlice.actions;

export default postsListSlice.reducer;
