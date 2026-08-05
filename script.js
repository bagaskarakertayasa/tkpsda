lucide.createIcons();

// ----------------------------------------------------
// MOBILE BURGER MENU INTERACTION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Toggle Hamburger Menu Utama
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 2. Toggle Accordion Dropdown di Mobile (Mendukung Multi-level)
    const dropdownBtns = document.querySelectorAll('.mobile-dropdown-btn');

    dropdownBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah bubbling event ke parent

            // Cari kontainer menu berikutnya
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('[data-lucide="chevron-down"]');

            if (content) {
                content.classList.toggle('hidden');
            }

            // Putar ikon panah saat terbuka
            if (icon) {
                icon.classList.toggle('rotate-180');
            }
        });
    });
});

// ----------------------------------------------------
// REUSABLE STAGGER ANIMATION OBSERVER
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    const setupStaggerAnimation = (sectionId, itemClass, delayMs = 120) => {
        const section = document.getElementById(sectionId);
        const items = document.querySelectorAll(itemClass);

        if (!section || items.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.remove('opacity-0', 'translate-y-8');
                            item.classList.add('opacity-100', 'translate-y-0');
                        }, index * delayMs);
                    });

                    // Hentikan observer setelah animasi berjalan sekali
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(section);
    };

    // Jalankan untuk Section Galeri
    setupStaggerAnimation('galeri-section', '.gallery-item', 150);

    // Jalankan untuk Section Berita
    setupStaggerAnimation('berita', '.news-item', 120);

});

// ----------------------------------------------------
// Video Kegiatan
// ----------------------------------------------------
function playDriveVideo() {
    const thumbnail = document.getElementById('video-thumbnail');
    const iframe = document.getElementById('drive-iframe');

    if (iframe && thumbnail) {
        iframe.src = iframe.getAttribute('data-src');
        thumbnail.classList.add('hidden');
    }
}

// ----------------------------------------------------
// KONFIGURASI UNTUK PDF VIEWER
// ----------------------------------------------------
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let currentPdfUrl = '';
const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');

// Menggambar/Merender halaman ke HTML Canvas
function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(function (page) {
        // Atur skala render (skala 1.5 - 2.0 memberikan ketajaman yang baik di layar HP)
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('pageNum').textContent = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function prevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function nextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

// Fungsi Buka Pop-up
function openPdfModal(urlFile) {
    const modal = document.getElementById('pdfModal');
    modal.classList.remove('hidden');

    // Jika PDF yang dibuka berbeda dari PDF sebelumnya (atau baru pertama kali membuka)
    if (currentPdfUrl !== urlFile) {
        currentPdfUrl = urlFile;
        pdfDoc = null; // Reset dokumen sebelumnya
        pageNum = 1;   // Reset ke halaman 1

        // Tampilkan indikator loading sementara
        document.getElementById('pageNum').textContent = '1';
        document.getElementById('pageCount').textContent = '...';

        // Bersihkan canvas dari render sebelumnya
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Muat file PDF baru
        pdfjsLib.getDocument(urlFile).promise.then(function (pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('pageCount').textContent = pdfDoc.numPages;
            renderPage(pageNum);
        }).catch(function (error) {
            console.error("Gagal memuat PDF: ", error);
            alert("Gagal memuat file PDF. Pastikan file tersedia di folder Anda.");
        });
    }
}

// Fungsi Tutup Pop-up
function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    modal.classList.add('hidden');
}

// Tutup modal jika mengklik di luar area modal (backdrop)
document.getElementById('pdfModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closePdfModal();
    }
});

// ----------------------------------------------------
// HERO SLIDER AUTOMATIC (3 SECONDS) & MANUAL CONTROLS
// ----------------------------------------------------
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.slide-dot');
const prevBtn = document.getElementById('prev-slide-btn');
const nextBtn = document.getElementById('next-slide-btn');

let currentSlide = 0;
const slideCount = slides.length;
let slideInterval;

function goToSlide(index) {
    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.remove('opacity-0', 'z-0');
            slide.classList.add('opacity-100', 'z-10');
        } else {
            slide.classList.remove('opacity-100', 'z-10');
            slide.classList.add('opacity-0', 'z-0');
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.remove('opacity-40');
            dot.classList.add('opacity-100');
        } else {
            dot.classList.remove('opacity-100');
            dot.classList.add('opacity-40');
        }
    });

    currentSlide = index;
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % slideCount;
    goToSlide(nextIndex);
}

function prevSlide() {
    const prevIndex = (currentSlide - 1 + slideCount) % slideCount;
    goToSlide(prevIndex);
}

// Auto-slide every 3000ms (3 seconds)
function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 3000);
}

function stopAutoSlide() {
    clearInterval(slideInterval);
}

// Event Listeners for Manual Control
nextBtn.addEventListener('click', () => {
    stopAutoSlide();
    nextSlide();
    startAutoSlide();
});

prevBtn.addEventListener('click', () => {
    stopAutoSlide();
    prevSlide();
    startAutoSlide();
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        stopAutoSlide();
        goToSlide(index);
        startAutoSlide();
    });
});

// Start timer on load
startAutoSlide();