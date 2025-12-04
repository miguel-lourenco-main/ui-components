import { useEffect, useState } from 'react';

/**
 * Custom hook that tracks online status of the user.
 * @returns {boolean} The online status of the user.
 */
const useOnline = (): boolean => {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        const updateOnlineStatus = () => setIsOnline(true);
        const updateOfflineStatus = () => setIsOnline(false);

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOfflineStatus);

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOfflineStatus);
        };
    }, []);

    return isOnline;
};

export default useOnline;
