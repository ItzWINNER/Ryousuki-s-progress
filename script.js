// Sahifa ochilishi bilan rasmlarni serverdan avtomatik yuklab olish
document.addEventListener('DOMContentLoaded', () => {
    loadImages();
});

function loadImages() {
    fetch('/api/images')
        .then(res => res.json())
        .then(files => {
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = ''; // Avvalgi ro'yxatni tozalash

            files.forEach(filename => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <img src="images/${filename}" alt="${filename}">
                    <div class="card-info">
                        <h3>${filename}</h3>
                        <a href="images/${filename}" download="${filename}" class="download-btn">Download</a>
                    </div>
                `;
                gallery.appendChild(card);
            });
        })
        .catch(err => console.error("Rasmlarni yuklashda xatolik:", err));
}

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('hidden');
}

// Admin panel orqali to'g'ridan-to'g'ri serverga rasm qo'shish
function uploadImage() {
    const password = document.getElementById('adminPass').value;
    const fileInput = document.getElementById('imageInput');

    if (!fileInput.files[0]) {
        alert("Iltimos, rasm faylini tanlang!");
        return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('password', password);

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Rasm muvaffaqiyatli yuklandi va serverga saqlandi!");
            fileInput.value = '';
            document.getElementById('adminPass').value = '';
            loadImages(); // Galereyani yangilash
        } else {
            alert(data.message || "Xatolik yuz berdi!");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server bilan ulanishda xatolik!");
    });
}