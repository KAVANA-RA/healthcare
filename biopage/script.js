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
  
  // File Upload Elements
  const dropZone = document.getElementById('dropZone');
  const fileUpload = document.getElementById('fileUpload');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const filePreview = document.getElementById('filePreview');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const fileIcon = document.getElementById('fileIcon');
  const removeFileBtn = document.getElementById('removeFileBtn');

  // Confirmation Panel Elements
  const confirmationPanel = document.getElementById('confirmationPanel');
  const summaryDob = document.getElementById('summaryDob');
  const summaryHospital = document.getElementById('summaryHospital');
  const summaryNum = document.getElementById('summaryNum');
  const summaryBio = document.getElementById('summaryBio');
  const summaryFile = document.getElementById('summaryFile');
  const editBtn = document.getElementById('editBtn');
  const confirmProceedBtn = document.getElementById('confirmProceedBtn');

  // Error feedback spans
  const dobError = document.getElementById('dobError');
  const hospitalError = document.getElementById('hospitalError');
  const numError = document.getElementById('numError');

  // Set max date for DOB to today
  const today = new Date().toISOString().split('T')[0];
  dobInput.setAttribute('max', today);

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
    numInput.addEventListener('input', (e) => {
      numInput.value = numInput.value.replace(/\D/g, '').slice(0, 10);
      if (numInput.value.length === 10) {
        clearError(numInput, numError);
      }
    });
  }

  // Clear errors on input
  dobInput.addEventListener('change', () => clearError(dobInput, dobError));
  hospitalInput.addEventListener('input', () => clearError(hospitalInput, hospitalError));

  function setError(input, errorElement, message) {
    input.classList.add('is-invalid');
    errorElement.textContent = message;
  }

  function clearError(input, errorElement) {
    input.classList.remove('is-invalid');
    errorElement.textContent = '';
  }

  // 3. Drag & Drop and File Upload Handling
  let selectedFile = null;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileUpload.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);

    // Icon based on type
    if (file.type.includes('pdf')) {
      fileIcon.textContent = '📕';
    } else if (file.type.includes('image')) {
      fileIcon.textContent = '🖼️';
    } else {
      fileIcon.textContent = '📄';
    }

    uploadPlaceholder.style.display = 'none';
    filePreview.style.display = 'flex';
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileUpload.value = '';
    filePreview.style.display = 'none';
    uploadPlaceholder.style.display = 'flex';
  });

  // 4. Form Submission & Validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate DOB
    if (!dobInput.value) {
      setError(dobInput, dobError, 'Please select your Date of Birth.');
      isValid = false;
    } else {
      clearError(dobInput, dobError);
    }

    // Validate Hospital
    if (!hospitalInput.value.trim()) {
      setError(hospitalInput, hospitalError, 'Please enter or select a hospital.');
      isValid = false;
    } else {
      clearError(hospitalInput, hospitalError);
    }

    // Validate Phone / Number
    if (!numInput.value.trim()) {
      setError(numInput, numError, 'Please enter your contact number.');
      isValid = false;
    } else if (numInput.value.trim().length < 10) {
      setError(numInput, numError, 'Please enter a valid 10-digit number.');
      isValid = false;
    } else {
      clearError(numInput, numError);
    }

    if (!isValid) {
      return;
    }

    // Populate confirmation summary
    const formattedDob = new Date(dobInput.value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    summaryDob.textContent = formattedDob;
    summaryHospital.textContent = hospitalInput.value.trim();
    summaryNum.textContent = `+91 ${numInput.value.trim()}`;
    summaryBio.textContent = bioInput.value.trim() ? bioInput.value.trim() : 'None provided';
    summaryFile.textContent = selectedFile ? selectedFile.name : 'No file uploaded';

    // Transition view
    form.style.display = 'none';
    confirmationPanel.style.display = 'flex';
  });

  // 5. Back to Edit Button
  editBtn.addEventListener('click', () => {
    confirmationPanel.style.display = 'none';
    form.style.display = 'flex';
  });

  // 6. Confirm Proceed Button
  confirmProceedBtn.addEventListener('click', () => {
    alert('Details successfully saved! Proceeding to Step 2 (Medical Assessment)...');
  });
});

