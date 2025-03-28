# Gemini Görsel Analiz

Gemini 2.0 Flash AI modeli ile görselleri yükleyip analiz edebileceğiniz web uygulaması.

## 🚀 Demo

Canlı demo: [https://gemini-1-5-flash-flask.onrender.com](https://gemini-1-5-flash-flask.onrender.com)

## ✨ Özellikler

- Herhangi bir görseli yükleyip analiz edebilme
- Gemini 2.0 Flash AI modeliyle görsel içeriğini anlama
- Türkçe dil desteği
- Özelleştirilmiş sorular sorabilme
- Görselleri temizleme ve yenilerini yükleme
- Mobil uyumlu tasarım

## 🛠️ Kurulum

### Gereksinimler

- Python 3.7 veya üzeri
- Google AI API anahtarı ([API almak için](https://g.co/ai/idxGetGeminiKey))

### Adımlar

1. Repoyu klonlayın:
```bash
git clone https://github.com/yucel-gumus/gemini-2.0_image_Chat.git
cd gemini-2.0_image_Chat
```

2. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

3. `.env` dosyasını oluşturun ve API anahtarınızı ekleyin:
```
API_KEY_GEMINI=your_api_key_here
```

4. Uygulamayı çalıştırın:
```bash
python main.py
```

5. Tarayıcınızda [http://localhost:5001](http://localhost:5001) adresine gidin.

## 📝 Kullanım

1. "Görsel Seçmek İçin Tıklayın" butonuna basın
2. Analiz edilecek görseli seçin
3. Görsel hakkında sormak istediğiniz soruyu yazın (varsayılan: "Bu resimde ne var?")
4. "Sor" butonuna tıklayın ve Gemini'nin yanıtını bekleyin
5. Yeni bir görsel yüklemek için "Temizle" butonuna basın

## 🧪 Teknolojiler

- **Backend**: Flask, Python
- **AI Model**: Google Gemini 2.0 Flash
- **Frontend**: HTML, CSS, JavaScript
- **API**: Google Generative AI API

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

- [Yücel Gümüş](https://github.com/yucel-gumus)

---

⭐️ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
