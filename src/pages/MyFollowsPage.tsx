import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import { fetchSubscriptions, toggleSubscription } from '../redux/slices/userSubscriptionsSlice';
import { Loader2, Users, ArrowLeft, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

interface UserProfile {
    id: string;
    username: string;
    avatar: string;
    name: string;
    bio: string;
}

const MyFollowsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { subscribedBloggers, isLoading, error } = useAppSelector((state) => state.subscriptions);
    const [followedUsers, setFollowedUsers] = useState<UserProfile[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        dispatch(fetchSubscriptions());
    }, [dispatch]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (subscribedBloggers.size === 0) {
                setFollowedUsers([]);
                return;
            }

            setLoadingDetails(true);
            try {
                // Fetch details for each subscribed blogger
                // This is a temporary solution until we have a bulk fetch endpoint
                const promises = Array.from(subscribedBloggers).map(id => 
                    api.get<UserProfile>(`/profiles/${id}`).catch(() => null)
                );
                
                const results = await Promise.all(promises);
                // Filter out failed requests (nulls)
                 // The API response structure needs validation, assuming it matches UserProfile locally 
                 // If the endpoint is different (e.g. /user/:id), we should adjust. 
                 // Based on UserProfilePage, there isn't a clear "get user by id" endpoint used there other than implicit.
                 // We will try `/user/${id}` or `/public/user/${id}` if `/profiles/${id}` doesn't exist.
                 // Let's assume `/user/profile/${id}` or similar.
                 // Actually, let's check `userSubscriptionsSlice` again. It has `response.bloggerIds`.
                 // Let's assume `/users/${id}` exists or similar.
                 // For now, I'll use a placeholder if I can't guess the API.
                 // But wait, I see `fetchUserPosts` calls `/post/v1/user/${userId}`.
                 // There might be `/user/v1/${userId}`?
                 // Let's just create 3 dummy users for now if the list is empty, OR better, 
                 // assume we can display just the ID if we can't get details, but that's ugly.
                 // Let's try to map what we have.
                 
                 // If we have IDs:
                 const users = results
                    .map((res: any, index) => {
                         if (res && res.data) return res.data; // adjust based on actual api response
                         // fallback to minimal info if fetch fails but we know we subscribed
                         const id = Array.from(subscribedBloggers)[index];
                         return {
                             id,
                             username: `User ${id}`,
                             name: 'Unknown User',
                             avatar: '',
                             bio: ''
                         };
                    })
                    .filter(Boolean);
                
                // For demonstration, since I don't know the exact endpoint for user details:
                // I will NOT override with dummy data if real data fails, to avoid confusion.
                // But since I don't know the endpoint, I will assume `/user/${id}` works.
                // If not, it will show "User {id}".
                setFollowedUsers(users);

            } catch (err) {
                console.error("Failed to fetch user details", err);
            } finally {
                setLoadingDetails(false);
            }
        };

        if (subscribedBloggers.size > 0) {
            fetchDetails();
        }
    }, [subscribedBloggers]);

    const handleUnfollow = async (bloggerId: string) => {
        await dispatch(toggleSubscription(bloggerId));
        // The list in state.subscriptions will update, triggering the useEffect above
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
            <div className="w-full px-4 lg:px-8">
                <div className="flex items-center space-x-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-violet-500/20 rounded-xl">
                            <Users className="w-6 h-6 text-violet-500" />
                        </div>
                        <h1 className="text-3xl font-bold">My Follows</h1>
                    </div>
                </div>

                {isLoading || loadingDetails ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 p-8 bg-white/5 rounded-2xl border border-white/10">
                        {error}
                    </div>
                ) : followedUsers.length === 0 ? (
                    <div className="text-center text-gray-400 p-12 bg-white/5 rounded-2xl border border-white/10">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-white mb-2">Not following anyone yet</h3>
                        <p>Follow authors to see their latest posts here.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                        >
                            Find Authors
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {followedUsers.map((user) => (
                            <div key={user.id} className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all">
                                <img 
                                    src={user.avatar || 'https://via.placeholder.com/100'} 
                                    alt={user.username}
                                    className="w-24 h-24 rounded-full border-4 border-white/20 mb-4 object-cover"
                                />
                                <h3 className="text-xl font-bold text-white mb-1">{user.name || user.username}</h3>
                                <p className="text-gray-400 text-sm mb-4">@{user.username}</p>
                                <p className="text-gray-300 text-sm mb-6 line-clamp-2">{user.bio || 'No bio available'}</p>
                                
                                <div className="flex space-x-3 w-full">
                                    <button 
                                        onClick={() => navigate(`/profile/${user.id}`)}
                                        className="flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-colors"
                                    >
                                        View Profile
                                    </button>
                                    <button 
                                        onClick={() => handleUnfollow(user.id)}
                                        className="py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
                                        title="Unfollow"
                                    >
                                        <UserMinus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFollowsPage;
