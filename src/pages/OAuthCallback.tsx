import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/slices/hooks';
import { loginSuccess } from '../redux/slices/authSlice';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  userId: string;
  sub: string;
  email: string;
  picture: string;
  userName: string;
  exp: number;
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);

        // store token
        localStorage.setItem('soloblogger_token', token);

        // dispatch to redux
        dispatch(loginSuccess({
          user: {
            id: decoded.userId,
            username: decoded.sub,
            email: decoded.email,
            name: decoded.userName || decoded.sub,
            profilePictureUrl: decoded.picture || '',
            isVerified: false,
            role: 'user',
            stats: { posts: 0, followers: 0, following: 0 }
          },
          token,
        }));

        // clean URL and redirect
        window.history.replaceState({}, document.title, '/');
        navigate('/home', { replace: true });

      } catch (error) {
        console.error('Invalid OAuth token:', error);
        navigate('/auth', { replace: true });
      }
    } else {
      navigate('/auth', { replace: true });
    }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Signing you in...</p>
    </div>
  );
}
