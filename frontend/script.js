function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
  }
  
  function showLoginForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
  }
  
  // Add registration logic
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
  
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
  
    const userData = {
      email: email,
      password: password,
    };
  
    // Call backend to register user here (using fetch or axios)
    console.log('Registering user:', userData);
  
    alert('Registration successful!');
    showLoginForm();
  });
  
  // Add login logic
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
  
    const loginData = {
      email: email,
      password: password,
    };
  
    // Call backend to log in user here (using fetch or axios)
    console.log('Logging in user:', loginData);
  
    alert('Login successful!');
    // Optionally redirect or update UI on successful login
  });
  