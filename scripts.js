const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
const upload = document.getElementById('upload');
const zoomInput = document.getElementById('zoom');
const zoomPercent = document.getElementById('zoomPercent');
const posXInput = document.getElementById('posX');
const posYInput = document.getElementById('posY');
const downloadBtn = document.getElementById('downloadBtn');
const placeholder = document.getElementById('placeholder-text');
const controlsPanel = document.getElementById('controls-panel');
const customAlert = document.getElementById('custom-alert');
const frameSelector = document.getElementById('frame-selector');

canvas.width = 2048;
canvas.height = 2048;

// Frame images
const FRAME1_URL = 'assets/i-am-awami-league-2.png';
const FRAME2_URL = 'assets/i-am-awami-league.png';

let userImg = new Image();
let frame1 = new Image();
let frame2 = new Image();

let isUserImageLoaded = false;
let isFrame1Loaded = false;
let isFrame2Loaded = false;
let baseFitScale = 1;
let selectedFrame = 'frame1';

let isDragging = false;
let startX, startY;

// Load frame 1
frame1.crossOrigin = "anonymous";
frame1.onload = () => { isFrame1Loaded = true; drawCanvas(); };
frame1.src = FRAME1_URL;

// Load frame 2
frame2.crossOrigin = "anonymous";
frame2.onload = () => { isFrame2Loaded = true; drawCanvas(); };
frame2.src = FRAME2_URL;

// Bengali number conversion
const toBengaliNumber = (num) => {
    const bengaliDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return num.toString().replace(/\d/g, d => bengaliDigits[d]);
};

// Copy hashtag
function copyHashtag() {
    navigator.clipboard.writeText('#আমিই_আওয়ামীলীগ').then(() => {
        const n = document.createElement('div');
        n.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            কপি হয়েছে!
        `;
        n.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:8px 12px;border-radius:8px;z-index:9999;display:flex;align-items:center;';
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 1500);
    });
}

// Adjust input values
window.adjust = (id, amount) => {
    const el = document.getElementById(id);
    const newVal = parseFloat(el.value) + amount;
    if (newVal >= el.min && newVal <= el.max) {
        el.value = newVal;
        drawCanvas();
    }
};

// Dragging functions
const startDrag = (e) => {
    if (!isUserImageLoaded) return;
    isDragging = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;
};

const moveDrag = (e) => {
    if (!isDragging) return;
    const pos = getPos(e);
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;

    const dx = (pos.x - startX) * scale;
    const dy = (pos.y - startY) * scale;

    posXInput.value = parseFloat(posXInput.value) + dx;
    posYInput.value = parseFloat(posYInput.value) + dy;

    startX = pos.x;
    startY = pos.y;
    drawCanvas();
};

const stopDrag = () => { isDragging = false; };

const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
};

// Event listeners for dragging
container.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', moveDrag);
window.addEventListener('mouseup', stopDrag);

container.addEventListener('touchstart', startDrag);
window.addEventListener('touchmove', moveDrag);
window.addEventListener('touchend', stopDrag);

// Upload image
upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        userImg.onload = () => {
            isUserImageLoaded = true;
            controlsPanel.classList.remove('hidden-controls');
            downloadBtn.classList.remove('hidden-controls');
            downloadBtn.classList.add('flex');
            placeholder.classList.add('hidden');
            frameSelector.classList.remove('hidden-controls');

            const scaleX = canvas.width / userImg.width;
            const scaleY = canvas.height / userImg.height;
            baseFitScale = Math.max(scaleX, scaleY);

            zoomInput.value = 0.90;
            posXInput.value = 0;
            posYInput.value = 0;

            drawCanvas();
        };
        userImg.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Frame selection
function selectFrame(frame) {
    selectedFrame = frame;
    drawCanvas();
}

// Draw canvas
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const userZoom = parseFloat(zoomInput.value);
    zoomPercent.innerText = toBengaliNumber(Math.round(userZoom * 100)) + '%';

    if (isUserImageLoaded && userImg.complete) {
        const finalScale = baseFitScale * userZoom;
        const x = parseFloat(posXInput.value) + (canvas.width / 2);
        const y = parseFloat(posYInput.value) + (canvas.height / 2);
        const imgWidth = userImg.width * finalScale;
        const imgHeight = userImg.height * finalScale;

        ctx.drawImage(userImg, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
    }

    if (selectedFrame === 'frame1' && isFrame1Loaded) {
        ctx.drawImage(frame1, 0, 0, canvas.width, canvas.height);
    } else if (selectedFrame === 'frame2' && isFrame2Loaded) {
        ctx.drawImage(frame2, 0, 0, canvas.width, canvas.height);
    }
}

// Update canvas when inputs change
[zoomInput, posXInput, posYInput].forEach(input => {
    input.addEventListener('input', drawCanvas);
});

// Download button
downloadBtn.addEventListener('click', () => {
    try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'IAmAwamiLeague_' + Date.now() + '.jpg';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            });
    } catch (err) {
        customAlert.style.display = 'flex';
    }
});

// Facebook browser warning
window.addEventListener('DOMContentLoaded', () => {
    if (/FBAN|FBAV/i.test(navigator.userAgent)) {
        customAlert.style.display = 'flex';
    }
});