// ==========================================================================
// Care App - Personal Details Form Interactions
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('personalDetailsForm');
  const dobInput = document.getElementById('dob');
  const hospitalInput = document.getElementById('hospital');
  const numInput = document.getElementById('num');
  const bioInput = document.getElementById('bio');
  const bioCounter = document.getElementById('bioCounter');

  // Confirmation Panel Elements
  const confirmationPanel = document.getElementById('confirmationPanel');
  const summaryDob = document.getElementById('summaryDob');
  const summaryHospital = document.getElementById('summaryHospital');
  const summaryNum = document.getElementById('summaryNum');
  const summaryBio = document.getElementById('summaryBio');
  const editBtn = document.getElementById('editBtn');
  const confirmProceedBtn = document.getElementById('confirmProceedBtn');

  // Error feedback spans
  const dobError = document.getElementById('dobError');
  const hospitalError = document.getElementById('hospitalError');
  const numError = document.getElementById('numError');


  // Set maximum date for DOB to today
  const today = new Date().toISOString().split('T')[0];

  if (dobInput) {
    dobInput.setAttribute('max', today);
  }


  // 1. Bio Character Counter
  if (bioInput && bioCounter) {

    bioInput.addEventListener('input', () => {

      const currentLength = bioInput.value.length;

      bioCounter.textContent = `${currentLength}/200`;

      if (currentLength >= 190) {
        bioCounter.style.color = '#E53E3E';
      } else {
        bioCounter.style.color = 'var(--text-light)';
      }

    });

  }


  // 2. Format / Filter "num" to only allow numeric digits
  if (numInput) {

    numInput.addEventListener('input', () => {

      numInput.value = numInput.value
        .replace(/\D/g, '')
        .slice(0, 10);

      if (numInput.value.length === 10) {
        clearError(numInput, numError);
      }

    });

  }


  // Clear errors on input
  if (dobInput) {
    dobInput.addEventListener('change', () => {
      clearError(dobInput, dobError);
    });
  }

  if (hospitalInput) {
    hospitalInput.addEventListener('input', () => {
      clearError(hospitalInput, hospitalError);
    });
  }


  // Error functions
  function setError(input, errorElement, message) {

    if (input) {
      input.classList.add('is-invalid');
    }

    if (errorElement) {
      errorElement.textContent = message;
    }

  }


  function clearError(input, errorElement) {

    if (input) {
      input.classList.remove('is-invalid');
    }

    if (errorElement) {
      errorElement.textContent = '';
    }

  }


  // 3. Form Submission & Validation
  if (form) {

    form.addEventListener('submit', (e) => {

      e.preventDefault();

      let isValid = true;


      // Validate DOB
      if (!dobInput.value) {

        setError(
          dobInput,
          dobError,
          'Please select your Date of Birth.'
        );

        isValid = false;

      } else {

        clearError(dobInput, dobError);

      }


      // Validate Hospital
      if (!hospitalInput.value.trim()) {

        setError(
          hospitalInput,
          hospitalError,
          'Please enter or select a hospital.'
        );

        isValid = false;

      } else {

        clearError(hospitalInput, hospitalError);

      }


      // Validate Phone / Number
      if (!numInput.value.trim()) {

        setError(
          numInput,
          numError,
          'Please enter your contact number.'
        );

        isValid = false;

      } else if (numInput.value.trim().length < 10) {

        setError(
          numInput,
          numError,
          'Please enter a valid 10-digit number.'
        );

        isValid = false;

      } else {

        clearError(numInput, numError);

      }


      // Stop if validation failed
      if (!isValid) {
        return;
      }


      // Populate confirmation summary
      const formattedDob = new Date(
        dobInput.value
      ).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });


      summaryDob.textContent = formattedDob;

      summaryHospital.textContent =
        hospitalInput.value.trim();

      summaryNum.textContent =
        `+91 ${numInput.value.trim()}`;

      summaryBio.textContent =
        bioInput.value.trim()
          ? bioInput.value.trim()
          : 'None provided';


      // Hide form
      form.style.display = 'none';

      // Show confirmation panel
      confirmationPanel.style.display = 'flex';

    });

  }


  // 4. Back to Edit Button
  if (editBtn) {

    editBtn.addEventListener('click', () => {

      confirmationPanel.style.display = 'none';

      form.style.display = 'flex';

    });

  }


  // 5. Confirm Proceed Button
  // Save personal details and open the third interface
  if (confirmProceedBtn) {

    confirmProceedBtn.addEventListener('click', () => {

      // Collect personal details
      const personalData = {

        dob: dobInput.value,

        hospital: hospitalInput.value.trim(),

        phone: numInput.value.trim(),

        bio: bioInput.value.trim(),

        savedAt: new Date().toISOString()

      };


      // Save personal details
      localStorage.setItem(
        'healthPersonalData',
        JSON.stringify(personalData)
      );


      // Save phone number separately
      if (numInput.value.trim()) {

        localStorage.setItem(
          'healthPhone',
          numInput.value.trim()
        );

      }


      // ==========================================================
      // CONNECT SECOND INTERFACE TO THIRD INTERFACE
      // ==========================================================

      window.location.href = '../dashboard.html';

    });

  }

<<<<<<< HEAD
  // 6. Confirm Proceed Button -> Proceed to Dashboard
  confirmProceedBtn.addEventListener('click', () => {
    const personalData = {
      dob: dobInput.value,
      hospital: hospitalInput.value.trim(),
      phone: numInput.value.trim(),
      bio: bioInput.value.trim(),
      fileName: selectedFile ? selectedFile.name : null,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('healthPersonalData', JSON.stringify(personalData));
    if (numInput.value.trim()) {
      localStorage.setItem('healthPhone', numInput.value.trim());
    }
    
    // Redirect to Dashboard
    window.location.href = '../dashboard.html';
  });
=======
>>>>>>> 8770a6f (updateded merge)
});
