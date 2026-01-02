// Shared JavaScript - Used by all pages
const API_URL = '/api';

// Utility functions
function h(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
    });
}

function showSuccess(msg) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = msg;
    div.style.position = 'fixed';
    div.style.top = '80px';
    div.style.right = '20px';
    div.style.zIndex = '1001';
    div.style.minWidth = '300px';
    
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showError(msg) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    div.style.position = 'fixed';
    div.style.top = '80px';
    div.style.right = '20px';
    div.style.zIndex = '1001';
    div.style.minWidth = '300px';
    
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Make functions global
window.h = h;
window.formatDate = formatDate;
window.showSuccess = showSuccess;
window.showError = showError;
window.API_URL = API_URL;
