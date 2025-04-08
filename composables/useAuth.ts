// composables/useAuth.ts
export const useAuth = () => {
    const isAuthenticated = useState('isAuthenticated', () => false);
    const user = useState('user', () => null);
    const config = useRuntimeConfig(); // Используем useRuntimeConfig()
    const api = config.public.API_URL;

    const login = async (email: string, password: string) => {
        try {
            const response = await $fetch(api + '/api/adminlogin', {
                method: 'POST',
                body: JSON.stringify({email, password}),
            });

            // Сохраняем токен
            localStorage.setItem('auth_token', response.token);

            // Обновляем состояние
            isAuthenticated.value = true;
            user.value = response.user;

            // Возвращаем null, если ошибок нет
            return null;
        } catch (error) {
            console.error('Ошибка при авторизации:', error);

            // Возвращаем ошибку
            return error;
        }
    };

    const logout = async () => {
        try {
            await $fetch(api + '/api/adminlogout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            // Удаляем токен
            localStorage.removeItem('auth_token');

            // Обновляем состояние
            isAuthenticated.value = false;
            user.value = null;
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const response = await fetch(api + '/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    user.value = await response.json(); // Обновляем данные пользователя
                    isAuthenticated.value = true;
                } else {
                    //await logout();
                }
            } catch (err) {
                //await logout();
            }
        } else {
            //await logout();
        }
    };

    return {
        isAuthenticated,
        user,
        login,
        logout,
        checkAuth,
    };
};