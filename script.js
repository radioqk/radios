const stations = {
    noticias: [
        { name: "Radio Klara (València 104.4FM)", url: "https://cervera.eldialdigital.com:21111/stream" },
        { name: "Radio QK (Uviéu 107.2FM)", url: "https://icecast.radioqk.org:8443/radioqk_master.mp3" },
        { name: "Radio Vallekas (107.5FM)", url: "https://radio.radiobot.org/listen/rvk/rvk.mp3" },
        { name: "Radio Kras (Xixón 105.0FM)", url: "https://icecast.radioqk.org:8443/radiokras_master.mp3" },
        { name: "Color Comunitaria (Málaga 107.3FM)", url: "https://cervera.eldialdigital.com:21201/stream" },
        { name: "Cuac FM (A Coruña 103.4FM)", url: "https://streaming.cuacfm.org/cuacfm-128k.mp3" },
        { name: "Radio Guiniguada (Las Palmas de Gran Canaria 89.4FM)", url: "https://streamtotal.net/proxy/guiniguada/;" },
        { name: "Radio Espiritrompa (Alto Aragón 102.2FM)", url: "https://radiobot.radioslibres.info/listen/radio_espiritrompa/radio.mp3" },
    ],
    musica: [
        { name: "Almenara Radio (Madrid 106.7FM)", url: "https://cervera.eldialdigital.com:25211/stream" },
        { name: "Radio Argayo (Radio Libre en Cantabria)", url: "https://radiobot.radioslibres.info/radio/8030/radio.ogg?_=1" },
        { name: "Radio La Granja (Zaragoza 102.1FM)", url: "https://radiobot.radioslibres.info/listen/radio_la_granja/rlg.mp3" },
        { name: "Eco Leganés (Madrid)", url: "https://cervera.eldialdigital.com:25191/stream" },
        { name: "Onda Polígono (Toledo 107.3FM)", url: "https://icecast.ondapoligono.org/stream" },
        { name: "OMC Onda Merlín Comunitaria (Villaverde-Madrid 107.3FM)", url: "https://radio.radiobot.org/listen/omc/directo.mp3" },
        { name: "Radio Enlace (Hortaleza-Madrid 107.5FM)", url: "https://cervera.eldialdigital.com:25121/stream" },
        { name: "Radio Iris 7 (Aranda de Duero 100.0FM)", url: "https://sonic.sistemahost.es/8244/stream" },
    ],
    generales: [
        { name: "Siberia FM (Vitoria-Gasteiz 91.8FM)", url: "https://stream.euskonet.eus/siberia?1762901374198" },
        { name: "Radio Xata (Pinto-Madrid)", url: "https://radio.radiobot.org/listen/xata/radio.mp3" },
        { name: "Radiópolis (Sevilla 92.3FM)", url: "https://radio.andaina.net/8038/stream" },
        { name: "RTVC  Ràdio Televisió Cardedeu (Barcelona 90.7FM)", url: "https://azuracast.rtvc.cat/radio/8000/radio.mp3" },
        { name: "Radio Oasis (Salamanca 105.9FM)", url: "https://cervera.eldialdigital.com:21141/stream" },
        { name: "Radio Utopía (Madrid norte 107.8FM)", url: "http://streaming.radioutopia.es:8000/radio-utopia.mp3" },
        { name: "Onda Latina (La Latina-Madrid 87.6FM)", url: "https://cervera.eldialdigital.com:21131/stream" },
        { name: "Irola Irratia (Bilbo 107.5FM)", url: "https://s.streampunk.cc/_stream/irola_irratia.mp3" },
    ],
    libre: [
        { name: "Eguzki Irratia (Iruñea 107.0FM eta Iruñerrian 91.0FM) no suena", url: "" },
        { name: "Radio Piratona (Vigo 106.1FM)", url: "https://zeppelin.streampunk.cc/_stream/radiopiratona.ogg" },
        { name: "Radio Topo (Zaragoza 101.8FM)", url: "https://radiobot.radioslibres.info/listen/radio_topo/radio96.mp3" },
        { name: "Radio Sintonía (Puente Genil-Córdoba 106.9FM)", url: "https://eu5.fastcast4u.com/proxy/sintoniapg?mp=/;" },
        { name: "Ágora Sol Radio (Madrid)", url: "https://cervera.eldialdigital.com:23141/stream" },
        { name: "Ràdio Malva (La Malvarrosa-València 104.9FM)", url: "http://radiomalva.ddns.net:8000/rmbc.mp3" },
        { name: "Contrabanda FM (Barcelona 91.4FM)", url: "http://www.contrabanda.org:8000/contrabanda" },
        { name: "Radio Almaina (Granada 88.5 FM)", url: "https://radiobot.radioslibres.info/listen/radio_almaina/radio.mp3" },
    ],
    onda5: [
        { name: "Radio Jabato (Coslada-Madrid 103.8FM)", url: "http://giss.tv:8000/radiojabato.mp3" },
        { name: "Radio Kolor (Cuenca 106.2FM)", url: "http://stream20.usastreams.com:8122/stream" },
        { name: "Emisora Comunitaria de Leganés", url: "https://cervera.eldialdigital.com:25191/stream" },
        { name: "Paradigma Radio (Córdoba 90.2FM)", url: "https://radio.andaina.net/8042/stream" },
        { name: "Radio Pimienta (Tenerife)", url: "https://cervera.eldialdigital.com:21182/stream" },
        { name: "", url: "" },
        { name: "", url: "" },
        { name: "", url: "" },
    ],
};

