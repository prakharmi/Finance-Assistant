// Dark Mode Logic (Exactly like previous project)
const themeMenuButton = document.getElementById('theme-menu-button');
const themeMenu = document.getElementById('theme-menu');

if (themeMenuButton && themeMenu) {
    const themeOptions = themeMenu.querySelectorAll('[data-theme]');
    
    const applyTheme = (theme) => {
        const htmlEl = document.documentElement;
        if (theme === 'dark') {
            htmlEl.classList.add('dark');
        } else {
            htmlEl.classList.remove('dark');
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }

    themeMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('hidden');
    });

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

    window.addEventListener('click', () => {
        if (!themeMenu.classList.contains('hidden')) {
            themeMenu.classList.add('hidden');
        }
    });
}