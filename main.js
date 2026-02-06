import { stations } from './stations.js';
import { preloadSounds, playRandomDialSound } from './audioHelpers.js';

const categorySelector = document.getElementById('category-selector');
const stationGrid = document.getElementById('station-grid');
const audioPlayer = document.getElementById('audio-player');
const playerStatusEl = document.getElementById('player-status');
const stationNameEl = document.getElementById('station-name');

let playbackHistory = [];
let currentStationBtn = null;
let hls = null;
let metadataInterval = null;
let lastTrackInfo = '';
const categories = ['noticias', 'musica', 'generales', 'libre', 'onda5'];

function getNextCategory(currentCat) {
    const currentIndex = categories.indexOf(currentCat);
    const nextIndex = (currentIndex + 1) % categories.length;
    return categories[nextIndex];
}

function getPreviousCategory(currentCat) {
    const currentIndex = categories.indexOf(currentCat);
    const prevIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1;
    return categories[prevIndex];
}

function playNextStation() {
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    const allStations = [];
    Object.keys(stations).forEach(category => {
        stations[category].forEach(station => {
            allStations.push({...station, category});
        });
    });
    const shuffledStations = allStations.sort(() => Math.random() - 0.5);
    const currentStation = currentStationBtn ? {
        name: currentStationBtn.dataset.name,
        url: currentStationBtn.dataset.url,
        category: currentStationBtn.dataset.category
    } : null;
    let nextIndex = 0;
    if (currentStation) {
        const currentIndex = shuffledStations.findIndex(s => 
            s.name === currentStation.name && s.url === currentStation.url
        );
        nextIndex = (currentIndex + 1) % shuffledStations.length;
    }
    const nextStation = shuffledStations[nextIndex];
    document.querySelector('.category-btn.active').classList.remove('active');
    document.querySelector(`[data-category="${nextStation.category}"]`).classList.add('active');
    renderStations(nextStation.category);
    setTimeout(() => {
        const stationBtn = Array.from(document.querySelectorAll('.station-btn'))
            .find(btn => btn.dataset.name === nextStation.name);
        if (stationBtn) {
            playStation(stationBtn);
        }
    }, 50);
}

function playPreviousStation() {
    if (playbackHistory.length === 0) return;
    const prevStation = playbackHistory.pop();
    document.querySelector('.category-btn.active').classList.remove('active');
    document.querySelector(`[data-category="${prevStation.category}"]`).classList.add('active');
    renderStations(prevStation.category);
    setTimeout(() => {
        const stationBtn = Array.from(document.querySelectorAll('.station-btn'))
            .find(btn => btn.dataset.name === prevStation.name);
        if (stationBtn) {
            playStation(stationBtn, false);
        }
    }, 50);
}

document.getElementById('next-station').addEventListener('click', playNextStation);
document.getElementById('prev-station').addEventListener('click', playPreviousStation);

function renderStations(category) {
    stationGrid.innerHTML = '';
    stations[category].forEach(station => {
        const button = document.createElement('button');
        button.className = 'station-btn';
        button.textContent = station.name;
        button.dataset.url = station.url;
        button.dataset.name = station.name;
        button.dataset.category = category;
        stationGrid.appendChild(button);
    });
}

function updateRDSMetadata() {
    if (!audioPlayer.src || audioPlayer.paused) return;
    const url = audioPlayer.src;
    if (url.includes('icecast') || url.includes('shoutcast') || url.includes('.mp3') || url.includes('.aac')) {
        const metadataUrl = url.replace(/\/[^/]*$/, '/status-json.xsl');
        fetch(metadataUrl)
            .then(response => response.json())
            .then(data => {
                if (data && data.icestats && data.icestats.source) {
                    const source = Array.isArray(data.icestats.source) ? data.icestats.source[0] : data.icestats.source;
                    const trackInfo = source.description || source.title || source.songtitle || source.genre || 'En directo';
                    updateTrackInfo(trackInfo);
                }
            })
            .catch(() => {
                updateTrackInfo('En directo');
            });
    } else if (url.includes('.m3u8')) {
        const currentStation = stations[currentStationBtn.dataset.category]?.find(s => s.url === url);
        const trackInfo = currentStation?.description || 'En directo';
        updateTrackInfo(trackInfo);
    } else {
        updateTrackInfo('En directo');
    }
}

function updateTrackInfo(info) {
    if (info && info !== lastTrackInfo) {
        lastTrackInfo = info;
        playerStatusEl.textContent = info;
        playerStatusEl.classList.add('rds-update');
        setTimeout(() => playerStatusEl.classList.remove('rds-update'), 1000);
    }
}

