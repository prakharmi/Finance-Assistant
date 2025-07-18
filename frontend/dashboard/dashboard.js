document.addEventListener('DOMContentLoaded', () => {
    // State Management (This object holds the current state of our filters and pagination.)
    const state = {
        filters: {
            type: 'all',
            category: 'all',
            dateRange: 'all'
        },
        pagination: { // New: Pagination state
            currentPage: 1,
            totalPages: 1,
            itemsPerPage: 10 // Default items per page
        }
    };

    // Element Selectors
    // Grouping all DOM element lookups for easy access and maintenance.
    const elements = {
        welcomeMessage: document.querySelector('#welcome-message h1'),
        themeMenuButton: document.getElementById('theme-menu-button'),
        themeMenu: document.getElementById('theme-menu'),
        profileButtonContainer: document.getElementById('profile-button-container'),
        transactionForm: document.getElementById('transaction-form'),
        dateInput: document.getElementById('date'),
        transactionListDiv: document.getElementById('transaction-list'),
        filterControls: document.getElementById('filter-controls'),
        
        paginationControls: document.getElementById('pagination-controls'),
        limitSelect: document.getElementById('limit-select'),
        pageInfo: document.getElementById('page-info'),
        prevPageBtn: document.getElementById('prev-page-btn'),
        nextPageBtn: document.getElementById('next-page-btn'),
    };

    // Renders the profile button and its dropdown menu
    const renderProfileButton = (user) => {
        const userPicture = user.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${user.displayName.replace(' ', '+')}&background=random&color=fff`;

        elements.profileButtonContainer.innerHTML = `
            <div class="relative">
                <button id="profile-menu-button" type="button" class="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500">
                    <img class="h-8 w-8 rounded-full object-cover" src="${userPicture}" alt="User profile">
                </button>
                <div id="profile-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black dark:ring-white ring-opacity-5 py-1 z-20">
                    <a href="/frontend/analytics/analytics.html" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Analytics</a>
                    <a href="http://localhost:8080/auth/logout" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Logout</a>
                </div>
            </div>
        `;

        const profileMenuButton = document.getElementById('profile-menu-button');
        const profileMenu = document.getElementById('profile-menu');

        if (profileMenuButton && profileMenu) {
            profileMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Hide other menus when opening this one
                if (elements.themeMenu) elements.themeMenu.classList.add('hidden');
                profileMenu.classList.toggle('hidden');
            });
        }
    };

    // API and Rendering functions
    // Fetches transactions based on the current filter and pagination state and calls renderTransaction function to display
    const fetchAndRenderTransactions = async () => {
        const { type, category, dateRange } = state.filters;
        const { currentPage, itemsPerPage } = state.pagination; // New: Get pagination state
        const url = `http://localhost:8080/api/transactions?page=${currentPage}&limit=${itemsPerPage}&type=${type}&category=${category}&dateRange=${dateRange}`;

        try {
            elements.transactionListDiv.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">Loading transactions...</p>'; // Updated loading message
            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            const data = await response.json(); // New: Expect data to contain pagination info
            renderTransactions(data.transactions);
            state.pagination.currentPage = data.currentPage;
            state.pagination.totalPages = data.totalPages;
            updatePaginationUI(); // New: Update pagination UI
        } catch (error) {
            console.error('Error fetching transactions:', error);
            elements.transactionListDiv.innerHTML = '<p class="text-red-500 text-center py-4">Could not load transactions. Please try again later.</p>'; // Updated error message
        }
    };

    // Used to display transactions.
    const renderTransactions = (transactions) => {
        elements.transactionListDiv.innerHTML = ''; // Clear previous content
        if (transactions.length === 0) {
            elements.transactionListDiv.innerHTML = '<p class="text-gray-600 dark:text-gray-400 text-center py-8">No transactions found for the selected filters.</p>';
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
            transactionEl.className = 'bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-between transition-transform transform hover:scale-[1.02]';
            transactionEl.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isExpense ? 'bg-red-100 dark:bg-red-900/50' : 'bg-green-100 dark:bg-green-900/50'}">
                        <span class="text-xl">${t.category.name === 'Salary' ? '💰' : isExpense ? '🛍️' : '📈'}</span>
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
        elements.transactionListDiv.appendChild(container);
    };

    // New: Updates the pagination controls UI based on the current state.
    const updatePaginationUI = () => {
        const { currentPage, totalPages } = state.pagination;
        if (totalPages > 0) {
            elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            elements.prevPageBtn.disabled = currentPage <= 1;
            elements.nextPageBtn.disabled = currentPage >= totalPages;
            elements.paginationControls.classList.remove('hidden');
        } else {
            elements.paginationControls.classList.add('hidden');
        }
    };

    // Functions to create UI of Filters
    const createDropdown = (name, options, defaultLabel) => {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'relative inline-block text-left';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'inline-flex items-center justify-center w-full rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none';
        button.innerHTML = `<span id="${name}-label">${defaultLabel}</span><svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
        const menu = document.createElement('div');
        menu.className = 'origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none hidden z-10';
        options.forEach(option => {
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'text-gray-700 dark:text-gray-300 block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700';
            a.dataset.value = option.value;
            a.textContent = option.label;
            a.onclick = (e) => {
                e.preventDefault();
                document.getElementById(`${name}-label`).textContent = option.label;
                state.filters[name] = option.value;
                state.pagination.currentPage = 1;
                fetchAndRenderTransactions();
                menu.classList.add('hidden');
            };
            menu.appendChild(a);
        });
        dropdownContainer.append(button, menu);
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.relative .origin-top-left, #profile-menu, #theme-menu').forEach(m => m !== menu && m.classList.add('hidden'));
            menu.classList.toggle('hidden');
        });
        return dropdownContainer;
    };

    // Fetches categories for a user and builds all the filter dropdowns.
    const populateFilters = async () => {
        elements.filterControls.innerHTML = '';
        const typeOptions = [{ value: 'all', label: 'All Types' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }];
        elements.filterControls.appendChild(createDropdown('type', typeOptions, 'All Types'));
        const dateOptions = [{ value: 'all', label: 'All Time' }, { value: 'week', label: 'Past Week' }, { value: 'month', label: 'Past Month' }, { value: '3months', label: 'Past 3 Months' }];
        elements.filterControls.appendChild(createDropdown('dateRange', dateOptions, 'All Time'));
        try {
            const res = await fetch('http://localhost:8080/api/transactions/categories', { credentials: 'include' });
            if (res.ok) {
                const categories = await res.json();
                const categoryOptions = [{ value: 'all', label: 'All Categories' }, ...categories.map(cat => ({ value: cat, label: cat }))];
                elements.filterControls.appendChild(createDropdown('category', categoryOptions, 'All Categories'));
            }
        } catch (error) {
            console.error('Could not fetch categories', error);
            const disabledCategory = createDropdown('category', [{ value: 'all', label: 'Could not load' }], 'All Categories');
            disabledCategory.querySelector('button').disabled = true;
            elements.filterControls.appendChild(disabledCategory);
        }
    };

    // Check if the user is logged in.
    (async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/me', { credentials: 'include' });
            if (response.ok) {
                const user = await response.json();
                elements.welcomeMessage.textContent = `Welcome back, ${user.displayName.split(' ')[0]}!`;
                renderProfileButton(user); // New: Render the profile button
                await populateFilters();
                await fetchAndRenderTransactions();
            } else {
                window.location.href = '/frontend/';
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            window.location.href = '/frontend/';
        }
    })();

    // Dark Mode Logic
    if (elements.themeMenuButton && elements.themeMenu) {
        const themeOptions = elements.themeMenu.querySelectorAll('[data-theme]');
        const applyTheme = (theme) => {
            if (theme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        };
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) applyTheme(savedTheme);
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
        elements.themeMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // New: Close other menus
            const profileMenu = document.getElementById('profile-menu');
            if (profileMenu) profileMenu.classList.add('hidden');
            elements.themeMenu.classList.toggle('hidden');
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
                elements.themeMenu.classList.add('hidden');
            });
        });
    }

    // Close all menus if the user clicks anywhere else on the window.
    window.addEventListener('click', () => {
        const profileMenu = document.getElementById('profile-menu');
        if (elements.themeMenu && !elements.themeMenu.classList.contains('hidden')) {
            elements.themeMenu.classList.add('hidden');
        }
        if (profileMenu && !profileMenu.classList.contains('hidden')) {
            profileMenu.classList.add('hidden');
        }
        document.querySelectorAll('.relative .origin-top-left').forEach(m => {
            m.classList.add('hidden');
        });
    });

    // Transaction Form Logic
    if (elements.transactionForm) {
        let transactionType = 'expense';
        const typeButtons = elements.transactionForm.querySelectorAll('.transaction-type-btn');
        typeButtons.forEach(button => {
            button.addEventListener('click', () => {
                transactionType = button.getAttribute('data-type');
                typeButtons.forEach(btn => {
                    btn.classList.remove('bg-white', 'dark:bg-slate-600', 'shadow-sm', 'text-gray-900', 'dark:text-white');
                    btn.classList.add('text-gray-500', 'dark:text-gray-400');
                });
                button.classList.add('bg-white', 'dark:bg-slate-600', 'shadow-sm', 'text-gray-900', 'dark:text-white');
            });
        });
        if (elements.dateInput) elements.dateInput.valueAsDate = new Date();
        elements.transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(elements.transactionForm);
            const transactionData = { type: transactionType, description: formData.get('description'), amount: formData.get('amount'), category: formData.get('category'), date: formData.get('date') };
            try {
                const response = await fetch('http://localhost:8080/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transactionData), credentials: 'include' });
                if (response.ok) {
                    elements.transactionForm.reset();
                    if (elements.dateInput) elements.dateInput.valueAsDate = new Date();
                    state.pagination.currentPage = 1;
                    await fetchAndRenderTransactions();
                } else {
                    alert(`Error: ${(await response.json()).message}`);
                }
            } catch (error) {
                console.error('Failed to submit transaction:', error);
                alert('An error occurred.');
            }
        });
    }

    // Pagination Event Listeners
    if (elements.limitSelect) {
        elements.limitSelect.addEventListener('change', () => {
            state.pagination.itemsPerPage = parseInt(elements.limitSelect.value, 10);
            state.pagination.currentPage = 1;
            fetchAndRenderTransactions();
        });
    }
    if (elements.prevPageBtn) {
        elements.prevPageBtn.addEventListener('click', () => {
            if (state.pagination.currentPage > 1) {
                state.pagination.currentPage--;
                fetchAndRenderTransactions();
            }
        });
    }
    if (elements.nextPageBtn) {
        elements.nextPageBtn.addEventListener('click', () => {
            if (state.pagination.currentPage < state.pagination.totalPages) {
                state.pagination.currentPage++;
                fetchAndRenderTransactions();
            }
        });
    }
});