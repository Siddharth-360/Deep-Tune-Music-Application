// PlaylistManager.js - Fixed version
class PlaylistManager {
    constructor() {
        this.currentSong = null;
        this.currentSongId = null;
        this.init();
    }

    init() {
        console.log('🎵 Playlist Manager initialized');
        this.setupEventListeners();
        this.setupPlayerIntegration();
        this.updatePlayerUI();
    }

    setupEventListeners() {
        // Listen for song changes
        document.addEventListener('songChanged', (event) => {
            this.handleSongChange(event.detail);
        });
    }

    // Setup integration with existing player
    setupPlayerIntegration() {
        // Override global play functions to set current song
        this.overrideGlobalPlayFunctions();

        // Monitor player state changes
        this.monitorPlayerState();

        // Check if there's already a song playing
        setTimeout(() => this.checkCurrentlyPlayingSong(), 1000);
    }

    // Override global play functions if they exist
    overrideGlobalPlayFunctions() {
        // Store original functions
        const originalPlaySong = window.playSong;
        const originalPlayRecentlyPlayed = window.playRecentlyPlayed;

        // Override playSong
        if (typeof originalPlaySong === 'function') {
            window.playSong = (element, index, title, artist, songId, imageUrl, previewUrl) => {
                console.log('🎵 playSong called with:', { songId, title, artist });
                const songData = {
                    songId: songId,
                    title: title,
                    artist: artist,
                    imageUrl: imageUrl,
                    previewUrl: previewUrl
                };
                this.handleSongChange(songData);
                return originalPlaySong(element, index, title, artist, songId, imageUrl, previewUrl);
            };
            console.log('✅ playSong function overridden');
        }

        // Override playRecentlyPlayed
        if (typeof originalPlayRecentlyPlayed === 'function') {
            window.playRecentlyPlayed = (songId, title, artist, imageUrl, previewUrl) => {
                console.log('🎵 playRecentlyPlayed called with:', { songId, title, artist });
                const songData = {
                    songId: songId,
                    title: title,
                    artist: artist,
                    imageUrl: imageUrl,
                    previewUrl: previewUrl
                };
                this.handleSongChange(songData);
                return originalPlayRecentlyPlayed(songId, title, artist, imageUrl, previewUrl);
            };
            console.log('✅ playRecentlyPlayed function overridden');
        }
    }

    // Monitor player state changes
    monitorPlayerState() {
        // Monitor audio element for changes
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.addEventListener('play', () => {
                console.log('🎵 Audio player started playing');
                this.extractSongDataFromPlayer();
            });

            audioPlayer.addEventListener('loadeddata', () => {
                console.log('🎵 Audio data loaded');
                this.extractSongDataFromPlayer();
            });
        }

