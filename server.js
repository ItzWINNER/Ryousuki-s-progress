const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Statik fayllarni ulash
app.use(express.static(__dirname));
app.use(express.json());

// Rasmlarni 'images/' papkasiga saqlash uchun sozlama
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        // Fayl nomini saqlab qolish va takrorlanmasligi uchun vaqt qo'shish
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 1. Papkadagi barcha rasmlarni avtomatik o'qib beruvchi API
app.get('/api/images', (req, res) => {
    const imagesDir = path.join(__dirname, 'images');
    
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Papkani o'qib bo'lmadi!" });
        }
        // Faqat rasm formatlarini saralab olish
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.jfif'];
        const imageFiles = files.filter(file => 
            imageExtensions.includes(path.extname(file).toLowerCase())
        );
        res.json(imageFiles);
    });
});

// 2. Admin rasm yuklashi uchun API (Parol tekshiruvi bilan)
app.post('/api/upload', upload.single('image'), (req, res) => {
    const { password } = req.body;
    
    // Parolni shu yerda o'zgartirishingiz mumkin (Masalan: '1234')
    if (password !== "1234") {
        // Parol xato bo'lsa, yuklangan rasmni o'chirib yuborish
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(401).json({ success: false, message: "Noto'g'ri parol!" });
    }

    res.json({ success: true, filename: req.file.filename });
});

app.listen(PORT, () => {
    console.log(`Server ishga tushdi! Havola: http://localhost:${PORT}/start.html`);
});