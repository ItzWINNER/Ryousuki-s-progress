const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

const dbPath = path.join(__dirname, 'database.json');
const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Bazani o'qish (Papkani skanerlamaydi, faqat database.json dan o'qiydi)
function getDatabase() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify([]));
    }
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveDatabase(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Multer sozlamasi
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Galereya uchun rasmlarni olish (Faqat bazadan o'qiydi)
app.get('/api/images', (req, res) => {
    const db = getDatabase();
    res.json(db);
});

// Admin rasm yuklashi
app.post('/api/upload', upload.single('image'), (req, res) => {
    const { password, name, desc } = req.body;
    
    if (password !== "1234") {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(401).json({ success: false, message: "Noto'g'ri parol!" });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: "Rasm topilmadi!" });
    }

    const newItem = {
        id: Date.now(),
        filename: req.file.filename,
        url: `/images/${req.file.filename}`,
        name: name || "Nomsiz rasm",
        desc: desc || "Rasm tavsifi kiritilmagan."
    };

    const db = getDatabase();
    db.unshift(newItem); // Yangi rasmni ro'yxat boshiga qo'shish
    saveDatabase(db);

    res.json({ success: true, item: newItem });
});

app.listen(PORT, () => {
    console.log(`Server ishga tushdi! Havola: http://localhost:${PORT}/index.html`);
});
