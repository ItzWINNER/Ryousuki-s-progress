document.addEventListener('DOMContentLoaded', () => {
    loadImages();
});

// Start ekranidan o'tish
function startGallery() {
    const startScreen = document.getElementById('startScreen');
    const mainContent = document.getElementById('mainContent');
    startScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden-content');
}

// Sidebar ochib yopish
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('expanded');
}

// Admin Modalni ochish/yopish
function openAdminModal() {
    document.getElementById('adminModal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.add('hidden');
    clearAdminForm();
}

function clearAdminForm() {
    document.getElementById('imageNameInput').value = '';
    document.getElementById('imageDescInput').value = '';
    document.getElementById('adminPass').value = '';
    
    // Preview va matnni qayta tiklash
    document.getElementById('previewImg').src = '';
    document.getElementById('previewImg').classList.add('hidden');
    document.getElementById('dropContent').classList.remove('hidden');
    document.getElementById('dropText').innerText = 'Drag & drop or import';
    
    selectedFile = null;
}

let selectedFile = null;

// Fayl tanlanganda ishlaydigan umumiy funksiya
function processFile(file) {
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        
        // FileReader yordamida rasmni o'qib, preview ga qo'shamiz
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewImg = document.getElementById('previewImg');
            const dropContent = document.getElementById('dropContent');
            
            previewImg.src = e.target.result;
            previewImg.classList.remove('hidden');    // Rasmni ko'rsatish
            dropContent.classList.add('hidden');      // Eski ikonka va yozuvni yashirish
        }
        reader.readAsDataURL(file);
    } else {
        alert("Iltimos, haqiqiy rasm faylini tanlang!");
    }
}

// Input orqali tanlanganda
function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        processFile(input.files[0]);
    }
}

// Drag & Drop hodisalari
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#00d2ff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#444b6e';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#444b6e';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
});

// Serverdan rasmlarni yuklab kelish
function loadImages() {
    fetch('/api/images')
        .then(res => res.json())
        .then(data => {
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = '';

            if (data.length === 0) {
                gallery.innerHTML = '<p style="text-align:center; color: #aaa; grid-column: 1/-1;">Hozircha rasmlar yo\'q. Admin paneldan qo\'shing!</p>';
                return;
            }

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = () => openLightbox(item.url, item.name, item.desc);
                
                card.innerHTML = `
                    <img src="${item.url}" alt="${item.name}">
                    <div class="card-info" onclick="event.stopPropagation()">
                        <h3>${item.name}</h3>
                        <a href="${item.url}" download="${item.filename}" class="download-btn">Download</a>
                    </div>
                `;
                gallery.appendChild(card);
            });
        })
        .catch(err => console.error("Xatolik:", err));
}

// Rasm va ma'lumotlarni Publish qilish
function publishImage() {
    const password = document.getElementById('adminPass').value;
    const name = document.getElementById('imageNameInput').value.trim();
    const desc = document.getElementById('imageDescInput').value.trim();

    if (!selectedFile) {
        alert("Iltimos, rasm tanlang!");
        return;
    }
    if (!name) {
        alert("Iltimos, rasm nomini kiriting!");
        return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('password', password);
    formData.append('name', name);
    formData.append('desc', desc);

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Rasm muvaffaqiyatli publish qilindi!");
            closeAdminModal();
            loadImages();
        } else {
            alert(data.message || "Xatolik yuz berdi!");
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server bilan ulanishda xatolik!");
    });
}

// Lightbox oynasini ochish va yopish
function openLightbox(url, name, desc) {
    document.getElementById('lightboxImg').src = url;
    document.getElementById('lightboxTitle').innerText = name || "Nomsiz";
    
    const descBox = document.getElementById('lightboxDesc');
    descBox.innerText = desc || "Rasm tavsifi kiritilmagan.";
    descBox.classList.add('collapsed');
    
    document.getElementById('lightboxModal').classList.remove('hidden');
}

function closeLightbox(e) {
    document.getElementById('lightboxModal').classList.add('hidden');
}

function closeLightboxForce() {
    document.getElementById('lightboxModal').classList.add('hidden');
}

function toggleDescription(element) {
    element.classList.toggle('collapsed');
}
