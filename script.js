/**
 * ==================================================================
 * BRAND AUTHENTICATION ENGINE
 * ==================================================================
 * This script orchestrates state management, dynamic wizard navigation,
 * custom-built SaaS onboarding behavior, real-time validation,
 * and seamless theme switching.
 */

// Global Application State Store
const state = {
  email: '',
  signupEmail: '',
  signupName: '',
  signupPassword: '',
  workspaceUsage: '',
  workspaceName: '',
  workspaceRole: ''
};

// Ensure all event hooks and state initiators bind after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initValidationTriggers();
  initFormInteractions();
});

/**
 * ==================================================================
 * 1. THEME SWAP ENGINE (Light / Dark Mode Transition)
 * ==================================================================
 */
function initThemeEngine() {
  const themeBtn = document.getElementById('theme-toggle');
  const body = document.body;

  if (!themeBtn) return;

  // Sync initial button icon based on active body theme state
  const syncIcon = (theme) => {
    const icon = themeBtn.querySelector('i');
    if (!icon) return;
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  };

  // Click event with micro-rotation triggers
  themeBtn.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', nextTheme);
    syncIcon(nextTheme);
  });

  // Run a swift check on startup to match the DOM's default state
  syncIcon(body.getAttribute('data-theme'));
}

/**
 * ==================================================================
 * 2. WIZARD INTERFACES & TRANSITIONS
 * ==================================================================
 * Smoothly manages navigation between different authentication phases.
 */
function goToStep(stepId) {
  const currentActive = document.querySelector('.form-step.active');
  const targetStep = document.getElementById(stepId);

  if (!targetStep) return;

  if (currentActive) {
    // Fade-out active panel downwards
    currentActive.style.opacity = '0';
    currentActive.style.transform = 'translateY(-12px)';
    
    setTimeout(() => {
      currentActive.classList.remove('active');
      currentActive.style.transform = ''; // Clear inline transitions
      
      // Inject target step
      targetStep.classList.add('active');
      
      // Request micro-animation frame to register transform smoothly
      requestAnimationFrame(() => {
        setTimeout(() => {
          targetStep.style.opacity = '1';
          targetStep.style.transform = 'translateY(0)';
        }, 30);
      });
    }, 300); // Matches the CSS cubic-bezier transition time
  } else {
    targetStep.classList.add('active');
    targetStep.style.opacity = '1';
    targetStep.style.transform = 'translateY(0)';
  }
}

/**
 * Global router to switch contexts cleanly.
 * Resets inline error states before shifting panels.
 */
function switchFlow(flowName) {
  clearAllErrors();
  
  if (flowName === 'signin') {
    goToStep('signin-step-1');
  } else if (flowName === 'signup') {
    goToStep('signup-step-1');
  } else if (flowName === 'forgot') {
    goToStep('forgot-step-1');
  }
}

/**
 * Password Visibility Toggle
 * Exclusively manipulates text vs password type with corresponding icon swaps.
 */
function togglePasswordVisibility(inputId, buttonElement) {
  const input = document.getElementById(inputId);
  const icon = buttonElement.querySelector('i');
  
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

/**
 * ==================================================================
 * 3. VALIDATION FRAMEWORK (Matte Feedback Loop)
 * ==================================================================
 */
function showError(inputId, message) {
  const errorDiv = document.getElementById(`${inputId}-error`);
  const input = document.getElementById(inputId);
  
  if (errorDiv && input) {
    errorDiv.innerText = message;
    errorDiv.classList.add('show');
    input.style.borderColor = 'var(--error-color)';
    
    // Add lightweight shadow glow matching design token mode configurations
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      input.style.boxShadow = '0 0 0 2px var(--error-bg)';
    } else {
      input.style.boxShadow = '0 0 0 2px #fecaca';
    }
  }
}

function clearError(inputId) {
  const errorDiv = document.getElementById(`${inputId}-error`);
  const input = document.getElementById(inputId);
  
  if (errorDiv && input && errorDiv.classList.contains('show')) {
    errorDiv.classList.remove('show');
    input.style.borderColor = '';
    input.style.boxShadow = '';
    
    // Purge text content once the transition collapses cleanly
    setTimeout(() => {
      if (!errorDiv.classList.contains('show')) {
        errorDiv.innerText = '';
      }
    }, 200);
  }
}

function clearAllErrors() {
  const errors = document.querySelectorAll('.error-message');
  const inputs = document.querySelectorAll('.form-input, .saas-select');
  
  errors.forEach(err => {
    err.classList.remove('show');
    err.innerText = '';
  });
  
  inputs.forEach(input => {
    input.style.borderColor = '';
    input.style.boxShadow = '';
  });
}

// Regex Helpers
function isValidEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase().trim());
}