        // Monitor player UI updates
        this.observePlayerUIChanges();
    }

    // Observe changes in player UI
    observePlayerUIChanges() {
        const playerTitle = document.getElementById('playerTrackTitle');
        if (playerTitle) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                        const currentTitle = playerTitle.textContent;
                        if (currentTitle && currentTitle !== 'Select a song') {
                            console.log('🎵 Player title changed:', currentTitle);
                            setTimeout(() => this.extractSongDataFromPlayer(), 100);
                        }
                    }
                });
            });

            observer.observe(playerTitle, {
                characterData: true,
                childList: true,
                subtree: true
            });
        }
    }

    // Extract song data from player DOM
    extractSongDataFromPlayer() {
        const playerTitle = document.getElementById('playerTrackTitle');
        const playerArtist = document.getElementById('playerTrackArtist');
        const playerImage = document.getElementById('playerTrackImage');

        if (playerTitle && playerTitle.textContent && playerTitle.textContent !== 'Select a song') {
            const songData = {
                title: playerTitle.textContent,
                artist: playerArtist ? playerArtist.textContent : 'Unknown Artist',
                imageUrl: playerImage ? playerImage.src : '',
                songId: this.findSongIdFromCurrentPlaying()
            };

            if (songData.title && songData.songId) {
                console.log('🎵 Extracted song data from player:', songData);
                this.handleSongChange(songData);
            }
        }
    }

    // Find songId from currently playing track - FIXED NULL ERROR
    findSongIdFromCurrentPlaying() {
        // Method 1: Check active track cards
        const activeTrackCard = document.querySelector('.track-card.active, .track-card.playing');
        if (activeTrackCard && activeTrackCard.dataset.songId) {
            return activeTrackCard.dataset.songId;
        }

        // Method 2: Check recently played active items - FIXED NULL CHECK
        const activeRecentItem = document.querySelector('.recently-played-list li.active');
        if (activeRecentItem) {
            const onclickContent = activeRecentItem.getAttribute('onclick');
            if (onclickContent) {
                // Try different pattern matching for Thymeleaf syntax
                const patterns = [
                    /playRecentlyPlayed\(\[\[([^']+)\]\]/,
                    /playRecentlyPlayed\(['"]([^'"]+)['"]/,
                    /songId['"]?\s*:\s*['"]([^'"]+)['"]/
                ];

                for (let pattern of patterns) {
                    const match = onclickContent.match(pattern);
                    if (match && match[1]) {
                        return match[1];
                    }
                }
            }
        }

        // Method 3: Match by title in track cards
        const playerTitle = document.getElementById('playerTrackTitle');
        if (playerTitle) {
            const title = playerTitle.textContent;
            const trackCards = document.querySelectorAll('.track-card[data-song-id]');
            for (let card of trackCards) {
                const cardTitle = card.querySelector('.card-title');
                if (cardTitle && cardTitle.textContent === title) {
                    return card.dataset.songId;
                }
            }
        }

        // Method 4: Check audio element data
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer && audioPlayer.dataset.currentSongId) {
            return audioPlayer.dataset.currentSongId;
        }

        console.log('🎵 Could not find songId for current playing track');
        return null;
    }

    // Check if there's already a song playing
    checkCurrentlyPlayingSong() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer && !audioPlayer.paused && audioPlayer.currentTime > 0) {
            console.log('🎵 Audio is already playing, extracting song data...');
            this.extractSongDataFromPlayer();
        }
    }

    // Handle when a new song starts playing
    handleSongChange(songData) {
        if (!songData || !songData.songId) {
            console.warn('❌ Invalid song data received:', songData);
            return;
        }

        this.currentSong = songData;
        this.currentSongId = songData.songId;
        console.log('✅ Current song updated:', {
            id: songData.songId,
            title: songData.title,
            artist: songData.artist
        });

        this.updatePlayerUI();
        this.checkCurrentSongLikeStatus();

        // Mark active track in UI
        this.markActiveTrack(songData.songId);
    }

    // Mark active track in the UI
    markActiveTrack(songId) {
        // Remove active class from all tracks
        document.querySelectorAll('.track-card, .recently-played-list li').forEach(el => {
            el.classList.remove('active', 'playing');
        });

        // Add active class to current track
        const currentTrack = document.querySelector(`[data-song-id="${songId}"]`);
        if (currentTrack) {
            currentTrack.classList.add('active', 'playing');
        }
    }

    // Update player UI with current song
    updatePlayerUI() {
        const likeBtn = document.getElementById('playerLikeBtn');
        const addToPlaylistBtn = document.getElementById('addToPlaylistBtn');

        if (this.currentSong) {
            // Enable and show buttons
            if (likeBtn) {
                likeBtn.style.display = 'flex';
                likeBtn.style.visibility = 'visible';
                likeBtn.style.opacity = '1';
            }
            if (addToPlaylistBtn) {
                addToPlaylistBtn.style.display = 'flex';
                addToPlaylistBtn.style.visibility = 'visible';
                addToPlaylistBtn.style.opacity = '1';
            }

            console.log('✅ Player buttons enabled for current song');
        } else {
            // Hide buttons when no song is playing
            if (likeBtn) {
                likeBtn.style.display = 'none';
            }
            if (addToPlaylistBtn) {
                addToPlaylistBtn.style.display = 'none';
            }
        }
    }

    // Toggle like for currently playing song
    async toggleCurrentSongLike() {
        if (!this.currentSongId) {
            this.showNotification('No song is currently playing. Please play a song first.', 'warning');
            return;
        }

        console.log('🎵 Toggling like for song:', this.currentSongId);
        await this.toggleLike(this.currentSongId);
    }

    // Enhanced toggleLike method with better error handling
    async toggleLike(songId, songElement = null) {
        try {
            // Check current like status
            const checkResponse = await fetch(`/listener/songs/${songId}/isLiked`, {
                credentials: 'include' // Important for session cookies
            });

            if (!checkResponse.ok) {
                if (checkResponse.status === 401) {
                    this.showNotification('Please log in to like songs', 'warning');
                    return;
                }
                throw new Error(`HTTP error! status: ${checkResponse.status}`);
            }

            const checkData = await checkResponse.json();

            let response;
            if (checkData.liked) {
                // Unlike the song
                response = await fetch(`/listener/songs/${songId}/unlike`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include' // Important for session cookies
                });
            } else {
                // Like the song
                response = await fetch(`/listener/songs/${songId}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'include' // Important for session cookies
                });
            }

            if (!response.ok) {
                if (response.status === 401) {
                    this.showNotification('Please log in to like songs', 'warning');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.updateLikeUI(songId, !checkData.liked, songElement);
                this.updatePlayerLikeButton(!checkData.liked);
                this.showNotification(data.message, 'success');
            } else {
                this.showNotification(data.message || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            if (error.message.includes('401')) {
                this.showNotification('Please log in to like songs', 'warning');
            } else {
                this.showNotification('Failed to update like status', 'error');
            }
        }
    }

    // Update player like button
    updatePlayerLikeButton(isLiked) {
        const playerLikeBtn = document.getElementById('playerLikeBtn');
        if (playerLikeBtn) {
            const icon = playerLikeBtn.querySelector('i');
            if (isLiked) {
                playerLikeBtn.classList.add('active');
                icon.classList.remove('far');
                icon.classList.add('fas');
                playerLikeBtn.style.color = '#1DB954';
                playerLikeBtn.title = 'Remove from Liked Songs';
            } else {
                playerLikeBtn.classList.remove('active');
                icon.classList.remove('fas');
                icon.classList.add('far');
                playerLikeBtn.style.color = '';
                playerLikeBtn.title = 'Add to Liked Songs';
            }
        }
    }

    // Check and update like status for current song
    async checkCurrentSongLikeStatus() {
        if (!this.currentSongId) return;

        try {
            const response = await fetch(`/listener/songs/${this.currentSongId}/isLiked`, {
                credentials: 'include' // Important for session cookies
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('User not logged in, skipping like status check');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.updatePlayerLikeButton(data.liked);
        } catch (error) {
            console.error('Error checking like status:', error);
        }
    }

    // Show add to playlist modal for current song
    showAddToPlaylistModalForCurrentSong() {
        if (!this.currentSong) {
            this.showNotification('No song is currently playing. Please play a song first.', 'warning');
            return;
        }

        console.log('🎵 Showing playlist modal for song:', this.currentSongId);
        this.showAddToPlaylistModal(this.currentSongId, this.currentSong.title);
    }

    // Show add to playlist modal
    showAddToPlaylistModal(songId, songTitle) {
        // Remove existing modal if any
        const existingModal = document.getElementById('addToPlaylistModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal fade" id="addToPlaylistModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-card">
                        <div class="modal-header">
                            <h5 class="modal-title text-light">Add "${songTitle}" to Playlist</h5>
                            <button type="button" class="close text-light" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="playlistsList" class="mb-3" style="max-height: 300px; overflow-y: auto;">
                                <div class="text-center">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="sr-only">Loading playlists...</span>
                                    </div>
                                    <p class="mt-2 text-light">Loading playlists...</p>
                                </div>
                            </div>
                            <hr class="bg-light">
                            <div class="create-playlist-form">
                                <h6 class="text-light">Create New Playlist</h6>
                                <div class="input-group">
                                    <input type="text" id="newPlaylistName" class="form-control bg-dark text-light" placeholder="Playlist name">
                                    <div class="input-group-append">
                                        <button class="btn btn-primary" onclick="playlistManager.createNewPlaylistAndAdd('${songId}')">
                                            Create & Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        $('#addToPlaylistModal').modal('show');

        // Load playlists
        this.loadPlaylistsForModal(songId);
    }

    // Load playlists for modal with authentication handling
    async loadPlaylistsForModal(songId) {
        try {
            const response = await fetch('/listener/playlists', {
                credentials: 'include' // Important for session cookies
            });

            if (!response.ok) {
                if (response.status === 401) {
                    document.getElementById('playlistsList').innerHTML =
                        '<p class="text-warning text-center">Please log in to view your playlists</p>';
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const playlists = await response.json();
            const playlistsList = document.getElementById('playlistsList');

            if (!playlists || playlists.length === 0) {
                playlistsList.innerHTML = '<p class="text-muted text-center">No playlists found. Create one below!</p>';
            } else {
                playlistsList.innerHTML = playlists.map(playlist => `
                    <div class="playlist-item d-flex justify-content-between align-items-center p-2 border-bottom border-secondary">
                        <div>
                            <h6 class="mb-1 text-light">${playlist.name}</h6>
                            <small class="text-muted">${playlist.songCount || 0} songs</small>
                        </div>
                        <button class="btn btn-sm btn-outline-primary"
                                onclick="playlistManager.addSongToPlaylist(${playlist.id}, '${songId}')">
                            Add
                        </button>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading playlists:', error);
            document.getElementById('playlistsList').innerHTML =
                '<p class="text-danger text-center">Failed to load playlists</p>';
        }
    }

    // Create playlist and add song
    async createNewPlaylistAndAdd(songId) {
        const nameInput = document.getElementById('newPlaylistName');
        const name = nameInput.value.trim();

        if (!name) {
            this.showNotification('Please enter a playlist name', 'warning');
            return;
        }

        const playlist = await this.createPlaylist(name);
        if (playlist) {
            const success = await this.addSongToPlaylist(playlist.id, songId);
            if (success) {
                $('#addToPlaylistModal').modal('hide');
                nameInput.value = '';
            }
        }
    }

    // Create playlist with authentication handling
    async createPlaylist(name, description = '') {
        try {
            const response = await fetch('/listener/playlists/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify({ name, description })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.showNotification('Please log in to create playlists', 'warning');
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showNotification('Playlist created successfully!', 'success');
                return data.playlist;
            } else {
                this.showNotification(data.message || 'Failed to create playlist', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            if (error.message.includes('401')) {
                this.showNotification('Please log in to create playlists', 'warning');
            } else {
                this.showNotification('Failed to create playlist', 'error');
            }
            return null;
        }
    }

    // Add song to playlist with authentication handling
    async addSongToPlaylist(playlistId, songId) {
        try {
            const response = await fetch(`/listener/playlists/${playlistId}/addSong`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify({ songId: songId })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.showNotification('Please log in to add songs to playlists', 'warning');
                    return false;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.showNotification('Song added to playlist!', 'success');
                return true;
            } else {
                this.showNotification(data.message || 'Failed to add song to playlist', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            if (error.message.includes('401')) {
                this.showNotification('Please log in to add songs to playlists', 'warning');
            } else {
                this.showNotification('Failed to add song to playlist', 'error');
            }
            return false;
        }
    }

    // Update like UI
    updateLikeUI(songId, isLiked, songElement = null) {
        let likeButton;

        if (songElement) {
            likeButton = songElement.querySelector('.like-btn');
        } else {
            likeButton = document.querySelector(`[data-song-id="${songId}"] .like-btn`);
        }

        if (likeButton) {
            const icon = likeButton.querySelector('i');
            if (isLiked) {
                likeButton.classList.add('active');
                icon.classList.remove('far');
                icon.classList.add('fas');
                likeButton.style.color = '#1DB954';
                likeButton.title = 'Remove from Liked Songs';
            } else {
                likeButton.classList.remove('active');
                icon.classList.remove('fas');
                icon.classList.add('far');
                likeButton.style.color = '';
                likeButton.title = 'Add to Liked Songs';
            }
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (typeof Swal !== 'undefined') {
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: 'var(--dark)',
                color: 'white',
                iconColor: type === 'success' ? '#1DB954' : type === 'error' ? '#dc3545' : '#ffc107'
            });

            Toast.fire({
                icon: type,
                title: message
            });
        } else {
            console.log(`🎵 ${type.toUpperCase()}: ${message}`);
            // Fallback alert
            alert(message);
        }
    }
}

// Initialize playlist manager
let playlistManager;

document.addEventListener('DOMContentLoaded', function() {
    playlistManager = new PlaylistManager();
});

// Make it globally available
window.playlistManager = playlistManager;