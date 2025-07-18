document.addEventListener('DOMContentLoaded', () => {
    // These variables will hold our chart instances.
    let categoryChart = null;
    let monthlySummaryChart = null;
    let categoryTrendChart = null;

    // This object holds all the DOM elements we'll be working with.
    const elements = {
        themeMenuButton: document.getElementById('theme-menu-button'),
        themeMenu: document.getElementById('theme-menu'),
        profileButtonContainer: document.getElementById('profile-button-container'),
        summaryCards: document.getElementById('summary-cards'),
        categoryChartContainer: document.getElementById('category-chart-container'),
        monthlySummaryChartContainer: document.getElementById('monthly-summary-chart-container'),
        categoryTrendSelect: document.getElementById('category-trend-select'),
        categoryTrendChartContainer: document.getElementById('category-trend-chart-container'),
    };

    // Helper Functions
    const isDarkMode = () => document.documentElement.classList.contains('dark');
    const getChartColors = () => ({
        textColor: isDarkMode() ? '#CBD5E1' : '#475569',
        gridColor: isDarkMode() ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderColor: isDarkMode() ? '#1E293B' : '#FFFFFF',
    });
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // UI Rendering
    // Renders the user's profile button and dropdown in the header.
    const renderProfileButton = (user) => {
        const userPicture = user.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${user.displayName.replace(' ', '+')}&background=random&color=fff`;
        elements.profileButtonContainer.innerHTML = `
            <div class="relative">
                <button id="profile-menu-button" type="button" class="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500">
                    <img class="h-8 w-8 rounded-full object-cover" src="${userPicture}" alt="User profile">
                </button>
                <div id="profile-menu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black dark:ring-white ring-opacity-5 py-1 z-20">
                    <a href="/frontend/dashboard/" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Dashboard</a>
                    <a href="http://localhost:8080/auth/logout" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">Logout</a>
                </div>
            </div>
        `;
        const profileMenuButton = document.getElementById('profile-menu-button');
        const profileMenu = document.getElementById('profile-menu');
        if (profileMenuButton && profileMenu) {
            profileMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.themeMenu.classList.add('hidden');
                profileMenu.classList.toggle('hidden');
            });
        }
    };
    
    // Fetches the financial summary data from the API and renders the summary cards.
    const renderSummaryCards = async () => {
        try {
            elements.summaryCards.innerHTML = `<p class="text-gray-500 dark:text-gray-400 md:col-span-3">Loading summary...</p>`;
            const response = await fetch('http://localhost:8080/api/analytics/summary', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch summary');
            const summary = await response.json();
            elements.summaryCards.innerHTML = `
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"><h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Income</h3><p class="text-3xl font-bold text-green-500 mt-1">${formatCurrency(summary.totalIncome)}</p></div>
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"><h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expenses</h3><p class="text-3xl font-bold text-red-500 mt-1">${formatCurrency(summary.totalExpense)}</p></div>
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"><h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Net Savings</h3><p class="text-3xl font-bold ${summary.netSavings >= 0 ? 'text-blue-500' : 'text-yellow-500'} mt-1">${formatCurrency(summary.netSavings)}</p></div>
            `;
        } catch (error) {
            console.error(error);
            elements.summaryCards.innerHTML = `<p class="text-red-500 md:col-span-3">Could not load summary data.</p>`;
        }
    };

    // Fetches expense data grouped by category and renders it as a doughnut chart.
    const renderCategoryChart = async () => {
        try {
            elements.categoryChartContainer.innerHTML = '<canvas id="category-chart"></canvas>';
            const response = await fetch('http://localhost:8080/api/analytics/expenses-by-category', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch category data');
            const data = await response.json();
            if (data.length === 0) {
                elements.categoryChartContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 pt-16">No expense data to display.</p>';
                return;
            }
            const labels = data.map(item => item.category);
            const amounts = data.map(item => item.totalAmount);
            const colors = getChartColors();
            const ctx = document.getElementById('category-chart').getContext('2d');
            if (categoryChart) categoryChart.destroy();
            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{ data: amounts, backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'], borderColor: colors.borderColor, borderWidth: 4 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: colors.textColor } } } }
            });
        } catch (error) {
            console.error(error);
            elements.categoryChartContainer.innerHTML = '<p class="text-center text-red-500 pt-16">Could not load category chart.</p>';
        }
    };

    // Fetches monthly income vs. expense data and renders it as a bar chart.
    const renderMonthlySummaryChart = async () => {
        try {
            elements.monthlySummaryChartContainer.innerHTML = '<canvas id="monthly-summary-chart"></canvas>';
            const response = await fetch('http://localhost:8080/api/analytics/monthly-summary', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch monthly data');
            const data = await response.json();
            if (data.length === 0) {
                elements.monthlySummaryChartContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 pt-16">No data for monthly summary.</p>';
                return;
            }
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthlyMap = {};
            data.forEach(item => {
                const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
                if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0, label: `${monthNames[item._id.month - 1]} ${item._id.year}` };
                monthlyMap[monthKey][item._id.type] = item.totalAmount;
            });
            const sortedKeys = Object.keys(monthlyMap).sort();
            const labels = sortedKeys.map(key => monthlyMap[key].label);
            const incomeData = sortedKeys.map(key => monthlyMap[key].income);
            const expenseData = sortedKeys.map(key => monthlyMap[key].expense);
            const colors = getChartColors();
            const ctx = document.getElementById('monthly-summary-chart').getContext('2d');
            if (monthlySummaryChart) monthlySummaryChart.destroy();
            monthlySummaryChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Income', data: incomeData, backgroundColor: 'rgba(16, 185, 129, 0.6)' },
                        { label: 'Expense', data: expenseData, backgroundColor: 'rgba(239, 68, 68, 0.6)' }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: colors.textColor }, grid: { color: colors.gridColor } },
                        x: { ticks: { color: colors.textColor }, grid: { color: colors.gridColor } }
                    },
                    plugins: { legend: { labels: { color: colors.textColor } } }
                }
            });
        } catch (error) {
            console.error(error);
            elements.monthlySummaryChartContainer.innerHTML = '<p class="text-center text-red-500 pt-16">Could not load monthly summary chart.</p>';
        }
    };

    //Fetches and populates the category dropdown for the trend chart.
    const populateCategoryDropdown = async () => {
        try {
            // We can re-use the categories endpoint from the main dashboard
            const res = await fetch('http://localhost:8080/api/transactions/categories', { credentials: 'include' });
            if (res.ok) {
                const categories = await res.json();
                // Filter for expense categories if needed, but for simplicity we'll show all
                elements.categoryTrendSelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                if (categories.length > 0) {
                    renderCategoryTrendChart(categories[0]); // Render chart for the first category by default
                } else {
                    elements.categoryTrendChartContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 pt-16">No categories to analyze.</p>';
                }
            }
        } catch (error) {
            console.error('Could not fetch categories for dropdown', error);
        }
    };
    
    // Renders a line chart showing the spending trend for a specific category.
    const renderCategoryTrendChart = async (categoryName) => {
        if (!categoryName) return;
        try {
            elements.categoryTrendChartContainer.innerHTML = '<canvas id="category-trend-chart"></canvas>';
            const response = await fetch(`http://localhost:8080/api/analytics/category-trend?categoryName=${encodeURIComponent(categoryName)}`, { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch category trend data');
            const data = await response.json();
            
            if (data.length === 0) {
                elements.categoryTrendChartContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 pt-16">No spending data for ${categoryName}.</p>`;
                return;
            }

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const labels = data.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`);
            const amounts = data.map(item => item.totalAmount);
            const colors = getChartColors();
            
            const ctx = document.getElementById('category-trend-chart').getContext('2d');
            if (categoryTrendChart) categoryTrendChart.destroy();
            
            categoryTrendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Spending in ${categoryName}`,
                        data: amounts,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, ticks: { color: colors.textColor }, grid: { color: colors.gridColor } },
                        x: { ticks: { color: colors.textColor }, grid: { color: colors.gridColor } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        } catch (error) {
            console.error(error);
            elements.categoryTrendChartContainer.innerHTML = '<p class="text-center text-red-500 pt-16">Could not load category trend chart.</p>';
        }
    };
    
    // check if user is loggedd in, else redirect to main page.
    (async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/me', { credentials: 'include' });
            if (response.ok) {
                // If logged in, render all our components.
                const user = await response.json();
                renderProfileButton(user);
                renderSummaryCards();
                renderCategoryChart();
                renderMonthlySummaryChart();
                populateCategoryDropdown();
            } else {
                window.location.href = '/frontend/';
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/frontend/';
        }
    })();

    // Dark mode theme switcher
    if (elements.themeMenuButton) {
        const applyTheme = (theme) => {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            // Re-render all charts with correct colors after theme change
            renderCategoryChart();
            renderMonthlySummaryChart();
            renderCategoryTrendChart(elements.categoryTrendSelect.value);
        };
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) applyTheme(savedTheme);
        else if (window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
        
        elements.themeMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const profileMenu = document.getElementById('profile-menu');
            if (profileMenu) profileMenu.classList.add('hidden');
            elements.themeMenu.classList.toggle('hidden');
        });

        elements.themeMenu.querySelectorAll('[data-theme]').forEach(option => {
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

    // This function closes any open dropdown menu when the user clicks elsewhere on the page.
    window.addEventListener('click', () => {
        const profileMenu = document.getElementById('profile-menu');
        if (elements.themeMenu && !elements.themeMenu.classList.contains('hidden')) {
            elements.themeMenu.classList.add('hidden');
        }
        if (profileMenu && !profileMenu.classList.contains('hidden')) {
            profileMenu.classList.add('hidden');
        }
    });

    // Event listener for the category trend dropdown
    elements.categoryTrendSelect.addEventListener('change', (e) => {
        renderCategoryTrendChart(e.target.value);
    });
});