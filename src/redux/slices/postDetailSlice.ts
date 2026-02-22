import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { BlogPost } from '../../types';
import api from '../../utils/api';
import {
    toggleLike,
    toggleBookmark,
    toggleSubscribe,
    incrementViews,
    updatePost,
    deletePost,
    likePost
} from './postsListSlice';

interface PostDetailState {
    currentPost: BlogPost | null;
    comments: any[]; // We can refine this type later
    isLoading: boolean;
    error: string | null;
}

const initialState: PostDetailState = {
    currentPost: null,
    comments: [],
    isLoading: false,
    error: null,
};

export const fetchPostById = createAsyncThunk(
    'postDetail/fetchPostById',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/post/v1/posts/${postId}`);
            return response as unknown as BlogPost;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
        }
    }
);

export const addComment = createAsyncThunk(
    'postDetail/addComment',
    async ({ postId, content, userId, author, parentId = null }: { postId: string, content: string, userId: string, author: any, parentId?: string | null }, { rejectWithValue }) => {
        try {
            // Updated to match CommentDto: { content, postId, parentId }
            // parentId is passed as-is (null for top-level, ID for replies)
            const response = await api.post('comment/v1/addComment', {
                postId: Number(postId),
                content: content,
                parentId: parentId ? Number(parentId) : null
            }, {
                headers: {
                    'userId': userId
                }
            }) as any;
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
        }
    }
);

export const fetchComments = createAsyncThunk(
    'postDetail/fetchComments',
    async (postId: string, { rejectWithValue }) => {
        try {
            // Updated to follow the new API: @GetMapping(value = "/getComments")
            const response = await api.get(`/comment/v1/getComments?postId=${postId}`);
            return response as unknown as any[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
        }
    }
);

export const fetchReplies = createAsyncThunk(
    'postDetail/fetchReplies',
    async (parentId: string, { rejectWithValue }) => {
        try {
            // Added for: @GetMapping(value = "/getComments/replies")
            const response = await api.get(`/comment/v1/getComments/replies?parentId=${parentId}`);
            return { parentId, replies: response as unknown as any[] };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch replies');
        }
    }
);


export const fetchPostLikeCount = createAsyncThunk(
    'postDetail/fetchPostLikeCount',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/reaction/post/like/count?postId=${postId}`) as any;
            // The response might be a number directly, or an object like { count: number }
            // Return the count as a number
            const count = typeof response === 'number' ? response : (response?.data ?? response);
            console.log('Fetched like count:', count, 'from response:', response);
            return { postId, count: Number(count) };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch like count');
        }
    }
);

