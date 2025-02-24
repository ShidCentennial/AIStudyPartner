function showRegisterForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
}

function showLoginForm() {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
}

function showDashboard() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
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

  // Mock login success, then show dashboard
  showDashboard();
});

// File upload logic
document.getElementById('fileUploadForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const formData = new FormData();
  const fileInput = document.getElementById('fileInput');

  if (fileInput.files.length > 0) {
    formData.append('file', fileInput.files[0]);

    fetch('/api/dashboard/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT stored in localStorage
      },
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        document.getElementById('uploadStatus').innerText = data.message;
      })
      .catch(error => {
        document.getElementById('uploadStatus').innerText = 'Error uploading file!';
        console.error(error);
      });
  } else {
    alert('Please select a file to upload.');
  }
});
