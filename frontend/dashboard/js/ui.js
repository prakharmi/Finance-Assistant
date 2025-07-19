// This module contains all functions that directly manipulate the DOM.

// Renders the list of transactions.(takes the div where transactions have to be shown, returns transactions array)
export const renderTransactionsList = (container, transactions) => {
    container.innerHTML = '';
    if (transactions.length === 0) {
        container.innerHTML = '<p class="text-gray-600 dark:text-gray-400 text-center py-8">No transactions found for the selected filters.</p>';
        return;
    }
    const listContainer = document.createElement('div');
    listContainer.className = 'space-y-3';
    transactions.forEach(t => {
        const date = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const isExpense = t.type === 'expense';
        const amountColor = isExpense ? 'text-red-500' : 'text-green-500';
        const sign = isExpense ? '-' : '+';
        const el = document.createElement('div');
        el.className = 'bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center justify-between transition-transform transform hover:scale-[1.02]';
        el.innerHTML = `
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
        listContainer.appendChild(el);
    });
    container.appendChild(listContainer);
};

// Updates the pagination controls UI.
export const updatePaginationUI = (elements, paginationState) => {
    const { currentPage, totalPages } = paginationState;
    if (totalPages > 0) {
        elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        elements.prevPageBtn.disabled = currentPage <= 1;
        elements.nextPageBtn.disabled = currentPage >= totalPages;
        elements.paginationControls.classList.remove('hidden');
    } else {
        elements.paginationControls.classList.add('hidden');
    }
};

// Creates a custom dropdown button for filters.(from the parameters given to it)
export const createDropdown = (name, options, defaultLabel, onSelect) => {
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'relative inline-block text-left';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'inline-flex items-center justify-center w-full rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none';
    button.innerHTML = `<span id="${name}-label">${defaultLabel}</span><svg class="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>`;
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
            menu.classList.add('hidden');
            onSelect(option.value); // Fire the callback
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

// Renders the user's profile button in the header.
export const renderProfileButton = (container, user) => {
    const userPicture = user.photos?.[0]?.value || `https://ui-avatars.com/api/?name=${user.displayName.replace(' ', '+')}&background=random&color=fff`;
    container.innerHTML = `
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
            if (document.getElementById('theme-menu')) document.getElementById('theme-menu').classList.add('hidden');
            profileMenu.classList.toggle('hidden');
        });
    }
};