function isValidPassword(password) {
  // Enforces structural safety: min 8 characters with at least one number and one special symbol
  return password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

/**
 * Attaches real-time blur and change validation listeners to individual fields.
 */
function initValidationTriggers() {
  // Email fields
  ['signin-email', 'signup-email', 'forgot-email'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener('blur', () => {
      const value = input.value.trim();
      if (value === '') {
        showError(id, 'Email address is required.');
      } else if (!isValidEmail(value)) {
        showError(id, 'Please enter a valid email address.');
      } else {
        clearError(id);
      }
    });

    input.addEventListener('input', () => {
      if (isValidEmail(input.value.trim())) {
        clearError(id);
      }
    });
  });

  // Login Password Field
  const signinPass = document.getElementById('signin-password');
  if (signinPass) {
    signinPass.addEventListener('blur', () => {
      if (signinPass.value.trim() === '') {
        showError('signin-password', 'Password is required.');
      } else {
        clearError('signin-password');
      }
    });
    signinPass.addEventListener('input', () => {
      if (signinPass.value.trim() !== '') {
        clearError('signin-password');
      }
    });
  }

  // Registration Full Name Field
  const signupNameInput = document.getElementById('signup-name');
  if (signupNameInput) {
    signupNameInput.addEventListener('blur', () => {
      if (signupNameInput.value.trim() === '') {
        showError('signup-name', 'Full name is required.');
      } else {
        clearError('signup-name');
      }
    });
    signupNameInput.addEventListener('input', () => {
      if (signupNameInput.value.trim() !== '') {
        clearError('signup-name');
      }
    });
  }

  // Registration Password Field
  const signupPass = document.getElementById('signup-password');
  if (signupPass) {
    signupPass.addEventListener('blur', () => {
      const val = signupPass.value;
      if (val === '') {
        showError('signup-password', 'Password is required.');
      } else if (!isValidPassword(val)) {
        showError('signup-password', 'Minimum 8 characters with at least 1 number & 1 symbol required.');
      } else {
        clearError('signup-password');
      }
    });
    signupPass.addEventListener('input', () => {
      if (isValidPassword(signupPass.value)) {
        clearError('signup-password');
      }
    });
  }

  // Workspace Name Field
  const saasName = document.getElementById('saas-name');
  if (saasName) {
    saasName.addEventListener('blur', () => {
      if (saasName.value.trim() === '') {
        showError('saas-name', 'Workspace name is required.');
      } else {
        clearError('saas-name');
      }
    });
    saasName.addEventListener('input', () => {
      if (saasName.value.trim() !== '') {
        clearError('saas-name');
      }
    });
  }
}

/**
 * ==================================================================
 * 4. DYNAMIC SAAS & FLOW MANAGEMENT
 * ==================================================================
 */