function startRDSUpdates() {
    if (metadataInterval) clearInterval(metadataInterval);
    metadataInterval = setInterval(updateRDSMetadata, 5000);
}

function stopRDSUpdates() {
    if (metadataInterval) {
        clearInterval(metadataInterval);
        metadataInterval = null;
    }
}

function playStation(button, addToHistory = true) {
    const url = button.dataset.url;
    const name = button.dataset.name;
    if (currentStationBtn === button && !audioPlayer.paused) {
        audioPlayer.pause();
        playerStatusEl.textContent = 'Selecciona una emisora';
        stationNameEl.textContent = '';
        button.classList.remove('playing');
        currentStationBtn = null;
        stopRDSUpdates();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
        return;
    }

    // play dial sound
    playRandomDialSound();

    if (!window.stationChangeCount) window.stationChangeCount = 0;
    if (currentStationBtn && currentStationBtn !== button) {
        window.stationChangeCount++;
    } else if (!currentStationBtn) {
        window.stationChangeCount++;
    }

    const donationLink = document.getElementById('donation-link');
    if (window.stationChangeCount >= 4 && donationLink && !donationLink.classList.contains('donate-bounce')) {
        donationLink.classList.add('donate-bounce');
        const label = donationLink.querySelector('.donation-label');
        if (label) label.style.opacity = '1';
        setTimeout(() => {
            donationLink.classList.remove('donate-bounce');
            if (label) label.style.opacity = '';
            window.stationChangeCount = 0;
        }, 3000);
    }

    if (currentStationBtn) {
        if (addToHistory && currentStationBtn !== button) {
            playbackHistory.push({
                name: currentStationBtn.dataset.name,
                url: currentStationBtn.dataset.url,
                category: currentStationBtn.dataset.category
            });
        }
        currentStationBtn.classList.remove('playing');
    }

    if (hls) {
        hls.destroy();
        hls = null;
    }

    stopRDSUpdates();

    playerStatusEl.textContent = "Conectando...";
    stationNameEl.textContent = name.toUpperCase();
    lastTrackInfo = '';

    audioPlayer.addEventListener('loadedmetadata', () => {
        playerStatusEl.textContent = "En directo";
        startRDSUpdates();
    });

    audioPlayer.addEventListener('loadstart', () => {
        playerStatusEl.textContent = "Conectando...";
    });

    audioPlayer.addEventListener('play', () => {
        startRDSUpdates();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
    });

    audioPlayer.addEventListener('pause', () => {
        stopRDSUpdates();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    });

    if (url.includes('.m3u8')) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(audioPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                audioPlayer.play();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                 if (data.fatal) {
                    console.error('Error fatal de HLS:', data);
                    playerStatusEl.textContent = 'Error';
                    stationNameEl.textContent = 'STREAM NO DISPONIBLE';
                 }
            });
        } else if (audioPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            audioPlayer.src = url;
            audioPlayer.play();
        } else {
            console.error("HLS no es soportado en este navegador.");
            playerStatusEl.textContent = 'Error';
            stationNameEl.textContent = 'FORMATO NO SOPORTADO';
            return;
        }
    } else {
        audioPlayer.src = url;
        audioPlayer.play().catch(error => {
            console.error("Error al reproducir la radio:", error);
            playerStatusEl.textContent = 'Error';
            stationNameEl.textContent = 'NO SE PUEDE REPRODUCIR';
        });
    }
    
    button.classList.add('playing');
    currentStationBtn = button;

    if ('mediaSession' in navigator) {
        const activeCategoryButton = document.querySelector('.category-btn.active');
        const categoryName = activeCategoryButton ? activeCategoryButton.textContent : 'Radio';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: name,
            artist: 'Radios Libres',
            album: categoryName,
        });
    }
}

categorySelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        document.querySelector('.category-btn.active').classList.remove('active');
        e.target.classList.add('active');
        const category = e.target.dataset.category;
        renderStations(category);
    }
});

stationGrid.addEventListener('click', (e) => {
    const button = e.target.closest('.station-btn');
    if (button) {
        preloadSounds(); // Preload sounds on first interaction
        playStation(button);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    renderStations('noticias');

    const donationLink = document.getElementById('donation-link');
    if (donationLink && !donationLink.querySelector('.donation-label')) {
        const span = document.createElement('span');
        span.className = 'donation-label';
        span.textContent = 'donar un café';
        donationLink.appendChild(span);
    }

    if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            playPreviousStation();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            playNextStation();
        });
        navigator.mediaSession.setActionHandler('play', () => {
            if (audioPlayer.paused && currentStationBtn) {
                audioPlayer.play();
            }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (!audioPlayer.paused) {
                audioPlayer.pause();
            }
        });
    }
});