const categorySelector = document.getElementById('category-selector');
const stationGrid = document.getElementById('station-grid');
const audioPlayer = document.getElementById('audio-player');
const playerStatusEl = document.getElementById('player-status');
const stationNameEl = document.getElementById('station-name');

let audioContext = null;
const dialSounds = [
    'dial_sound_1.mp3',
    'dial_sound_2.mp3',
    'dial_sound_3.mp3',
    'dial_sound_4.mp3',
    'dial_sound_5.mp3',
    'dial_sound_6.mp3',
    'dial_sound_7.mp3',
    'dial_sound_8.mp3',
    'dial_sound_9.mp3'
];
const soundBuffers = {};

async function loadSound(url) {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
            return;
        }
    }
    if (soundBuffers[url]) {
        return soundBuffers[url];
    }
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        soundBuffers[url] = audioBuffer;
        return audioBuffer;
    } catch (error) {
        console.error(`Error loading sound: ${url}`, error);
    }
}

function playSound(buffer) {
    if (!audioContext || !buffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

async function playRandomDialSound() {
    const randomSoundUrl = dialSounds[Math.floor(Math.random() * dialSounds.length)];
    const buffer = await loadSound(randomSoundUrl);
    playSound(buffer);
}

let soundsPreloaded = false;
function preloadSounds() {
    if (soundsPreloaded) return;
    dialSounds.forEach(loadSound);
    soundsPreloaded = true;
}

let currentStationBtn = null;
let hls = null;
let metadataInterval = null;
let lastTrackInfo = '';
let currentCategoryIndex = 0;
let currentStationIndex = 0;
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
    
    // Collect all stations from all categories
    Object.keys(stations).forEach(category => {
        stations[category].forEach(station => {
            allStations.push({...station, category});
        });
    });
    
    // Shuffle array for random order
    const shuffledStations = allStations.sort(() => Math.random() - 0.5);
    
    // Find current station index
    const currentStation = currentStationBtn ? {
        name: currentStationBtn.dataset.name,
        url: currentStationBtn.dataset.url,
        category: activeCategory
    } : null;
    
    let nextIndex = 0;
    if (currentStation) {
        const currentIndex = shuffledStations.findIndex(s => 
            s.name === currentStation.name && s.url === currentStation.url
        );
        nextIndex = (currentIndex + 1) % shuffledStations.length;
    }
    
    const nextStation = shuffledStations[nextIndex];
    
    // Switch to the category of the next station
    document.querySelector('.category-btn.active').classList.remove('active');
    document.querySelector(`[data-category="${nextStation.category}"]`).classList.add('active');
    
    renderStations(nextStation.category);
    
    // Find and play the station
    setTimeout(() => {
        const stationBtn = Array.from(document.querySelectorAll('.station-btn'))
            .find(btn => btn.dataset.name === nextStation.name);
        if (stationBtn) {
            playStation(stationBtn);
        }
    }, 50);
}

function playPreviousStation() {
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    const allStations = [];
    
    // Collect all stations from all categories
    Object.keys(stations).forEach(category => {
        stations[category].forEach(station => {
            allStations.push({...station, category});
        });
    });
    
    // Shuffle array for random order
    const shuffledStations = allStations.sort(() => Math.random() - 0.5);
    
    // Find current station index
    const currentStation = currentStationBtn ? {
        name: currentStationBtn.dataset.name
    } : null;
    
    let prevIndex = shuffledStations.length - 1;
    if (currentStation) {
        const currentIndex = shuffledStations.findIndex(s => 
            s.name === currentStation.name && s.url === currentStation.url
        );
        prevIndex = currentIndex === 0 ? shuffledStations.length - 1 : currentIndex - 1;
    }
    
    const prevStation = shuffledStations[prevIndex];
    
    // Switch to the category of the previous station
    document.querySelector('.category-btn.active').classList.remove('active');
    document.querySelector(`[data-category="${prevStation.category}"]`).classList.add('active');
    
    renderStations(prevStation.category);
    
    // Find and play the station
    setTimeout(() => {
        const stationBtn = Array.from(document.querySelectorAll('.station-btn'))
            .find(btn => btn.dataset.name === prevStation.name);
        if (stationBtn) {
            playStation(stationBtn);
        }
    }, 50);
}

// Add event listeners for navigation buttons
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
        stationGrid.appendChild(button);
    });
}

