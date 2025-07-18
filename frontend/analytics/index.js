document.addEventListener('DOMContentLoaded', () => {
    // check if user is logged in, else redirect to landing page
    (async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/me', { credentials: 'include' });
            if (!response.ok) {
                window.location.href = '/frontend/index.html';
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/frontend/';
        }
    })();
});