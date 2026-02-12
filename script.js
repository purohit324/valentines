const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = 'START';
let score = 0;
const WIN_SCORE = 15;
let player;
let hearts = [];
let particles = [];
let animationId;
let loveMeter = document.getElementById('love-fill');

// DOM Elements
const startScreen = document.getElementById('start-screen');
const proposalScreen = document.getElementById('proposal-screen');
const noScreen = document.getElementById('noScreen');
const celebrationScreen = document.getElementById('celebration-screen');
const cardScreen = document.getElementById('card-screen');
const galleryScreen = document.getElementById('gallery-screen');
const startBtn = document.getElementById('start-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const nextBtn = document.getElementById('next-btn');
const backToCelebrationBtn = document.getElementById('back-to-celebration');
const toGalleryBtn = document.getElementById('to-gallery');
const backToCardBtn = document.getElementById('back-to-card');
const backFromGalleryBtn = document.getElementById('back-from-gallery');
const galleryGrid = document.getElementById('gallery-grid');
const romanticMusic = document.getElementById('romantic-music');
const photoModal = document.getElementById('photo-modal');
const modalPhoto = document.getElementById('modal-photo');
const closePhotoBtn = document.getElementById('close-photo-btn');

// Photo Gallery Setup
const galleryPhotos = ['2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg'];

// Resize Handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (player) {
         player.y = canvas.height - 100;
    }
}
window.addEventListener('resize', resize);

// Player Object
class Player {
    constructor() {
        this.w = 100;
        this.h = 80;
        this.x = canvas.width / 2 - this.w / 2;
        this.y = canvas.height - 100;
        this.speed = 10;
        this.dx = 0;
    }

    draw() {
        ctx.fillStyle = '#ff4d6d';
        
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y, this.w/2, 0, Math.PI, false);
        ctx.fill();
        
        ctx.beginPath();
        ctx.strokeStyle = '#c9184a';
        ctx.lineWidth = 5;
        ctx.arc(this.x + this.w/2, this.y - 10, this.w/2, Math.PI, 0, false);
        ctx.stroke();
    }

    update() {
        this.x += this.dx;
        
        if (this.x < 0) this.x = 0;
        if (this.x + this.w > canvas.width) this.x = canvas.width - this.w;
    }
}

// Heart Object
class Heart {
    constructor() {
        this.size = Math.random() * 20 + 20;
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -this.size;
        this.speed = Math.random() * 3 + 2;
        this.color = `hsl(${Math.random() * 20 + 340}, 100%, 60%)`;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        let topCurveHeight = this.size * 0.3;
        ctx.moveTo(this.x, this.y + topCurveHeight);
        ctx.bezierCurveTo(
            this.x, this.y, 
            this.x - this.size / 2, this.y, 
            this.x - this.size / 2, this.y + topCurveHeight
        );
        ctx.bezierCurveTo(
            this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x, this.y + (this.size + topCurveHeight) / 2, 
            this.x, this.y + this.size
        );
        ctx.bezierCurveTo(
            this.x, this.y + (this.size + topCurveHeight) / 2, 
            this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2, 
            this.x + this.size / 2, this.y + topCurveHeight
        );
        ctx.bezierCurveTo(
            this.x + this.size / 2, this.y, 
            this.x, this.y, 
            this.x, this.y + topCurveHeight
        );
        ctx.fill();
    }

    update() {
        this.y += this.speed;
    }
}

// Particle Effect
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = 100;
        this.color = `rgba(255, 255, 255, 0.8)`;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 2;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 100;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Input Handling
function handleInput(e) {
    if (!player) return;
    
    if (e.type === 'mousemove' || e.type === 'touchmove') {
        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        player.x = clientX - player.w / 2;
    }
}

window.addEventListener('mousemove', handleInput);
window.addEventListener('touchmove', handleInput, { passive: false });

