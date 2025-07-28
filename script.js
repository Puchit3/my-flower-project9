// Global variable to store financial data for chaining calculations (e.g., ratios needing income statement data)
window.financialData = window.financialData || {};

// --- Helper Functions ---

// Get value from input and convert to number, handling empty/invalid inputs
function getInputValue(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with ID ${id} not found.`);
        return NaN;
    }
    const value = parseFloat(element.value);
    return isNaN(value) ? 0 : value; // Default to 0 if input is empty or invalid
}

// Format numbers to Thai currency format
function formatCurrency(amount) {
    if (isNaN(amount) || !isFinite(amount)) {
        return '-'; // Or 'N/A'
    }
    // Using en-US for currency symbol display to fit common financial report styling, but can be th-TH if preferred
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format percentage
function formatPercentage(value) {
    if (isNaN(value) || !isFinite(value)) {
        return '-';
    }
    return `${value.toFixed(2)}%`;
}

// Show/hide loading indicator
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (show) {
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.classList.add('animate-fade-in');
    } else {
        loadingIndicator.classList.add('hidden');
        loadingIndicator.classList.remove('animate-fade-in');
    }
}

// Custom alert function (replaces window.alert)
let alertTimeout;
function showAlert(message) {
    clearTimeout(alertTimeout); // Clear any previous timeout
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');

    alertMessage.textContent = message;
    customAlert.classList.remove('hidden', 'animate-fade-out'); // Ensure it's visible and not fading out
    customAlert.classList.add('animate-slide-in-bottom');

    alertTimeout = setTimeout(() => {
        hideAlert();
    }, 5000); // Alert disappears after 5 seconds
}

function hideAlert() {
    const customAlert = document.getElementById('customAlert');
    customAlert.classList.remove('animate-slide-in-bottom');
    customAlert.classList.add('animate-fade-out'); // Add fade-out animation
    setTimeout(() => {
        customAlert.classList.add('hidden');
        customAlert.classList.remove('animate-fade-out'); // Remove fade-out after it's hidden
    }, 500); // Hide after animation duration
}


// --- 1. Income Statement Calculation ---
function calculateIncomeStatement() {
    showLoading(true);
    // Simulate API call delay
    setTimeout(() => {
        const totalRevenue = getInputValue('totalRevenue');
        const cogs = getInputValue('cogs');
        const operatingExpenses = getInputValue('operatingExpenses');
        const interestExpense = getInputValue('interestExpense');
        const taxExpense = getInputValue('taxExpense');

        if (totalRevenue < cogs && totalRevenue !== 0) {
            showAlert("Error: Cost of Goods Sold cannot exceed Total Revenue.");
            showLoading(false);
            return;
        }
        if (totalRevenue < 0 || cogs < 0 || operatingExpenses < 0 || interestExpense < 0 || taxExpense < 0) {
            showAlert("Error: Please enter non-negative values for all inputs.");
            showLoading(false);
            return;
        }

        const grossProfit = totalRevenue - cogs;
        const ebit = grossProfit - operatingExpenses;
        const netProfit = ebit - interestExpense - taxExpense;

        document.getElementById('grossProfit').textContent = formatCurrency(grossProfit);
        document.getElementById('ebit').textContent = formatCurrency(ebit);
        document.getElementById('netProfit').textContent = formatCurrency(netProfit);

        const resultBox = document.getElementById('incomeStatementResult');
        resultBox.classList.remove('hidden');
        // Trigger animations for individual result items
        resultBox.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('animate-fade-in-up-result', 'delay-100', 'delay-200'); // Remove old animations
            void item.offsetWidth; // Trigger reflow to restart animation
            item.classList.add('animate-fade-in-up-result');
        });


        // Store for other calculations (ratios)
        window.financialData.totalRevenue = totalRevenue;
        window.financialData.cogs = cogs;
        window.financialData.grossProfit = grossProfit;
        window.financialData.ebit = ebit;
        window.financialData.netProfit = netProfit;
        window.financialData.interestExpense = interestExpense;
        showLoading(false);
    }, 800); // Simulate network delay
}

// --- 2. Balance Sheet Calculation ---
function calculateBalanceSheet() {
    showLoading(true);
    setTimeout(() => {
        const totalAssets = getInputValue('totalAssets');
        const totalLiabilities = getInputValue('totalLiabilities');

        if (totalAssets < 0 || totalLiabilities < 0) {
            showAlert("Error: Please enter non-negative values for all inputs.");
            showLoading(false);
            return;
        }
        if (totalAssets < totalLiabilities && totalAssets !== 0) {
            showAlert("Error: Total Liabilities cannot exceed Total Assets.");
            showLoading(false);
            return;
        }

        const equity = totalAssets - totalLiabilities;

        document.getElementById('equity').textContent = formatCurrency(equity);
        const resultBox = document.getElementById('balanceSheetResult');
        resultBox.classList.remove('hidden');
        resultBox.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('animate-fade-in-up-result');
            void item.offsetWidth;
            item.classList.add('animate-fade-in-up-result');
        });

        // Store for other calculations (ratios)
        window.financialData.totalAssets = totalAssets;
        window.financialData.totalLiabilities = totalLiabilities;
        window.financialData.equity = equity;
        showLoading(false);
    }, 800);
}

// --- 3. Financial Ratios Calculation ---
function calculateFinancialRatios() {
    showLoading(true);
    setTimeout(() => {
        const data = window.financialData || {};

        const totalRevenue = getInputValue('totalRevenue') || data.totalRevenue;
        const cogs = getInputValue('cogs') || data.cogs;
        const grossProfit = data.grossProfit;
        const ebit = data.ebit;
        const netProfit = data.netProfit;
        const totalAssets = getInputValue('totalAssets') || data.totalAssets;
        const totalLiabilities = getInputValue('totalLiabilities') || data.totalLiabilities;
        const equity = data.equity;
        const interestExpense = getInputValue('interestExpense') || data.interestExpense;

        const currentAssets = getInputValue('currentAssets');
        const currentLiabilities = getInputValue('currentLiabilities');
        const inventory = getInputValue('inventory');
        const accountsReceivable = getInputValue('accountsReceivable');

        // Client-side validation for essential data
        if ([totalRevenue, cogs, grossProfit, ebit, netProfit, totalAssets, totalLiabilities, equity, currentAssets, currentLiabilities, inventory, accountsReceivable, interestExpense].some(val => val === undefined || isNaN(val))) {
            showAlert("Error: Please calculate basic financial statements and/or fill in all required ratio inputs.");
            showLoading(false);
            return;
        }
        if (currentAssets < 0 || currentLiabilities < 0 || inventory < 0 || accountsReceivable < 0) {
            showAlert("Error: Please enter non-negative values for all ratio inputs.");
            showLoading(false);
            return;
        }

        // --- Profitability Ratios ---
        const grossProfitMargin = totalRevenue !== 0 ? (grossProfit / totalRevenue) * 100 : NaN;
        const operatingMargin = totalRevenue !== 0 ? (ebit / totalRevenue) * 100 : NaN;
        const netProfitMargin = totalRevenue !== 0 ? (netProfit / totalRevenue) * 100 : NaN;
        const roa = totalAssets !== 0 ? (netProfit / totalAssets) * 100 : NaN;
        const roe = equity !== 0 ? (netProfit / equity) * 100 : NaN;

        document.getElementById('grossProfitMargin').textContent = formatPercentage(grossProfitMargin);
        document.getElementById('operatingMargin').textContent = formatPercentage(operatingMargin);
        document.getElementById('netProfitMargin').textContent = formatPercentage(netProfitMargin);
        document.getElementById('roa').textContent = formatPercentage(roa);
        document.getElementById('roe').textContent = formatPercentage(roe);

        // --- Liquidity Ratios ---
        const currentRatio = currentLiabilities !== 0 ? currentAssets / currentLiabilities : NaN;
        const quickRatio = currentLiabilities !== 0 ? (currentAssets - inventory) / currentLiabilities : NaN;

        document.getElementById('currentRatio').textContent = isNaN(currentRatio) ? '-' : currentRatio.toFixed(2);
        document.getElementById('quickRatio').textContent = isNaN(quickRatio) ? '-' : quickRatio.toFixed(2);

        // --- Efficiency Ratios ---
        const inventoryTurnover = inventory !== 0 ? cogs / inventory : NaN;
        const accountsReceivableTurnover = accountsReceivable !== 0 ? totalRevenue / accountsReceivable : NaN;
        const assetTurnover = totalAssets !== 0 ? totalRevenue / totalAssets : NaN;

        document.getElementById('inventoryTurnover').textContent = isNaN(inventoryTurnover) ? '-' : inventoryTurnover.toFixed(2);
        document.getElementById('accountsReceivableTurnover').textContent = isNaN(accountsReceivableTurnover) ? '-' : accountsReceivableTurnover.toFixed(2);
        document.getElementById('assetTurnover').textContent = isNaN(assetTurnover) ? '-' : assetTurnover.toFixed(2);

        // --- Leverage Ratios ---
        const debtToEquityRatio = equity !== 0 ? totalLiabilities / equity : NaN;
        const debtRatio = totalAssets !== 0 ? totalLiabilities / totalAssets : NaN;
        const interestCoverageRatio = interestExpense !== 0 ? ebit / interestExpense : NaN;

        document.getElementById('debtToEquityRatio').textContent = isNaN(debtToEquityRatio) ? '-' : debtToEquityRatio.toFixed(2);
        document.getElementById('debtRatio').textContent = isNaN(debtRatio) ? '-' : debtRatio.toFixed(2);
        document.getElementById('interestCoverageRatio').textContent = isNaN(interestCoverageRatio) ? '-' : interestCoverageRatio.toFixed(2);

        const resultBox = document.getElementById('financialRatiosResult');
        resultBox.classList.remove('hidden');
        // Trigger animations for individual result items with staggered delays
        resultBox.querySelectorAll('.result-item').forEach((item, index) => {
            item.classList.remove('animate-fade-in-up-result', `delay-${index * 100}`); // Remove old animations and delays
            void item.offsetWidth; // Trigger reflow to restart animation
            item.classList.add('animate-fade-in-up-result', `delay-${index * 100}`);
        });

        showLoading(false);
    }, 800);
}

// --- 4. Break-Even Point Calculation ---
function calculateBreakEvenPoint() {
    showLoading(true);
    setTimeout(() => {
        const fixedCost = getInputValue('fixedCost');
        const sellingPricePerUnit = getInputValue('sellingPricePerUnit');
        const variableCostPerUnit = getInputValue('variableCostPerUnit');

        if (fixedCost < 0 || sellingPricePerUnit < 0 || variableCostPerUnit < 0) {
            showAlert("Error: Please enter non-negative values for all inputs.");
            showLoading(false);
            return;
        }
        if (sellingPricePerUnit <= variableCostPerUnit) {
            showAlert("Error: Selling price per unit must be greater than variable cost per unit.");
            showLoading(false);
            return;
        }

        const contributionMarginPerUnit = sellingPricePerUnit - variableCostPerUnit;
        const breakEvenUnits = fixedCost / contributionMarginPerUnit;
        const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit;

        document.getElementById('breakEvenUnits').textContent = isNaN(breakEvenUnits) ? '-' : breakEvenUnits.toFixed(2) + ' Units';
        document.getElementById('breakEvenRevenue').textContent = formatCurrency(breakEvenRevenue);
        const resultBox = document.getElementById('breakEvenPointResult');
        resultBox.classList.remove('hidden');
        resultBox.querySelectorAll('.result-item').forEach((item, index) => {
            item.classList.remove('animate-fade-in-up-result', `delay-${index * 100}`);
            void item.offsetWidth;
            item.classList.add('animate-fade-in-up-result', `delay-${index * 100}`);
        });
        showLoading(false);
    }, 800);
}

// --- 5. Compound Interest Calculator ---
function calculateCompoundInterest() {
    showLoading(true);
    setTimeout(() => {
        const principal = getInputValue('principal');
        const annualRate = getInputValue('annualRate') / 100; // Convert percentage to decimal
        const years = getInputValue('years');
        const compoundingFrequency = parseInt(document.getElementById('compoundingFrequency').value);
        const monthlyContribution = getInputValue('monthlyContribution');

        if (principal < 0 || annualRate < 0 || years < 0 || compoundingFrequency <= 0 || monthlyContribution < 0) {
            showAlert("Error: Please enter non-negative values for all inputs.");
            showLoading(false);
            return;
        }
        if (years === 0 && (principal > 0 || monthlyContribution > 0)) {
            const totalInvestedAtZeroYears = principal + (monthlyContribution * 12);
            document.getElementById('futureValue').textContent = formatCurrency(totalInvestedAtZeroYears);
            document.getElementById('totalInterestEarned').textContent = formatCurrency(0);
            document.getElementById('totalInvested').textContent = formatCurrency(totalInvestedAtZeroYears);
            const resultBox = document.getElementById('compoundInterestResult');
            resultBox.classList.remove('hidden');
            resultBox.querySelectorAll('.result-item').forEach((item, index) => {
                item.classList.remove('animate-fade-in-up-result', `delay-${index * 100}`);
                void item.offsetWidth;
                item.classList.add('animate-fade-in-up-result', `delay-${index * 100}`);
            });
            showLoading(false);
            return;
        }

        // Future Value of Principal: FV = P * (1 + r/n)^(nt)
        let futureValuePrincipal = principal * Math.pow((1 + annualRate / compoundingFrequency), (compoundingFrequency * years));

        // Future Value of Series of Payments (Monthly Contributions - treated as annuity)
        let futureValueContributions = 0;
        if (monthlyContribution > 0) {
            const numberOfMonthlyPayments = years * 12;
            const monthlyRate = annualRate / 12; // Monthly rate for monthly contributions

            if (monthlyRate === 0) {
                futureValueContributions = monthlyContribution * numberOfMonthlyPayments;
            } else {
                futureValueContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, numberOfMonthlyPayments) - 1) / monthlyRate);
            }
        }

        const totalFutureValue = futureValuePrincipal + futureValueContributions;
        const totalInvested = principal + (monthlyContribution * years * 12);
        const totalInterestEarned = totalFutureValue - totalInvested;

        document.getElementById('futureValue').textContent = formatCurrency(totalFutureValue);
        document.getElementById('totalInterestEarned').textContent = formatCurrency(totalInterestEarned);
        document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
        const resultBox = document.getElementById('compoundInterestResult');
        resultBox.classList.remove('hidden');
        resultBox.querySelectorAll('.result-item').forEach((item, index) => {
            item.classList.remove('animate-fade-in-up-result', `delay-${index * 100}`);
            void item.offsetWidth;
            item.classList.add('animate-fade-in-up-result', `delay-${index * 100}`);
        });
        showLoading(false);
    }, 800);
}

// Intersection Observer for slide-in animations on cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card-premium');
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of element visible to trigger
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ensure animation restarts if element comes into view again (e.g., after scrolling past and back)
                entry.target.style.animation = 'none'; // Clear existing animation
                void entry.target.offsetWidth; // Trigger reflow to restart animation
                if (entry.target.classList.contains('animate-slide-in-left')) {
                    entry.target.style.animation = 'slideInLeft 1s ease-out forwards';
                } else if (entry.target.classList.contains('animate-slide-in-right')) {
                    entry.target.style.animation = 'slideInRight 1s ease-out forwards';
                }
                // Only unobserve if animation should run once
                // observer.unobserve(entry.target);
            } else {
                // Optional: reset opacity/transform if they scroll out of view and you want them to re-animate later
                 entry.target.style.opacity = '0';
                 if (entry.target.classList.contains('animate-slide-in-left')) {
                     entry.target.style.transform = 'translateX(-80px)';
                 } else if (entry.target.classList.contains('animate-slide-in-right')) {
                     entry.target.style.transform = 'translateX(80px)';
                 }
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        // Set initial hidden state for animation
        card.style.opacity = '0';
        if (card.classList.contains('animate-slide-in-left')) {
            card.style.transform = 'translateX(-80px)';
        } else if (card.classList.contains('animate-slide-in-right')) {
            card.style.transform = 'translateX(80px)';
        }
        observer.observe(card);
    });

    // --- Top Animated Bar Visibility Logic ---
    const topAnimatedBar = document.getElementById('topAnimatedBar');
    let idleTimeout;
    const idleDelay = 4000; // 4 seconds of inactivity

    function showTopBar() {
        clearTimeout(idleTimeout);
        if (topAnimatedBar.classList.contains('is-hidden')) {
            topAnimatedBar.classList.remove('is-hidden');
        }
        startIdleTimer();
    }

    function hideTopBar() {
        if (!topAnimatedBar.classList.contains('is-hidden')) {
            topAnimatedBar.classList.add('is-hidden');
        }
    }

    function startIdleTimer() {
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(hideTopBar, idleDelay);
    }

    // Initial state: visible, then start timer
    showTopBar();

    // Event listeners for user activity
    document.addEventListener('mousemove', showTopBar);
    document.addEventListener('mousedown', showTopBar);
    document.addEventListener('touchstart', showTopBar);
    document.addEventListener('scroll', showTopBar);
});
