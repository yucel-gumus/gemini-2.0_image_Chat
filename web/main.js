import { streamGemini } from './gemini-api.js';

// DOM Elements
const form = document.querySelector('form');
const promptInput = document.querySelector('input[name="prompt"]');
const output = document.querySelector('.output');
const imageFileInput = document.querySelector('#imageFile');
const imagePreview = document.querySelector('#imagePreview');
const loadingSpinner = document.querySelector('#loadingSpinner');
const submitButton = document.querySelector('#submitButton');
const clearButton = document.querySelector('#clearButton');

// Initialize markdown parser
const md = new markdownit({
  linkify: true,
  breaks: true,
  highlight: function (str, lang) {
    return `<pre class="language-${lang}"><code>${str}</code></pre>`;
  }
});

/**
 * Handle form submission
 */
form.onsubmit = async (ev) => {
  ev.preventDefault();
  
  // Validate image selection
  if (!imageFileInput.files[0]) {
    showError('Lütfen bir resim dosyası seçin.');
    return;
  }
  
  // Set loading state
  setLoading(true);
  output.textContent = ''; // Clear previous results
  
  try {
    const file = imageFileInput.files[0];
    
    // Convert image to base64
    const imageBase64 = await imageToBase64(file);
    
    // Prepare content payload for Gemini
    const contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: file.type, data: imageBase64 } },
          { text: promptInput.value || 'Bu resimde ne var?' }
        ]
      }
    ];

    // Call Gemini API with streaming response
    const stream = streamGemini({
      model: 'gemini-1.5-flash',
      contents,
    });

    // Process stream response
    let buffer = [];
    for await (let chunk of stream) {
      buffer.push(chunk);
      output.innerHTML = md.render(buffer.join(''));
      
      // Auto-scroll to latest content
      output.scrollTop = output.scrollHeight;
    }
  } catch (error) {
    console.error('Error:', error);
    showError(`Hata: ${error.message || error}`);
  } finally {
    setLoading(false);
  }
};

/**
 * Display error message in output area
 */
function showError(message) {
  output.innerHTML = `<div class="error">${message}</div>`;
}

/**
 * Set application loading state
 */
function setLoading(isLoading) {
  loadingSpinner.style.display = isLoading ? 'flex' : 'none';
  submitButton.disabled = isLoading;
  imageFileInput.disabled = isLoading;
  promptInput.disabled = isLoading;
}

/**
 * Convert image file to base64
 */
async function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(base64js.fromByteArray(new Uint8Array(reader.result)));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Preview image when selected
 */
imageFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.innerHTML = `<img src="${reader.result}" alt="Seçilen Resim">`;
      clearButton.disabled = false;
    };
    reader.readAsDataURL(file);
  } else {
    resetImagePreview();
  }
});

/**
 * Clear button handler
 */
clearButton.addEventListener('click', () => {
  // Reset form
  form.reset();
  resetImagePreview();
  output.innerHTML = '(Henüz bir yanıt yok)';
  clearButton.disabled = true;
});

/**
 * Reset image preview to placeholder
 */
function resetImagePreview() {
  imagePreview.innerHTML = '<div class="placeholder">Görsel Seçmek İçin Tıklayın</div>';
}