const postDetailSlice = createSlice({
    name: 'postDetail',
    initialState,
    reducers: {
        setCurrentPost: (state, action: PayloadAction<BlogPost | null>) => {
            state.currentPost = action.payload;
        },
        clearDetailError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPost = action.payload;
                console.log('Post loaded with likesCount:', action.payload.likesCount);
                console.log('Post stats.likes:', action.payload.stats?.likes);
                state.error = null;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch post';
            })
            .addCase(fetchPostLikeCount.fulfilled, (state, action) => {
                console.log('fetchPostLikeCount.fulfilled called');
                console.log('Current post:', state.currentPost);
                console.log('Payload:', action.payload);
                console.log('Post IDs match?', state.currentPost?.id === action.payload.postId);

                if (state.currentPost) {
                    console.log('Before update - likesCount:', state.currentPost.likesCount);
                    state.currentPost.likesCount = action.payload.count;
                    console.log('After update - likesCount:', state.currentPost.likesCount);
                } else {
                    console.warn('Post ID mismatch or no current post!');
                }
            });

        // Listen to actions from postsListSlice
        builder.addCase(toggleLike, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.isLiked = !state.currentPost.isLiked;
                state.currentPost.likesCount += state.currentPost.isLiked ? 1 : -1;
            }
        });

        builder.addCase(toggleBookmark, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.isBookmarked = !state.currentPost.isBookmarked;
            }
        });

        builder.addCase(toggleSubscribe, (state, action) => {
            if (state.currentPost && state.currentPost.author.name === action.payload) {
                state.currentPost.author.isSubscribed = !state.currentPost.author.isSubscribed;
            }
        });

        builder.addCase(incrementViews, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload) {
                state.currentPost.stats.views += 1;
            }
        });

        builder.addCase(updatePost, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload.postId) {
                Object.assign(state.currentPost, action.payload.updates);
            }
        });

        builder.addCase(deletePost.fulfilled, (state, action) => {
            if (state.currentPost?.id === action.payload) {
                state.currentPost = null;
            }
        });

        builder.addCase(likePost.fulfilled, (state, action) => {
            if (state.currentPost && state.currentPost.id === action.payload.postId) {
                state.currentPost.isLiked = action.payload.liked;
                state.currentPost.likesCount = action.payload.likesCount;
            }
        });

        builder.addCase(addComment.fulfilled, (state, action) => {
            if (state.currentPost) {
                state.currentPost.commentsCount += 1;
                if (state.currentPost.stats) {
                    state.currentPost.stats.comments += 1;
                }

                console.log('addComment.fulfilled payload:', action.payload);
                const { parentId, content, userId, author } = action.meta.arg;

                // Create the comment/reply object
                let newComment = action.payload;
                const isFullComment = newComment && typeof newComment === 'object' && 'content' in newComment;

                if (!isFullComment) {
                    console.log('Payload is not a full comment, creating optimistic entry');
                    newComment = {
                        id: `temp-${Date.now()}`,
                        content,
                        parentId,
                        timestamp: new Date().toISOString(),
                        likes: 0,
                        dislikes: 0,
                        isLiked: false,
                        isDisliked: false,
                        replyCount: 0,
                        author: author || {
                            id: userId,
                            name: 'You',
                            username: 'current_user',
                            avatar: 'https://via.placeholder.com/40'
                        }
                    };
                } else {
                    // Map the backend payload fields
                    newComment = {
                        ...newComment,
                        id: String(newComment.id),
                        timestamp: newComment.createdAt || newComment.timestamp,
                        author: (newComment.author || author) ? {
                            ...(newComment.author || author),
                            name: ((newComment.author || author)?.name && (newComment.author || author).name !== 'Unknown' && !(newComment.author || author).name.startsWith('User '))
                                ? (newComment.author || author).name
                                : ((newComment.author || author)?.username || `user_${newComment.userId}`)
                        } : {
                            id: String(newComment.userId),
                            name: `user_${newComment.userId}`,
                            username: `user_${newComment.userId}`,
                            avatar: 'https://via.placeholder.com/40'
                        },
                        likes: 0,
                        dislikes: 0,
                        isLiked: false,
                        isDisliked: false,
                        replyCount: newComment.replyCount || 0
                    };
                }

                if (parentId) {
                    // It's a reply - find parent and add it
                    const parentIdStr = String(parentId);
                    const parentComment = state.comments.find(c => String(c.id) === parentIdStr);
                    if (parentComment) {
                        if (!parentComment.replies) parentComment.replies = [];
                        parentComment.replies.push(newComment);
                        parentComment.replyCount = (parentComment.replyCount || 0) + 1;
                    }
                } else {
                    // It's a top-level comment
                    state.comments.unshift(newComment);
                }
            }
        });

        builder.addCase(fetchComments.fulfilled, (state, action) => {
            const rawComments = Array.isArray(action.payload) ? action.payload : [];
            state.comments = rawComments.map((c: any) => ({
                ...c,
                id: String(c.id),
                timestamp: c.createdAt || c.timestamp,
                author: c.author ? {
                    ...c.author,
                    name: (c.author.name && c.author.name !== 'Unknown' && !c.author.name.startsWith('User '))
                        ? c.author.name
                        : (c.author.username || `user_${c.userId}`)
                } : {
                    id: String(c.userId),
                    name: `user_${c.userId}`,
                    username: `user_${c.userId}`,
                    avatar: 'https://via.placeholder.com/40'
                },
                likes: c.likes || 0,
                dislikes: c.dislikes || 0,
                isLiked: !!c.isLiked,
                isDisliked: !!c.isDisliked,
                replyCount: c.replyCount || c.replycount || c.repliesCount || (Array.isArray(c.replies) ? c.replies.length : 0),
                replies: Array.isArray(c.replies) ? c.replies.map((r: any) => ({
                    ...r,
                    id: String(r.id),
                    timestamp: r.createdAt || r.timestamp,
                    author: r.author ? {
                        ...r.author,
                        name: (r.author.name && r.author.name !== 'Unknown' && !r.author.name.startsWith('User '))
                            ? r.author.name
                            : (r.author.username || `user_${r.userId}`)
                    } : {
                        id: String(r.userId),
                        name: `user_${r.userId}`,
                        username: `user_${r.userId}`,
                        avatar: 'https://via.placeholder.com/40'
                    }
                })) : undefined
            }));
            console.log('Processed comments:', state.comments);
        });

        builder.addCase(fetchReplies.fulfilled, (state, action) => {
            const { parentId, replies: rawReplies } = action.payload;
            const replies = Array.isArray(rawReplies) ? rawReplies.map((r: any) => ({
                ...r,
                id: String(r.id),
                timestamp: r.createdAt || r.timestamp,
                author: r.author ? {
                    ...r.author,
                    name: (r.author.name && r.author.name !== 'Unknown' && !r.author.name.startsWith('User '))
                        ? r.author.name
                        : (r.author.username || `user_${r.userId}`)
                } : {
                    id: String(r.userId),
                    name: `user_${r.userId}`,
                    username: `user_${r.userId}`,
                    avatar: 'https://via.placeholder.com/40'
                }
            })) : [];

            // Find the parent comment and update its replies
            const comment = state.comments.find(c => String(c.id) === String(parentId));
            if (comment) {
                comment.replies = replies;
                comment.replyCount = replies.length;
            }
            console.log(`Processed replies for ${parentId}:`, replies);
        });

    },
});

export const { setCurrentPost, clearDetailError } = postDetailSlice.actions;
export default postDetailSlice.reducer;
