import { streamGemini } from './gemini-api.js';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let imageFileInput = document.querySelector('#imageFile');
let imagePreview = document.querySelector('#imagePreview');

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Yanıt Bekleniyor...';

  try {
    let file = imageFileInput.files[0];
    if (!file) {
      throw new Error('Lütfen bir resim dosyası seçin.');
    }

    let imageBase64 = await new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onloadend = () => resolve(base64js.fromByteArray(new Uint8Array(reader.result)));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: file.type, data: imageBase64 } },
          { text: promptInput.value }
        ]
      }
    ];

    let stream = streamGemini({
      model: 'gemini-1.5-flash',
      contents,
    });

    let buffer = [];
    let md = new markdownit();
    for await (let chunk of stream) {
      buffer.push(chunk);
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

imageFileInput.addEventListener('change', (event) => {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = () => {
      imagePreview.innerHTML = `<img src="${reader.result}" alt="Seçilen Resim" style="max-width: 50%; height: auto;">`;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.innerHTML = '';
  }
});
