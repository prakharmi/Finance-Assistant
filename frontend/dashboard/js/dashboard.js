// This is the main controller script for the dashboard.
// It manages the application state and connects UI events to API calls.
import * as api from './api.js';
import * as ui from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Current State Management
    const state = {
        filters: { type: 'all', category: 'all', dateRange: 'all' },
        pagination: { currentPage: 1, totalPages: 1, itemsPerPage: 10 }
    };

    // Element Selectors
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
        receiptUploadInput: document.getElementById('receipt-upload'),
        receiptModal: document.getElementById('receipt-confirmation-modal'),
        receiptForm: document.getElementById('receipt-confirmation-form'),
        cancelReceiptBtn: document.getElementById('cancel-receipt-import'),
        pdfUploadInput: document.getElementById('pdf-upload'),
        pdfModal: document.getElementById('pdf-confirmation-modal'),
        pdfForm: document.getElementById('pdf-confirmation-form'),
        pdfListDiv: document.getElementById('pdf-transactions-list'),
        cancelPdfBtn: document.getElementById('cancel-pdf-import'),
    };

    // Main function to fetch and render all dynamic content on the page.
    const loadPageContent = async () => {
        try {
            elements.transactionListDiv.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">Loading...</p>';
            const data = await api.fetchTransactions(state);
            ui.renderTransactionsList(elements.transactionListDiv, data.transactions);
            state.pagination.currentPage = data.currentPage;
            state.pagination.totalPages = data.totalPages;
            ui.updatePaginationUI(elements, state.pagination);
        } catch (error) {
            console.error('Error loading page content:', error);
            elements.transactionListDiv.innerHTML = '<p class="text-red-500 text-center py-4">Could not load transactions.</p>';
        }
    };

    // Populates the filter dropdowns with options.
    const populateFilters = async () => {
        elements.filterControls.innerHTML = '';
        const onFilterSelect = (filterName, value) => {
            state.filters[filterName] = value;
            state.pagination.currentPage = 1;
            loadPageContent();
        };

        const typeOptions = [{ value: 'all', label: 'All Types' }, { value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }];
        elements.filterControls.appendChild(ui.createDropdown('type', typeOptions, 'All Types', (value) => onFilterSelect('type', value)));

        const dateOptions = [{ value: 'all', label: 'All Time' }, { value: 'week', label: 'Past Week' }, { value: 'month', label: 'Past Month' }, { value: '3months', label: 'Past 3 Months' }];
        elements.filterControls.appendChild(ui.createDropdown('dateRange', dateOptions, 'All Time', (value) => onFilterSelect('dateRange', value)));

        try {
            const categories = await api.fetchCategories();
            const categoryOptions = [{ value: 'all', label: 'All Categories' }, ...categories.map(cat => ({ value: cat, label: cat }))];
            elements.filterControls.appendChild(ui.createDropdown('category', categoryOptions, 'All Categories', (value) => onFilterSelect('category', value)));
        } catch (error) {
            console.error('Could not load categories', error);
        }
    };

    // Modal Handling Functions
    const showReceiptConfirmationModal = (data) => {
        elements.receiptForm.querySelector('#receipt-description').value = data.description;
        elements.receiptForm.querySelector('#receipt-amount').value = data.amount;
        elements.receiptForm.querySelector('#receipt-date').value = data.date;
        elements.receiptForm.querySelector('#receipt-category').value = data.category;
        elements.receiptModal.classList.remove('hidden');
    };
    
    const hideReceiptConfirmationModal = () => {
        elements.receiptModal.classList.add('hidden');
        elements.receiptForm.reset();
    };
    
    const showPdfConfirmationModal = (transactions) => {
        elements.pdfListDiv.innerHTML = ''; // Clear previous entries
        transactions.forEach((t, index) => {
            const transactionRow = document.createElement('div');
            transactionRow.className = 'grid grid-cols-1 md:grid-cols-4 gap-3 items-center border-b dark:border-slate-700 pb-3';
            transactionRow.innerHTML = `
                <input type="date" value="${t.date}" data-index="${index}" data-field="date" class="pdf-input rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm text-sm">
                <input type="text" value="${t.description}" data-index="${index}" data-field="description" class="pdf-input md:col-span-2 rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm text-sm" placeholder="Description">
                <input type="number" value="${t.amount}" data-index="${index}" data-field="amount" class="pdf-input rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm text-sm" placeholder="Amount">
            `;
            elements.pdfListDiv.appendChild(transactionRow);
        });
        elements.pdfModal.classList.remove('hidden');
    };
    
    const hidePdfConfirmationModal = () => {
        elements.pdfModal.classList.add('hidden');
        elements.pdfListDiv.innerHTML = '';
    };

    // Sets up all the event listeners for the page.
    const setupEventListeners = () => {
        // Dark Mode Logic
        if (elements.themeMenuButton) {
            const applyTheme = (theme) => {
                document.documentElement.classList.toggle('dark', theme === 'dark');
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
        
        // Window click to close menus
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

        // Manual Transaction Form
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
                const transactionData = {
                    type: transactionType,
                    description: formData.get('description'),
                    amount: formData.get('amount'),
                    category: formData.get('category'),
                    date: formData.get('date')
                };

                try {
                    await api.addTransaction(transactionData);
                    elements.transactionForm.reset();
                    if (elements.dateInput) elements.dateInput.valueAsDate = new Date();
                    ui.showToast("Transaction added successfully!", "success");
                    state.pagination.currentPage = 1;
                    await loadPageContent();
                } catch (error) {
                    ui.showToast(error.message, "error");
                }
            });
        }
        
        // Receipt Upload Logic
        if (elements.receiptUploadInput) {
            elements.receiptUploadInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('receipt', file);
                
                alert('Processing receipt... Please wait.');

                try {
                    const response = await fetch('http://localhost:8080/api/transactions/upload-receipt', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    });
                    
                    event.target.value = '';

                    if (response.ok) {
                        const extractedData = await response.json();
                        showReceiptConfirmationModal(extractedData);
                    } else {
                        const error = await response.json();
                        ui.showToast(error.message, "error");
                    }
                } catch (error) {
                    ui.showToast("Error processing receipt.", "error");
                    console.error('Error uploading receipt:', error);
                }
            });
        }
        
        // Receipt Modal Form Submission
        if (elements.receiptForm) {
            elements.receiptForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const transactionData = {
                    type: 'expense',
                    description: elements.receiptForm.querySelector('#receipt-description').value,
                    amount: elements.receiptForm.querySelector('#receipt-amount').value,
                    date: elements.receiptForm.querySelector('#receipt-date').value,
                    category: elements.receiptForm.querySelector('#receipt-category').value
                };

                try {
                    await api.addTransaction(transactionData);
                    hideReceiptConfirmationModal();
                    await loadPageContent();
                    ui.showToast("Receipt transaction added!", "success");
                } catch (error) {
                    ui.showToast(error.message, "error");
                }
            });
        }

        if (elements.cancelReceiptBtn) {
            elements.cancelReceiptBtn.addEventListener('click', hideReceiptConfirmationModal);
        }

        // PDF Upload Logic
        if (elements.pdfUploadInput) {
            elements.pdfUploadInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append('pdf', file);
                alert('Processing PDF... Please wait.');

                try {
                    const response = await fetch('http://localhost:8080/api/transactions/import-pdf', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    });
                    event.target.value = '';

                    if (response.ok) {
                        const transactions = await response.json();
                        showPdfConfirmationModal(transactions);
                    } else {
                        const error = await response.json();
                        ui.showToast(error.message, "error");
                    }
                } catch (error) {
                    ui.showToast("Error processing PDF.", "error");
                    console.error('Error processing PDF:', error);
                }
            });
        }
        
        // PDF Modal Form Submission
        if (elements.pdfForm) {
            elements.pdfForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const transactionRows = elements.pdfListDiv.querySelectorAll('.grid');
                const transactionsToSave = [];
                transactionRows.forEach(row => {
                    transactionsToSave.push({
                        date: row.querySelector('[data-field="date"]').value,
                        description: row.querySelector('[data-field="description"]').value,
                        amount: parseFloat(row.querySelector('[data-field="amount"]').value),
                        type: 'expense', // Defaulting to expense
                        category: 'Other' // Defaulting to Other
                    });
                });
                
                try {
                    const response = await fetch('http://localhost:8080/api/transactions/add-multiple', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transactions: transactionsToSave }),
                        credentials: 'include'
                    });

                    if (response.ok) {
                        hidePdfConfirmationModal();
                        await loadPageContent();
                        ui.showToast(`${transactionsToSave.length} transactions added!`, "success");
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message);
                    }
                } catch (error) {
                    ui.showToast(error.message, "error");
                }
            });
        }

        if (elements.cancelPdfBtn) {
            elements.cancelPdfBtn.addEventListener('click', hidePdfConfirmationModal);
        }

        // Pagination
        if (elements.limitSelect) {
            elements.limitSelect.addEventListener('change', () => {
                state.pagination.itemsPerPage = parseInt(elements.limitSelect.value, 10);
                state.pagination.currentPage = 1;
                loadPageContent();
            });
        }
        if (elements.prevPageBtn) {
            elements.prevPageBtn.addEventListener('click', () => {
                if (state.pagination.currentPage > 1) {
                    state.pagination.currentPage--;
                    loadPageContent();
                }
            });
        }
        if (elements.nextPageBtn) {
            elements.nextPageBtn.addEventListener('click', () => {
                if (state.pagination.currentPage < state.pagination.totalPages) {
                    state.pagination.currentPage++;
                    loadPageContent();
                }
            });
        }

        // For deleting transactions
        // We use event delegation on the container for efficiency.
        if (elements.transactionListDiv) {
            elements.transactionListDiv.addEventListener('click', async (e) => {
                // Find the closest delete button to the click target
                const deleteButton = e.target.closest('.delete-btn');
                
                if (deleteButton) {
                    const transactionId = deleteButton.dataset.id;
                    
                    // Ask for user confirmation before deleting
                    if (confirm('Are you sure you want to delete this transaction?')) {
                        try {
                            await api.deleteTransaction(transactionId);
                            ui.showToast('Transaction deleted!', 'success');
                            // Refresh the list to show the item has been removed
                            await loadPageContent();
                        } catch (error) {
                            ui.showToast(error.message, 'error');
                        }
                    }
                }
            });
        }
    };

    // Initializes the entire page.
    const init = async () => {
        try {
            const user = await api.fetchUserData();
            elements.welcomeMessage.textContent = `Welcome back, ${user.displayName.split(' ')[0]}!`;
            ui.renderProfileButton(elements.profileButtonContainer, user);
            
            setupEventListeners();
            await populateFilters();
            await loadPageContent();

        } catch (error) {
            // If any part of initialization fails, redirect to login.
            window.location.href = '/frontend/';
        }
    };
    
    init(); // Start application
});