// player.js
// Player State Management
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekSlider = document.getElementById('seekSlider');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const playerTrackImage = document.getElementById('playerTrackImage');
const playerTrackTitle = document.getElementById('playerTrackTitle');
const playerTrackArtist = document.getElementById('playerTrackArtist');
const recentlyPlayedList = document.getElementById('recentlyPlayedList');

// Initialize Player
function initializePlayer() {
    const statusElement = document.querySelector('.status');
    if (statusElement) {
        isPremium = statusElement.classList.contains('premium');
    } else {
        console.warn('Premium status element not found');
        isPremium = false;
    }

    if (volumeSlider) {
        audioPlayer.volume = volumeSlider.value / 100;
    }

    // Initialize tracks from page
    const trackCards = document.querySelectorAll('.track-card');
    if (trackCards.length > 0) {
        tracks = Array.from(trackCards).map((card, index) => {
            return {
                index: index,
                songId: card.getAttribute('data-song-id'),
                title: card.querySelector('.card-title').textContent,
                artist: card.querySelector('.card-text').textContent,
                imageUrl: card.querySelector('img').src,
                previewUrl: card.getAttribute('data-preview-url')
            };
        });
    } else {
        console.log('No track cards found on page load');
        tracks = [];
    }
}

// Play Recently Played
function playRecentlyPlayed(songId, title, artist, imageUrl, previewUrl) {
    let trackIndex = tracks.findIndex(t => t.songId == songId);
    if (trackIndex === -1) {
        const newTrack = {
            index: tracks.length,
            songId: songId,
            title: title,
            artist: artist,
            imageUrl: imageUrl,
            previewUrl: previewUrl
        };
        tracks.push(newTrack);
        trackIndex = tracks.length - 1;
    }
    playSongByIndex(trackIndex);
}

// Play Song
function playSong(cardElement, index, title, artist, songId, imageUrl, previewUrl) {
    let trackIndex = tracks.findIndex(t => t.songId === songId);
    if (trackIndex === -1) {
        const newTrack = {
            index: tracks.length,
            songId: songId,
            title: title,
            artist: artist,
            imageUrl: imageUrl,
            previewUrl: previewUrl
        };
        tracks.push(newTrack);
        trackIndex = tracks.length - 1;
    }
    playSongByIndex(trackIndex);
}

// Play Song by Index
function playSongByIndex(index) {
    if (index < 0 || index >= tracks.length) return;

    currentTrackIndex = index;
    const track = tracks[index];
    nextTrackIndex = (index + 1) % tracks.length;

    updatePlayerUI(track);
    audioPlayer.src = track.previewUrl;

    audioPlayer.addEventListener('canplaythrough', () => {
        playAudio();
        addToRecentlyPlayed(track);
        addToRecentlyPlayedToDatabase(track);
    }, { once: true });
}

// Update Player UI
function updatePlayerUI(track) {
    playerTrackImage.src = track.imageUrl;
    playerTrackTitle.textContent = track.title;
    playerTrackArtist.textContent = track.artist;
    seekSlider.value = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
}

// Play Audio
async function playAudio() {
    if (currentTrackIndex === -1) return;

    try {
        await audioPlayer.play();
        playPauseIcon.classList.remove('fa-play');
        playPauseIcon.classList.add('fa-pause');
        isPlaying = true;
    } catch (error) {
        console.error("Playback failed:", error);
        pauseAudio();
    }
}

// Pause Audio
function pauseAudio() {
    audioPlayer.pause();
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
    isPlaying = false;
}

// Toggle Play/Pause
function togglePlayPause() {
    if (currentTrackIndex === -1) return;
    isPlaying ? pauseAudio() : playAudio();
}

// Next Song
function nextSong() {
    if (tracks.length === 0) return;
    playSongByIndex((currentTrackIndex + 1) % tracks.length);
}

// Previous Song
function previousSong() {
    if (tracks.length === 0) return;
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = tracks.length - 1;
    playSongByIndex(prevIndex);
}

// Update Progress
function updateProgress() {
    if (audioPlayer.duration) {
        seekSlider.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        durationEl.textContent = formatTime(audioPlayer.duration);
    }
}

// Seek To
function seekTo() {
    if (isNaN(audioPlayer.duration)) return;
    audioPlayer.currentTime = (seekSlider.value / 100) * audioPlayer.duration;
}

// Set Volume
function setVolume() {
    audioPlayer.volume = volumeSlider.value / 100;
}

// Add to Recently Played UI
function addToRecentlyPlayed(track) {
    const existingItem = Array.from(recentlyPlayedList.children)
        .find(item => item.getAttribute('data-song-id') === track.songId);

    if (existingItem) {
        recentlyPlayedList.removeChild(existingItem);
    }

    const li = document.createElement('li');
    li.setAttribute('data-song-id', track.songId);
    li.innerHTML = `
        <img src="${track.imageUrl}" class="recent-track-icon" alt="${track.title}">
        <div class="recent-track-info">
            <span class="recent-track-title">${track.title}</span>
            <span class="recent-track-artist">${track.artist}</span>
        </div>
        <i class="fas fa-play recent-track-play"></i>
    `;

    li.onclick = () => playRecentlyPlayed(track.songId, track.title, track.artist, track.imageUrl, track.previewUrl);

    recentlyPlayedList.insertBefore(li, recentlyPlayedList.firstChild);

    // Keep only 10 items
    while (recentlyPlayedList.children.length > 10) {
        recentlyPlayedList.removeChild(recentlyPlayedList.lastChild);
    }
}

// Add to Recently Played Database
async function addToRecentlyPlayedToDatabase(track) {
    const songData = {
        songId: track.songId,
        title: track.title,
        artist: track.artist,
        imageUrl: track.imageUrl,
        previewUrl: track.previewUrl
    };

    try {
        const response = await fetch('/listener/setRecentlyPlayed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(songData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error adding to recently played:', error);
    }
}

// Audio Player Event Listeners
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', () => {
    nextSong();
});
audioPlayer.addEventListener('error', function(e) {
    console.error("Audio player error:", e);
    Swal.fire({
        icon: 'error',
        title: 'Playback Error',
        text: 'Unable to play this track. Trying next song...',
        timer: 2000,
        showConfirmButton: false
    });
    setTimeout(() => nextSong(), 2000);
});

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT') return;

    switch(e.key) {
        case ' ':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowRight':
            nextSong();
            break;
        case 'ArrowLeft':
            previousSong();
            break;
        case 'ArrowUp':
            volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
            setVolume();
            break;
        case 'ArrowDown':
            volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
            setVolume();
            break;
    }
});