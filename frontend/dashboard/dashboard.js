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
            if (theme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        };

        // Check for a saved theme in localStorage or use the system preference.
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) applyTheme(savedTheme);
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
        themeMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('hidden');
        });

        // Event listener for the theme menu button.
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
            if (!themeMenu.classList.contains('hidden')) themeMenu.classList.add('hidden');
        });
    }

    // Transaction Form Logic
    const transactionForm = document.getElementById('transaction-form');
    const typeButtons = document.querySelectorAll('.transaction-type-btn');
    const dateInput = document.getElementById('date');
    let transactionType = 'expense'; // Default to 'expense'

    // UI Logic for Type Buttons
    if (typeButtons.length > 0) {
        typeButtons.forEach(button => {
            button.addEventListener('click', () => {
                transactionType = button.getAttribute('data-type');
                typeButtons.forEach(btn => {
                    btn.classList.remove('bg-white', 'dark:bg-slate-600', 'shadow-sm', 'text-gray-900', 'dark:text-white');
                    btn.classList.add('text-gray-500', 'dark:text-gray-400');
                });
                button.classList.add('bg-white', 'dark:bg-slate-600', 'shadow-sm', 'text-gray-900', 'dark:text-white');
                button.classList.remove('text-gray-500', 'dark:text-gray-400');
            });
        });
    }

    // Set today's date as the default value
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Form Submission Logic
    if (transactionForm) {
        transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default browser refresh

            const formData = new FormData(transactionForm);
            const transactionData = {
                type: transactionType,
                description: formData.get('description'),
                amount: formData.get('amount'),
                category: formData.get('category'),
                date: formData.get('date')
            };

            try {
                // Send the data to our backend API
                const response = await fetch('http://localhost:8080/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transactionData),
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Transaction added successfully!');
                    transactionForm.reset();
                    if (dateInput) {
                        dateInput.valueAsDate = new Date();
                    }
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Failed to submit transaction:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }
});