// Game Functions
function spawnHeart() {
    if (Math.random() < 0.02) {
        hearts.push(new Heart());
    }
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING') {
        player.update();
        player.draw();

        spawnHeart();

        hearts.forEach((heart, index) => {
            heart.update();
            heart.draw();

            if (
                heart.y + heart.size > player.y &&
                heart.x > player.x &&
                heart.x < player.x + player.w
            ) {
                hearts.splice(index, 1);
                score++;
                createParticles(heart.x, heart.y);
                updateScore();
                
                if (score >= WIN_SCORE) {
                    triggerProposal();
                }
            } else if (heart.y > canvas.height) {
                hearts.splice(index, 1);
            }
        });

        particles.forEach((p, idx) => {
            p.update();
            p.draw();
            if (p.life <= 0) particles.splice(idx, 1);
        });
    }

    animationId = requestAnimationFrame(updateGame);
}

function createParticles(x, y) {
    for(let i=0; i<5; i++) {
        particles.push(new Particle(x, y));
    }
}

function updateScore() {
    const percentage = (score / WIN_SCORE) * 100;
    loveMeter.style.width = `${percentage}%`;
}

function triggerProposal() {
    gameState = 'PROPOSAL';
    setTimeout(() => {
        proposalScreen.classList.remove('hidden');
        proposalScreen.classList.add('active');
    }, 500);
}

function startGame() {
    resize();
    player = new Player();
    hearts = [];
    score = 0;
    updateScore();
    gameState = 'PLAYING';
    
    startScreen.classList.remove('active');
    startScreen.classList.add('hidden');
    
    updateGame();
    playMusic();
}

// Photo Gallery Functions
function loadGallery() {
    galleryGrid.innerHTML = '';
    galleryPhotos.forEach((name, index) => {
        const img = document.createElement('img');
        img.src = `photos/${name}`;
        img.alt = `Memory Photo ${index + 1}`;
        img.className = 'gallery-photo';
        img.addEventListener('click', () => openPhotoModal(name));
        galleryGrid.appendChild(img);
    });

    // After all photos appear, assemble them into grid
    const totalDelay = 3300 + 1000;
    setTimeout(() => {
        galleryGrid.classList.add('photos-assembled');
    }, totalDelay);
}

// Photo Modal Functions
function openPhotoModal(photoName) {
    modalPhoto.src = `photos/${photoName}`;
    photoModal.classList.add('active');
}

function closePhotoModal() {
    photoModal.classList.remove('active');
}

function playMusic() {
    romanticMusic.volume = 0.3;
    romanticMusic.play().catch(e => console.log('Music autoplay blocked; user interaction needed'));
}

function pauseMusic() {
    romanticMusic.pause();
}

// Events
startBtn.onclick = startGame;

yesBtn.onclick = () => {
    proposalScreen.classList.remove('active');
    proposalScreen.classList.add('hidden');
    celebrationScreen.classList.remove('hidden');
    celebrationScreen.classList.add('active');
    document.getElementById('ui-layer').classList.add('hidden');
};

noBtn.onclick = () => {
    proposalScreen.classList.remove('active');
    proposalScreen.classList.add('hidden');
    noScreen.classList.remove('hidden');
    noScreen.classList.add('active');
};

window.goBack = () => {
    noScreen.classList.remove('active');
    noScreen.classList.add('hidden');
    proposalScreen.classList.remove('hidden');
    proposalScreen.classList.add('active');
};

nextBtn.onclick = () => {
    celebrationScreen.classList.remove('active');
    celebrationScreen.classList.add('hidden');
    cardScreen.classList.remove('hidden');
    cardScreen.classList.add('active');
};

backToCelebrationBtn.onclick = () => {
    cardScreen.classList.remove('active');
    cardScreen.classList.add('hidden');
    celebrationScreen.classList.remove('hidden');
    celebrationScreen.classList.add('active');
};

toGalleryBtn.onclick = () => {
    cardScreen.classList.remove('active');
    cardScreen.classList.add('hidden');
    galleryScreen.classList.remove('hidden');
    galleryScreen.classList.add('active');
    loadGallery();
};

backFromGalleryBtn.onclick = () => {
    galleryScreen.classList.remove('active');
    galleryScreen.classList.add('hidden');
    cardScreen.classList.remove('hidden');
    cardScreen.classList.add('active');
};

/* ✅ FIXED CLOSE PHOTO BUTTON LOGIC */
closePhotoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePhotoModal();
});

photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) closePhotoModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoModal.classList.contains('active')) {
        closePhotoModal();
    }
});

window.addEventListener('beforeunload', pauseMusic);

// Init
resize();