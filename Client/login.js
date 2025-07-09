// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Add real-time validation
    emailInput.addEventListener('blur', validateEmail);
    emailInput.addEventListener('input', clearErrors);
    passwordInput.addEventListener('input', clearErrors);
    
    // Handle form submission
    loginForm.addEventListener('submit', handleLogin);
});

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    const loading = document.getElementById('loading');
    const message = document.getElementById('message');
    
    // Clear previous messages
    clearAllErrors();
    message.innerHTML = '';
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Client-side validation
    if (!validateForm(data)) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = result.redirect || '/search';
            }, 1500);
        } else {
            showError(result.error || 'Login failed');
            
            // Show specific field errors if provided
            if (result.fieldErrors) {
                showFieldErrors(result.fieldErrors);
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please check your connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

// Client-side form validation
function validateForm(data) {
    let isValid = true;
    
    // Validate email
    if (!data.email || !validateEmail()) {
        isValid = false;
    }
    
    // Validate password
    if (!data.password || data.password.length < 1) {
        showFieldError('password', 'Password is required');
        isValid = false;
    }
    
    return isValid;
}

// Validate email format
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showFieldError('email', 'Email is required');
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showFieldError('email', 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError('email');
    return true;
}

// Show field-specific error
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    
    if (inputElement) {
        inputElement.classList.add('error');
        inputElement.classList.remove('success');
    }
}

// Clear field-specific error
function clearFieldError(fieldName) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    if (inputElement) {
        inputElement.classList.remove('error');
        inputElement.classList.add('success');
    }
}

// Clear all errors
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        if (element.tagName === 'DIV') {
            element.textContent = '';
        } else {
            element.classList.remove('error');
        }
    });
}

// Clear errors on input
function clearErrors() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// Show field errors from server response
function showFieldErrors(fieldErrors) {
    Object.keys(fieldErrors).forEach(fieldName => {
        showFieldError(fieldName, fieldErrors[fieldName]);
    });
}

// Show general success message
function showSuccess(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="success">${message}</div>`;
}

// Show general error message
function showError(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="error">${message}</div>`;
}

// Set loading state
function setLoadingState(isLoading) {
    const loginBtn = document.getElementById('loginBtn');
    const loading = document.getElementById('loading');
    
    if (isLoading) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        loading.classList.add('show');
    } else {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
        loading.classList.remove('show');
    }
}