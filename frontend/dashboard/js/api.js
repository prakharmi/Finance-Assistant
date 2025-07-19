// This module handles all communication with the backend API.
const BASE_URL = 'http://localhost:8080';

// Fetches the currently authenticated user's data.
export const fetchUserData = async () => {
    const response = await fetch(`${BASE_URL}/auth/me`, { credentials: 'include' });
    if (!response.ok) throw new Error('User not authenticated');
    return await response.json();
};

// Fetches transactions from the server based on current filters and pagination.(takes the current state of filters and pagination)
export const fetchTransactions = async (state) => {
    const { type, category, dateRange } = state.filters;
    const { currentPage, itemsPerPage } = state.pagination;
    const url = `${BASE_URL}/api/transactions?page=${currentPage}&limit=${itemsPerPage}&type=${type}&category=${category}&dateRange=${dateRange}`;
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
};

// Fetches the unique category names for the user.
export const fetchCategories = async () => {
    const response = await fetch(`${BASE_URL}/api/transactions/categories`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
};

// Submits a new transaction to the server.(takes transactiondata as parameter, returns transaction object)
export const addTransaction = async (transactionData) => {
    const response = await fetch(`${BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
        credentials: 'include'
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add transaction');
    }
    return await response.json();
};