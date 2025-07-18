document.addEventListener('DOMContentLoaded', () => {
    // Check if the user is logged in.
    (async () => {
        try {
            // We send the credentials to make sure the browser sends the session cookie.
            const response = await fetch('http://localhost:8080/auth/me', { credentials: 'include' });
            
            if (response.ok) {
                // If the response is successful, the user is logged in.
                const user = await response.json();
                const firstName = user.displayName.split(' ')[0]; // Get the first name
                document.querySelector('#welcome-message h1').textContent = `Welcome back, ${firstName}!`;
            } else {
                // If not successful, redirect to the main login page.
                window.location.href = '/frontend/';
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // If there's any network error, redirect to login.
            window.location.href = '/frontend/';
        }
    })();

    // Dark Mode Logic
    const themeMenuButton = document.getElementById('theme-menu-button');
    const themeMenu = document.getElementById('theme-menu');

    if (themeMenuButton && themeMenu) {
        const themeOptions = themeMenu.querySelectorAll('[data-theme]');
        
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        // Check for a saved theme in localStorage or use the system preference.
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        }
        
        // Event listener for the theme menu button.
        themeMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('hidden');
        });

        // Event listeners for each theme option.
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const selectedTheme = e.target.getAttribute('data-theme');
                if (selectedTheme === 'system') {
                    localStorage.removeItem('theme');
                    applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                } else {
                    localStorage.setItem('theme', selectedTheme);
                    applyTheme(selectedTheme);
                }
                themeMenu.classList.add('hidden');
            });
        });

        // Close the menu if the user clicks anywhere else on the window.
        window.addEventListener('click', () => {
            if (!themeMenu.classList.contains('hidden')) {
                themeMenu.classList.add('hidden');
            }
        });
    }
});