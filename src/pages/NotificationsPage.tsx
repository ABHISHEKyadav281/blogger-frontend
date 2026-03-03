import React, { useEffect } from 'react';
import { Bell, Check, Trash2, Clock, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/slices/hooks';
import { fetchNotifications, markAllAsRead, clearNotifications } from '../redux/slices/notificationSlice';
import { addToast } from '../redux/slices/uiSlice';

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, hasMore, page, error } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 0 }));
    return () => {
      dispatch(clearNotifications());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: error,
        duration: 5000
      }));
    }
  }, [error, dispatch]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Success',
        message: 'All notifications marked as read',
        duration: 3000
      }));
    } catch (error: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: error || 'Failed to mark all as read',
        duration: 5000
      }));
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchNotifications({ page: page + 1 }));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <div className="p-2 bg-pink-500/20 text-pink-400 rounded-lg"><Sparkles className="w-5 h-5" /></div>;
      case 'comment': return <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Bell className="w-5 h-5" /></div>;
      case 'follow': return <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Check className="w-5 h-5" /></div>;
      default: return <div className="p-2 bg-gray-500/20 text-gray-400 rounded-lg"><Bell className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/20 rounded-2xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Notifications</h1>
            <p className="text-gray-400">Stay updated with your latest interactions</p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-gray-400">No notifications yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              When you get likes, comments, or follows, they'll show up here!
            </p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 rounded-2xl border transition-all ${
                  notification.read 
                    ? 'bg-transparent border-white/5 opacity-70' 
                    : 'bg-white/5 border-pink-500/20 shadow-lg shadow-pink-500/5'
                }`}
              >
                {getNotificationIcon(notification.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notification.timestamp || '').toLocaleString()}</span>
                        </span>
                        {!notification.read && (
                          <span className="flex items-center space-x-1 text-pink-400">
                            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                            <span>New</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-2xl transition-all disabled:opacity-50"
              >
                {isLoading ? 'Loading more...' : 'Load more notifications'}
              </button>
            )}
          </>
        )}

        {isLoading && page === 0 && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/10" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
