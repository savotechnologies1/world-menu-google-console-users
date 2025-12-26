function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

const registerForm = document.getElementById("registerForm");
const modal = document.getElementById("typeModal");
let registerData = {};

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    registerData = { username, email, password };

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function registerUser(role) {
  try {
    const payload = {
      ...registerData,
      role,
    };

    const response = await fetch(
      "http://localhost:5005/api/auth/register-google-console-user",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.success) {
      alert("Registration Successful");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (error) {
    alert("Server error");
  } finally {
    closeModal();
  }
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(
        "http://localhost:5005/api/auth/login-google-console-user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));
        window.location.href = "user.html";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("Server error");
    }
  });
}

// ================== USER PAGE ==================
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (document.getElementById("username") && user) {
  if (!token) {
    window.location.href = "login.html";
  }

  document.getElementById("username").innerText = user.username;
  document.getElementById("email").innerText = user.email;
  document.getElementById("role").innerText = user.role;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

async function deleteAccount() {
  if (!confirm("Are you sure you want to delete your account?")) return;

  try {
    const response = await fetch(
      `http://localhost:5005/api/auth/delete-google-console-user/${user.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.status === 200) {
      alert("Account deleted successfully");
      localStorage.clear();
      window.location.href = "register.html";
    } else {
      alert(data.message || "Delete failed");
    }
  } catch (error) {
    alert("Server error");
  }
}
