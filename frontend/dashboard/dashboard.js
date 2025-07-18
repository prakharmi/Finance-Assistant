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
                // Fetch and render transactions when user is confirmed.
                fetchAndRenderTransactions();
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

    // Transaction Display Logic

    const transactionListDiv = document.getElementById('transaction-list');
    // Function to render the list of transactions to the DOM
    const renderTransactions = (transactions) => {
        transactionListDiv.innerHTML = ''; // Clear the existing list content

        const header = document.createElement('h2');
        header.className = 'text-xl font-bold mb-4 text-gray-900 dark:text-white';
        header.textContent = 'Recent Transactions';
        transactionListDiv.appendChild(header);

        if (transactions.length === 0) {
            const p = document.createElement('p');
            p.className = 'text-gray-600 dark:text-gray-400';
            p.textContent = 'No transactions found. Add one using the form above!';
            transactionListDiv.appendChild(p);
            return;
        }

        const container = document.createElement('div');
        container.className = 'space-y-3';

        transactions.forEach(t => {
            const date = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const isExpense = t.type === 'expense';
            const amountColor = isExpense ? 'text-red-500' : 'text-green-500';
            const sign = isExpense ? '-' : '+';

            const transactionEl = document.createElement('div');
            transactionEl.className = 'bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-between';

            transactionEl.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isExpense ? 'bg-red-100 dark:bg-red-900/50' : 'bg-green-100 dark:bg-green-900/50'}">
                        <span class="text-xl">${t.category.name === 'Salary' ? '💰' : isExpense ? '-' : '📈'}</span>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800 dark:text-gray-200">${t.description}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${t.category.name} ・ ${date}</p>
                    </div>
                </div>
                <p class="font-semibold text-lg ${amountColor}">${sign} ₹${t.amount.toLocaleString()}</p>
            `;
            container.appendChild(transactionEl);
        });
        transactionListDiv.appendChild(container);
    };

    // Function to fetch transactions from the API and then render them
    const fetchAndRenderTransactions = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/transactions', { credentials: 'include' });
            if (res.ok) {
                const transactions = await res.json();
                renderTransactions(transactions);
            } else {
                console.error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    // Transaction Form Logic
    const transactionForm = document.getElementById('transaction-form');
    const typeButtons = document.querySelectorAll('.transaction-type-btn');
    const dateInput = document.getElementById('date');
    let transactionType = 'expense';

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
            e.preventDefault();  // Prevent the default browser refresh
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
                    // Refresh transaction list
                    fetchAndRenderTransactions();
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