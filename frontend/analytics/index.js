document.addEventListener('DOMContentLoaded', () => {
    // This object holds all the DOM elements we'll be working with.
    const elements = {
        summaryCards: document.getElementById('summary-cards'),
    };

    // Helper Functions
    // Formats a number into a string. amount - The number to format.
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // UI Rendering
    //Fetches the financial summary data from the API and renders the summary cards.
    const renderSummaryCards = async () => {
        try {
            // Display a loading message while we fetch data.
            elements.summaryCards.innerHTML = `<p class="text-gray-500 dark:text-gray-400 md:col-span-3">Loading summary...</p>`;
            
            const response = await fetch('http://localhost:8080/api/analytics/summary', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch summary');
            const summary = await response.json();

            // Populate the container with the fetched data.
            elements.summaryCards.innerHTML = `
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Income</h3>
                    <p class="text-3xl font-bold text-green-500 mt-1">${formatCurrency(summary.totalIncome)}</p>
                </div>
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expenses</h3>
                    <p class="text-3xl font-bold text-red-500 mt-1">${formatCurrency(summary.totalExpense)}</p>
                </div>
                <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Net Savings</h3>
                    <p class="text-3xl font-bold ${summary.netSavings >= 0 ? 'text-blue-500' : 'text-yellow-500'} mt-1">${formatCurrency(summary.netSavings)}</p>
                </div>
            `;
        } catch (error) {
            console.error(error);
            elements.summaryCards.innerHTML = `<p class="text-red-500 md:col-span-3">Could not load summary data.</p>`;
        }
    };

    //Check if the user is logged in, else redirect to main page
    (async () => {
        try {
            const response = await fetch('http://localhost:8080/auth/me', { credentials: 'include' });
            if (!response.ok) {
                window.location.href = '/frontend/';
                return; // Stop execution if not logged in
            }
            // Render the summary cards.
            renderSummaryCards();
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/frontend/';
        }
    })();
});