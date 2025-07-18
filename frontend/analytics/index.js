document.addEventListener('DOMContentLoaded', () => {
    // These variables will hold our chart instances.
    let categoryChart = null;
    let monthlySummaryChart = null;

    // This object holds all the DOM elements we'll be working with.
    const elements = {
        summaryCards: document.getElementById('summary-cards'),
        categoryChartContainer: document.getElementById('category-chart-container'),
        monthlySummaryChartContainer: document.getElementById('monthly-summary-chart-container'),
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
                    datasets: [{ data: amounts, backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'], borderColor: colors.borderColor, borderWidth: 4 }]
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
                if (!monthlyMap[monthKey]) {
                    monthlyMap[monthKey] = { income: 0, expense: 0, label: `${monthNames[item._id.month - 1]} ${item._id.year}` };
                }
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
                    responsive: true,
                    maintainAspectRatio: false,
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

    // check if a user is logged in, else redirect to mainpage.
    (async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/me', { credentials: 'include' });
            if (!response.ok) {
                window.location.href = '/frontend/';
                return;
            }
            // If logged in, render all our components.
            renderSummaryCards();
            renderCategoryChart();
            renderMonthlySummaryChart();
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/frontend/';
        }
    })();
});