function initFormInteractions() {
  
  // Dynamic Workspace Auto-onboarding Logic
  const saasUsage = document.getElementById('saas-usage');
  const saasName = document.getElementById('saas-name');
  const saasRoleGroup = document.getElementById('saas-role-group');
  const saasRole = document.getElementById('saas-role');

  if (saasUsage && saasName && saasRoleGroup && saasRole) {
    saasUsage.addEventListener('change', () => {
      clearError('saas-usage');
      const selectedValue = saasUsage.value;

      // Smart Smart workspace naming suggestions based on full name input
      const ownerName = state.signupName ? state.signupName.split(' ')[0] : 'My';
      
      if (saasName.value.trim() === '' || 
          saasName.value.includes("'s Space") || 
          saasName.value.includes(" Studio") || 
          saasName.value === "Team Workspace") {
        
        if (selectedValue === 'personal') {
          saasName.value = `${ownerName}'s Space`;
        } else if (selectedValue === 'freelance') {
          saasName.value = `${ownerName} Studio`;
        } else if (selectedValue === 'team') {
          saasName.value = `Team Workspace`;
        }
        clearError('saas-name');
      }

      // Dynamic role display behavior
      if (selectedValue === 'team') {
        saasRoleGroup.style.display = 'flex';
        saasRoleGroup.style.flexDirection = 'column';
        requestAnimationFrame(() => {
          setTimeout(() => {
            saasRoleGroup.style.opacity = '1';
          }, 30);
        });
        saasRole.setAttribute('required', 'true');
      } else {
        saasRoleGroup.style.opacity = '0';
        setTimeout(() => {
          saasRoleGroup.style.display = 'none';
        }, 300);
        saasRole.removeAttribute('required');
        clearError('saas-role');
      }
    });

    saasRole.addEventListener('change', () => {
      if (saasRole.value !== '') {
        clearError('saas-role');
      }
    });
  }

  // --- SUBMISSIONS ORCHESTRATORS ---

  // Sign In Email Form
  const signinEmailForm = document.getElementById('signin-email-form');
  if (signinEmailForm) {
    signinEmailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('signin-email');
      const val = input.value.trim();

      if (val === '') {
        showError('signin-email', 'Email address is required.');
        return;
      }
      if (!isValidEmail(val)) {
        showError('signin-email', 'Please enter a valid email address.');
        return;
      }

      state.email = val;
      const displayField = document.getElementById('display-signin-email');
      if (displayField) displayField.innerText = val;
      goToStep('signin-step-2');
    });
  }

  // Sign In Password Form
  const signinPasswordForm = document.getElementById('signin-password-form');
  if (signinPasswordForm) {
    signinPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('signin-password');
      const val = input.value;

      if (val === '') {
        showError('signin-password', 'Password is required.');
        return;
      }

      // Animate submit button to loaded state
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Connected';
        console.log('Successfully Authenticated Session:', { email: state.email });
        
        setTimeout(() => {
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
          input.value = '';
          switchFlow('signin');
        }, 1500);
      }, 1500);
    });
  }

  // Sign Up Email Form
  const signupEmailForm = document.getElementById('signup-email-form');
  if (signupEmailForm) {
    signupEmailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('signup-email');
      const val = input.value.trim();

      if (val === '') {
        showError('signup-email', 'Email address is required.');
        return;
      }
      if (!isValidEmail(val)) {
        showError('signup-email', 'Please enter a valid email address.');
        return;
      }

      state.signupEmail = val;
      goToStep('signup-step-2');
    });
  }

  // Sign Up Details Form
  const signupDetailsForm = document.getElementById('signup-details-form');
  if (signupDetailsForm) {
    signupDetailsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('signup-name');
      const passInput = document.getElementById('signup-password');
      const nameVal = nameInput.value.trim();
      const passVal = passInput.value;

      let errorDetected = false;

      if (nameVal === '') {
        showError('signup-name', 'Full name is required.');
        errorDetected = true;
      }
      if (passVal === '') {
        showError('signup-password', 'Password is required.');
        errorDetected = true;
      } else if (!isValidPassword(passVal)) {
        showError('signup-password', 'Password must be stronger.');
        errorDetected = true;
      }

      if (errorDetected) return;

      state.signupName = nameVal;
      state.signupPassword = passVal;
      goToStep('signup-step-3');
    });
  }

  // Sign Up SaaS Workspace Customization Form
  const signupSaasForm = document.getElementById('signup-saas-form');
  if (signupSaasForm) {
    signupSaasForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usageSelect = document.getElementById('saas-usage');
      const nameInput = document.getElementById('saas-name');
      const roleSelect = document.getElementById('saas-role');

      let errorDetected = false;

      if (usageSelect.value === '') {
        showError('saas-usage', 'Please choose how you will use the product.');
        errorDetected = true;
      }
      if (nameInput.value.trim() === '') {
        showError('saas-name', 'Workspace name is required.');
        errorDetected = true;
      }
      if (usageSelect.value === 'team' && roleSelect.value === '') {
        showError('saas-role', 'Please choose your professional workspace role.');
        errorDetected = true;
      }

      if (errorDetected) return;

      state.workspaceUsage = usageSelect.value;
      state.workspaceName = nameInput.value.trim();
      state.workspaceRole = usageSelect.value === 'team' ? roleSelect.value : '';

      completeRegistration(false);
    });
  }

  // Forgot Password Email Submission
  const forgotEmailForm = document.getElementById('forgot-email-form');
  if (forgotEmailForm) {
    forgotEmailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('forgot-email');
      const val = input.value.trim();

      if (val === '') {
        showError('forgot-email', 'Email address is required.');
        return;
      }
      if (!isValidEmail(val)) {
        showError('forgot-email', 'Please enter a valid email address.');
        return;
      }

      const displayField = document.getElementById('display-forgot-email');
      if (displayField) displayField.innerText = val;
      goToStep('forgot-step-2');
    });
  }
}

/**
 * ==================================================================
 * 5. REGISTRATION DISPATCHER
 * ==================================================================
 * Runs the concluding sequence, saving workspace attributes or applying 
 * default parameters upon request of a hard skip.
 */
function completeRegistration(isSkipped = false) {
  const payload = {
    email: state.signupEmail,
    fullName: state.signupName,
    password: state.signupPassword,
    setupMethod: isSkipped ? 'Skipped (Applied Defaults)' : 'Completed Onboarding Form',
    workspace: {
      usage: isSkipped ? 'personal' : state.workspaceUsage,
      name: isSkipped ? `${state.signupName.split(' ')[0] || 'My'}'s Space` : state.workspaceName,
      role: isSkipped ? 'other' : state.workspaceRole
    }
  };

  console.log('Submitting Account Creation Payload:', payload);

  const form = document.getElementById('signup-saas-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const skipBtn = form.querySelector('.skip-step-btn a');
  const originalHTML = submitBtn.innerHTML;

  // Render loading visual cue
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Initializing workspace...';
  submitBtn.disabled = true;
  if (skipBtn) skipBtn.style.pointerEvents = 'none';

  setTimeout(() => {
    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Onboarding Completed!';
    
    setTimeout(() => {
      // Clean up DOM and return back to standard state
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      if (skipBtn) skipBtn.style.pointerEvents = 'auto';

      // Purge and reset input fields
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-name').value = '';
      document.getElementById('signup-password').value = '';
      document.getElementById('saas-usage').selectedIndex = 0;
      document.getElementById('saas-name').value = '';
      document.getElementById('saas-role').selectedIndex = 0;

      const roleGroup = document.getElementById('saas-role-group');
      if (roleGroup) {
        roleGroup.style.display = 'none';
        roleGroup.style.opacity = '0';
      }

      // Return user safely to Sign In flow
      switchFlow('signin');
    }, 1500);
  }, 1800);
}
