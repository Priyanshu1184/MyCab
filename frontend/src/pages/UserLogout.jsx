import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useLogout = () => {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            await axios.get(`${import.meta.env.VITE_API_URL}/users/logout`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return logout;
};

export default useLogout;
