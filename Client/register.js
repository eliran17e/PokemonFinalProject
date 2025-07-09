// Registration form handling
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Add real-time validation
    nameInput.addEventListener('blur', validateName);
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('blur', validateEmail);
    emailInput.addEventListener('input', clearFieldError.bind(null, 'email'));
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    
    // Handle form submission
    registerForm.addEventListener('submit', handleRegistration);
});

// Handle registration form submission
async function handleRegistration(e) {
    e.preventDefault();
    
    const registerBtn = document.getElementById('registerBtn');
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
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                window.location.href = result.redirect || '/login';
            }, 2000);
        } else {
            showError(result.error || 'Registration failed');
            
            // Show specific field errors if provided
            if (result.fieldErrors) {
                showFieldErrors(result.fieldErrors);
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Registration failed. Please check your connection and try again.');
    } finally {
        setLoadingState(false);
    }
}

// Client-side form validation
function validateForm(data) {
    let isValid = true;
    
    // Validate all fields
    if (!validateName()) isValid = false;
    if (!validateEmail()) isValid = false;
    if (!validatePassword()) isValid = false;
    if (!validateConfirmPassword()) isValid = false;
    
    return isValid;
}

// Validate name (max 50 chars, letters only)
function validateName() {
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    const nameRegex = /^[A-Za-z\s]+$/;
    
    if (!name) {
        showFieldError('name', 'Name is required');
        return false;
    }
    
    if (name.length > 50) {
        showFieldError('name', 'Name must be 50 characters or less');
        return false;
    }
    
    if (!nameRegex.test(name)) {
        showFieldError('name', 'Name can only contain letters and spaces');
        return false;
    }
    
    clearFieldError('name');
    return true;
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

// Validate password (7-15 chars, 1 uppercase, 1 lowercase, 1 special char)
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    if (!password) {
        showFieldError('password', 'Password is required');
        updatePasswordStrength('');
        return false;
    }
    
    const errors = [];
    
    if (password.length < 7) {
        errors.push('at least 7 characters');
    }
    
    if (password.length > 15) {
        errors.push('maximum 15 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('one lowercase letter');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('one special character');
    }
    
    updatePasswordStrength(password);
    
    if (errors.length > 0) {
        showFieldError('password', `Password must contain: ${errors.join(', ')}`);
        return false;
    }
    
    clearFieldError('password');
    return true;
}

// Validate confirm password
function validateConfirmPassword() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Please confirm your password');
        return false;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        return false;
    }
    
    clearFieldError('confirmPassword');
    return true;
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';
        strengthText.textContent = 'Password strength';
        return;
    }
    
    let score = 0;
    
    // Length check
    if (password.length >= 7) score++;
    if (password.length >= 10) score++;
    
    // Character type checks
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    let strength = '';
    if (score <= 2) {
        strength = 'weak';
        strengthText.textContent = 'Weak password';
    } else if (score <= 3) {
        strength = 'fair';
        strengthText.textContent = 'Fair password';
    } else if (score <= 4) {
        strength = 'good';
        strengthText.textContent = 'Good password';
    } else {
        strength = 'strong';
        strengthText.textContent = 'Strong password';
    }
    
    strengthFill.className = `strength-fill ${strength}`;
    strengthText.className = `strength-text ${strength}`;
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
        if (inputElement.value.trim()) {
            inputElement.classList.add('success');
        }
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
    const registerBtn = document.getElementById('registerBtn');
    const loading = document.getElementById('loading');
    
    if (isLoading) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'Creating Account...';
        loading.classList.add('show');
    } else {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Register';
        loading.classList.remove('show');
    }
}