// document.addEventListener('DOMContentLoaded', () => {
//     const registerForm = document.querySelector('form[action="/register"]');

//     if (registerForm) {
//         registerForm.addEventListener('submit', (event) => {
//             event.preventDefault(); // Prevent the form from submitting

//             // Get the values from the registration form
//             const username = document.querySelector('#username').value;
//             const email = document.querySelector('#email').value;
//             const password = document.querySelector('#password').value;

//             const registrationData = { username, email, password };

//             // Send registration data to the server
//             fetch('/register', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(registrationData),
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     // Redirect to home page after successful registration
//                     window.location.href = '/home.html';
//                 } else {
//                     alert('Registration failed: ' + data.message); // Show an error message
//                 }
//             })
//             .catch(err => {
//                 console.error('Error during registration:', err);
//                 alert('An error occurred. Please try again.');
//             });
//         });
//     }
// });


// document.addEventListener('DOMContentLoaded', () => {
//     const loginForm = document.querySelector('form[action="/login"]');

//     if (loginForm) {
//         loginForm.addEventListener('submit', (event) => {
//             event.preventDefault(); // Prevent the form from submitting

//             // Get the values from the login form
//             const email = document.querySelector('#email').value;
//             const password = document.querySelector('#password').value;

//             const loginData = { email, password };

//             // Send login data to the server
//             fetch('/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(loginData),
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     // Redirect to home page after successful login
//                     window.location.href = '/home.html';
//                 } else {
//                     alert('Login failed: ' + data.message); // Show an error message
//                 }
//             })
//             .catch(err => {
//                 console.error('Error during login:', err);
//                 alert('An error occurred. Please try again.');
//             });
//         });
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form[action="/login"]');
    const registerForm = document.querySelector('form[action="/register"]');

    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission

            // Get login form data
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;

            // Send login data to the server
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to the home page if login is successful
                    window.location.href = '/home.html';
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(err => console.error('Error during login:', err));
        });
    }

    // Registration form handling
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent the default form submission

            // Get registration form data
            const username = document.querySelector('#username').value;
            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;

            // Send registration data to the server
            fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to the home page if registration is successful
                    window.location.href = '/home.html';
                } else {
                    alert('Registration failed: ' + data.message);
                }
            })
            .catch(err => console.error('Error during registration:', err));
        });
    }
});
