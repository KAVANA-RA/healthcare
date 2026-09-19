(() => {
  "use strict";

  // ── Elements ──
  const tabSignup  = document.getElementById("tab-signup");
  const tabLogin   = document.getElementById("tab-login");
  const form       = document.getElementById("form");
  const submitBtn  = document.getElementById("submit");
  const statusEl   = document.getElementById("status");

  const nameInput     = document.getElementById("name");
  const nameError     = document.getElementById("name-error");
  const nameField     = document.getElementById("name-field");

  const phoneInput    = document.getElementById("phone");
  const phoneError    = document.getElementById("phone-error");

  const passwordInput = document.getElementById("password");
  const passwordError = document.getElementById("password-error");
  const passwordLabel = document.getElementById("password-label");

  const confirmInput  = document.getElementById("confirm");
  const confirmError  = document.getElementById("confirm-error");
  const confirmField  = document.getElementById("confirm-field");

  let mode = "signup"; // "signup" | "login"

  // ── Tab Switching ──
  function setMode(newMode) {
    mode = newMode;
    const isSignup = mode === "signup";

    // Tab states
    tabSignup.classList.toggle("active", isSignup);
    tabLogin.classList.toggle("active", !isSignup);
    tabSignup.setAttribute("aria-selected", String(isSignup));
    tabLogin.setAttribute("aria-selected", String(!isSignup));

    // Show / hide signup-only fields
    document.querySelectorAll(".signup-only").forEach((el) => {
      el.classList.toggle("hidden", !isSignup);
    });

    // Password label text
    passwordLabel.textContent = isSignup ? "Create password" : "Password";

    // Submit button text
    submitBtn.textContent = isSignup ? "Create account" : "Log in";

    // Clear everything
    clearAllErrors();
    statusEl.textContent = "";
  }

  tabSignup.addEventListener("click", () => setMode("signup"));
  tabLogin.addEventListener("click", () => setMode("login"));

  // ── Phone: digits only ──
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "");
  });

  phoneInput.addEventListener("keydown", (e) => {
    if (
      e.key.length === 1 &&
      !/\d/.test(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  });

  // ── Validation helpers ──
  function showError(input, errorEl, msg) {
    errorEl.textContent = msg;
    input.classList.add("invalid");
  }

  function clearError(input, errorEl) {
    errorEl.textContent = "";
    input.classList.remove("invalid");
  }

  function clearAllErrors() {
    clearError(nameInput, nameError);
    clearError(phoneInput, phoneError);
    clearError(passwordInput, passwordError);
    clearError(confirmInput, confirmError);
  }

  // Clear individual errors on typing
  nameInput.addEventListener("input", () =>
    clearError(nameInput, nameError)
  );

  phoneInput.addEventListener("input", () =>
    clearError(phoneInput, phoneError)
  );

  passwordInput.addEventListener("input", () =>
    clearError(passwordInput, passwordError)
  );

  confirmInput.addEventListener("input", () =>
    clearError(confirmInput, confirmError)
  );

  // ── Form Submit ──
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    clearAllErrors();
    statusEl.textContent = "";

    let valid = true;

    // Name (sign-up only)
    if (mode === "signup") {
      if (!nameInput.value.trim()) {
        showError(
          nameInput,
          nameError,
          "Please enter your name."
        );
        valid = false;
      }
    }

    // Phone
    const phone = phoneInput.value.trim();

    if (!phone) {
      showError(
        phoneInput,
        phoneError,
        "Please enter your phone number."
      );
      valid = false;
    } else if (phone.length !== 10) {
      showError(
        phoneInput,
        phoneError,
        "Phone number must be exactly 10 digits."
      );
      valid = false;
    }

    // Password
    const pw = passwordInput.value;

    if (!pw) {
      showError(
        passwordInput,
        passwordError,
        "Please enter a password."
      );
      valid = false;
    } else if (pw.length < 6) {
      showError(
        passwordInput,
        passwordError,
        "Password must be at least 6 characters."
      );
      valid = false;
    }

    // Confirm password (sign-up only)
    if (mode === "signup") {
      const cpw = confirmInput.value;

      if (!cpw) {
        showError(
          confirmInput,
          confirmError,
          "Please confirm your password."
        );
        valid = false;
      } else if (cpw !== pw) {
        showError(
          confirmInput,
          confirmError,
          "Passwords do not match."
        );
        valid = false;
      }
    }

    // Stop here if validation failed
    if (!valid) return;

    // ── Successful Login / Signup ──
    if (mode === "signup") {
      statusEl.textContent =
        `Account created for ${nameInput.value.trim()} ✓`;
    } else {
      statusEl.textContent =
        "Logged in successfully ✓";
    }

    // Save the user's name so the second interface
    // can use it later if needed
    const userName = nameInput.value.trim();

    if (userName) {
      localStorage.setItem("healthcareUserName", userName);
    }

    // Clear the form
    form.reset();

    // ── Open the second interface ──
    setTimeout(() => {
      window.location.href = "biopage/index.html";
    }, 500);
  });

})();