function updateRDSMetadata() {
    if (!audioPlayer.src || audioPlayer.paused) return;
    
    // Try to fetch metadata from various sources
    const url = audioPlayer.src;
    
    // For icecast/shoutcast streams
    if (url.includes('icecast') || url.includes('shoutcast') || url.includes('.mp3') || url.includes('.aac')) {
        // Fetch metadata from icecast/shoutcast
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
                // Fallback to basic metadata
                updateTrackInfo('En directo');
            });
    }
    // For HLS streams
    else if (url.includes('.m3u8')) {
        // HLS metadata is limited, use station name
        const currentStation = stations[currentStationBtn.dataset.category]?.find(s => s.url === url);
        const trackInfo = currentStation?.description || 'En directo';
        updateTrackInfo(trackInfo);
    }
    else {
        // Default fallback
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

function playStation(button) {
    const url = button.dataset.url;
    const name = button.dataset.name;
    
    // If clicking the same station that is already playing, pause it.
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

    // Play dial sound on station change
    playRandomDialSound();

    if (currentStationBtn) {
        currentStationBtn.classList.remove('playing');
    }

    if (hls) {
        hls.destroy();
        hls = null;
    }

    stopRDSUpdates();

    // Reset metadata display
    playerStatusEl.textContent = "Conectando...";
    stationNameEl.textContent = name.toUpperCase();
    lastTrackInfo = '';

    // Handle metadata updates
    audioPlayer.addEventListener('loadedmetadata', () => {
        playerStatusEl.textContent = "En directo";
        startRDSUpdates();
    });

    audioPlayer.addEventListener('loadstart', () => {
        playerStatusEl.textContent = "Conectando...";
    });

    // Handle track changes
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
            // Native HLS support (e.g., Safari)
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

    // Update Media Session API
    if ('mediaSession' in navigator) {
        const activeCategoryButton = document.querySelector('.category-btn.active');
        const categoryName = activeCategoryButton ? activeCategoryButton.textContent : 'Radio';

        navigator.mediaSession.metadata = new MediaMetadata({
            title: name,
            artist: 'Radio FM',
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

// Load initial category
document.addEventListener('DOMContentLoaded', () => {
    renderStations('noticias');

    // Media Session API for media key controls
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