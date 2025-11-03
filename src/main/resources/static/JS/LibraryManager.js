// LibraryManager.js - Manages library functionality
class LibraryManager {
    constructor() {
        this.currentTab = 'liked-songs';
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('📚 Library Manager initialized');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
    }

    // ADD THIS FUNCTION - This is what main.js calls
    initializeLibrarySection() {
        console.log('📚 Library section initialized via main.js');

        // Wait for HTML to be fully rendered
        setTimeout(() => {
            this.onLibrarySectionOpened();
        }, 300);
    }

    setupEventListeners() {
        console.log('📚 Setting up event listeners');

        // Use event delegation for tab switching since tabs might be loaded later
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button') || e.target.closest('.tab-button')) {
                const button = e.target.classList.contains('tab-button') ? e.target : e.target.closest('.tab-button');
                const tabName = button.dataset.tab;
                console.log('📚 Tab clicked:', tabName);
                this.switchTab(tabName);
            }
        });

        // Listen for section changes
        document.addEventListener('sectionChanged', (event) => {
            if (event.detail.section === 'library') {
                console.log('📚 Library section changed event received');
                setTimeout(() => {
                    this.onLibrarySectionOpened();
                }, 300);
            }
        });
    }

    // Load initial data when library section is opened
    onLibrarySectionOpened() {
        console.log('📚 Library section opened - loading data...');

        // Double check containers exist
        if (!this.checkContainersExist()) {
            console.error('❌ Library containers not found, retrying in 500ms...');
            setTimeout(() => {
                this.onLibrarySectionOpened();
            }, 500);
            return;
        }

        // Set default tab to liked songs if not set
        if (!this.currentTab) {
            this.currentTab = 'liked-songs';
        }

        console.log('📚 Loading data for tab:', this.currentTab);

        // Load data for current tab
        switch(this.currentTab) {
            case 'liked-songs':
                this.loadLikedSongs();
                break;
            case 'playlists':
                this.loadPlaylists();
                break;
            case 'recently-played':
                this.loadRecentlyPlayed();
                break;
        }

        this.isInitialized = true;
    }

    // Check if all required containers exist
    checkContainersExist() {
        const containers = {
            'likedSongsList': document.getElementById('likedSongsList'),
            'playlistsGrid': document.getElementById('playlistsGrid'),
            'recentTracksList': document.getElementById('recentTracksList')
        };

        let allExist = true;
        for (const [name, container] of Object.entries(containers)) {
            if (!container) {
                console.error(`❌ Container not found: ${name}`);
                allExist = false;
            } else {
                console.log(`✅ Container found: ${name}`);
            }
        }

        return allExist;
    }

    // Switch between tabs
    switchTab(tabName) {
        console.log('📚 Switching to tab:', tabName);

        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        } else {
            console.error('❌ Tab button not found:', tabName);
            return;
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
        } else {
            console.error('❌ Tab content not found:', tabName);
            return;
        }

        this.currentTab = tabName;

        // Load data for the tab if needed
        switch(tabName) {
            case 'liked-songs':
                this.loadLikedSongs();
                break;
            case 'playlists':
                this.loadPlaylists();
                break;
            case 'recently-played':
                this.loadRecentlyPlayed();
                break;
        }
    }

    // Load liked songs
    async loadLikedSongs() {
        console.log('🔄 Loading liked songs...');

        // Wait a bit to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        const container = document.getElementById('likedSongsList');
        if (!container) {
            console.error('❌ likedSongsList container not found!');
            return;
        }

        console.log('✅ Found likedSongsList container, making API call...');

        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading liked songs...</p>
            </div>
        `;

        try {
            console.log('📡 Making request to: /listener/library/liked-songs');
            const response = await fetch('/listener/library/liked-songs', {
                credentials: 'include'
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📡 Received data:', data);

            if (data.songs && data.songs.length > 0) {
                console.log(`🎵 Found ${data.songs.length} liked songs`);
                container.innerHTML = this.renderSongsList(data.songs, 'liked');
            } else {
                console.log('🎵 No liked songs found');
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-heart"></i>
                        <h3>No liked songs yet</h3>
                        <p>Start liking songs to see them here</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading liked songs:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load liked songs</h3>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }

    // Load playlists
    async loadPlaylists() {
        console.log('🔄 Loading playlists...');

        await new Promise(resolve => setTimeout(resolve, 100));

        const container = document.getElementById('playlistsGrid');
        if (!container) {
            console.error('❌ playlistsGrid container not found!');
            return;
        }

        console.log('✅ Found playlistsGrid container, making API call...');

        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading playlists...</p>
            </div>
        `;

        try {
            console.log('📡 Making request to: /listener/library/playlists');
            const response = await fetch('/listener/library/playlists', {
                credentials: 'include'
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📡 Received data:', data);

            if (data.playlists && data.playlists.length > 0) {
                console.log(`🎵 Found ${data.playlists.length} playlists`);
                container.innerHTML = this.renderPlaylistsGrid(data.playlists);
            } else {
                console.log('🎵 No playlists found');
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-list"></i>
                        <h3>No playlists yet</h3>
                        <p>Create your first playlist to get started</p>
                        <button class="btn-create" onclick="libraryManager.showCreatePlaylistModal()">
                            Create Playlist
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading playlists:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load playlists</h3>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }

    // Load recently played
    async loadRecentlyPlayed() {
        console.log('🔄 Loading recently played...');

        await new Promise(resolve => setTimeout(resolve, 100));

        const container = document.getElementById('recentTracksList');
        if (!container) {
            console.error('❌ recentTracksList container not found!');
            return;
        }

        console.log('✅ Found recentTracksList container, making API call...');

        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading recently played...</p>
            </div>
        `;

        try {
            console.log('📡 Making request to: /listener/library/recently-played');
            const response = await fetch('/listener/library/recently-played', {
                credentials: 'include'
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📡 Received data:', data);

            if (data.songs && data.songs.length > 0) {
                console.log(`🎵 Found ${data.songs.length} recently played songs`);
                container.innerHTML = this.renderSongsList(data.songs, 'recent');
            } else {
                console.log('🎵 No recently played songs found');
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <h3>No recent plays</h3>
                        <p>Your recently played songs will appear here</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error loading recently played:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load recently played</h3>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }

    // Render songs list
    renderSongsList(songs, type) {
        console.log(`🎨 Rendering ${songs.length} songs for type: ${type}`);

        return `
            <div class="songs-table">
                <div class="table-header">
                    <div class="col-number">#</div>
                    <div class="col-title">Title</div>
                    <div class="col-album">Album</div>
                    <div class="col-duration">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="col-actions"></div>
                </div>
                <div class="table-body">
                    ${songs.map((song, index) => `
                        <div class="song-row" data-song-id="${song.songId || song.id}"
                             onclick="libraryManager.playSong('${song.songId || song.id}', '${this.escapeHtml(song.title)}', '${this.escapeHtml(song.artist)}', '${song.imageUrl}', '${song.previewUrl}')">
                            <div class="col-number">
                                <span class="track-number">${index + 1}</span>
                                <i class="fas fa-play play-icon"></i>
                            </div>
                            <div class="col-title">
                                <img src="${song.imageUrl}" alt="${this.escapeHtml(song.title)}" class="song-image">
                                <div class="song-info">
                                    <div class="song-title">${this.escapeHtml(song.title)}</div>
                                    <div class="song-artist">${this.escapeHtml(song.artist)}</div>
                                </div>
                            </div>
                            <div class="col-album">${this.escapeHtml(song.album || 'Unknown Album')}</div>
                            <div class="col-duration">${this.formatDuration(song.duration)}</div>
                            <div class="col-actions">
                                ${type === 'liked' ? `
                                    <button class="btn-action unlike-btn" onclick="event.stopPropagation(); libraryManager.unlikeSong('${song.songId || song.id}')" title="Remove from Liked Songs">
                                        <i class="fas fa-heart"></i>
                                    </button>
                                ` : ''}
                                <button class="btn-action playlist-btn" onclick="event.stopPropagation(); playlistManager.showAddToPlaylistModal('${song.songId || song.id}', '${this.escapeHtml(song.title)}')" title="Add to Playlist">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Render playlists grid
    renderPlaylistsGrid(playlists) {
        console.log(`🎨 Rendering ${playlists.length} playlists`);

        return `
            <div class="playlists-container">
                ${playlists.map(playlist => `
                    <div class="playlist-card" onclick="libraryManager.openPlaylist('${playlist.id}')">
                        <div class="playlist-image">
                            ${playlist.imageUrl ? `
                                <img src="${playlist.imageUrl}" alt="${this.escapeHtml(playlist.name)}">
                            ` : `
                                <div class="playlist-placeholder">
                                    <i class="fas fa-music"></i>
                                </div>
                            `}
                            <div class="play-overlay">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="playlist-info">
                            <h4 class="playlist-name">${this.escapeHtml(playlist.name)}</h4>
                            <p class="playlist-meta">${playlist.songCount} songs</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Play song
    playSong(songId, title, artist, imageUrl, previewUrl) {
        console.log('🎵 Playing song:', { songId, title, artist });

        if (window.playSong) {
            // Use your existing playSong function
            window.playSong(null, 0, title, artist, songId, imageUrl, previewUrl);
        } else {
            // Fallback: dispatch song changed event
            const songData = {
                songId: songId,
                title: title,
                artist: artist,
                imageUrl: imageUrl,
                previewUrl: previewUrl
            };
            const event = new CustomEvent('songChanged', { detail: songData });
            document.dispatchEvent(event);
        }
    }

    // Unlike song
    async unlikeSong(songId) {
        try {
            const response = await fetch(`/listener/songs/${songId}/unlike`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });

            if (response.ok) {
                this.showNotification('Song removed from liked songs', 'success');
                this.loadLikedSongs(); // Reload the list
            } else {
                this.showNotification('Failed to remove song', 'error');
            }
        } catch (error) {
            console.error('Error unliking song:', error);
            this.showNotification('Failed to remove song', 'error');
        }
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Format duration
    formatDuration(seconds) {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            console.log(`📚 ${type.toUpperCase()}: ${message}`);
        }
    }

    // ... rest of your existing methods
    shuffleLikedSongs() {
        this.showNotification('Shuffling liked songs', 'info');
    }

    showCreatePlaylistModal() {
        $('#createPlaylistModal').modal('show');
    }

    async createPlaylist() {
        const nameInput = document.getElementById('playlistName');
        const descriptionInput = document.getElementById('playlistDescription');

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!name) {
            this.showNotification('Please enter a playlist name', 'warning');
            return;
        }

        try {
            const response = await fetch('/listener/playlists/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Playlist created successfully!', 'success');
                    $('#createPlaylistModal').modal('hide');
                    nameInput.value = '';
                    descriptionInput.value = '';
                    this.loadPlaylists(); // Reload playlists
                } else {
                    this.showNotification(data.message || 'Failed to create playlist', 'error');
                }
            } else {
                this.showNotification('Failed to create playlist', 'error');
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            this.showNotification('Failed to create playlist', 'error');
        }
    }

    openPlaylist(playlistId) {
        console.log('Opening playlist:', playlistId);
        this.showNotification('Opening playlist...', 'info');
    }

    async clearRecentHistory() {
        if (!confirm('Are you sure you want to clear your recent history?')) {
            return;
        }

        try {
            const response = await fetch('/listener/library/clear-recent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.showNotification('Recent history cleared', 'success');
                    this.loadRecentlyPlayed(); // Reload the list
                } else {
                    this.showNotification(data.message || 'Failed to clear history', 'error');
                }
            } else {
                this.showNotification('Failed to clear history', 'error');
            }
        } catch (error) {
            console.error('Error clearing recent history:', error);
            this.showNotification('Failed to clear history', 'error');
        }
    }
}

// Initialize library manager
let libraryManager;

document.addEventListener('DOMContentLoaded', function() {
    libraryManager = new LibraryManager();
    window.libraryManager = libraryManager;
});

// Make the initialization function globally available for main.js
window.initializeLibrarySection = function() {
    console.log('🌐 Global initializeLibrarySection called');
    if (window.libraryManager) {
        window.libraryManager.initializeLibrarySection();
    } else {
        console.error('❌ libraryManager not available yet');
    }
};