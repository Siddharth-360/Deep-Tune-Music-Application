// ===================================
// SEARCH FUNCTIONALITY FOR DEEPTUNE
// ===================================

let currentSearchQuery = '';
let searchTimeout = null;

// ===================================
// INITIALIZATION - FIXED VERSION
// ===================================

function initializeSearch() {
    console.log('🔍 Initializing search functionality...');

    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');

    if (!searchInput) {
        console.error('❌ Search input not found!');
        return;
    }

    console.log('✅ Search input found:', searchInput);

    // Clear any existing listeners by cloning
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    // Attach input event listener
    newSearchInput.addEventListener('input', function(event) {
        console.log('🎯 Input event triggered! Value:', event.target.value);
        handleSearch(event);
    });

    // Attach enter key listener
    newSearchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const query = event.target.value.trim();
            console.log('⏎ Enter pressed with query:', query);
            if (query.length >= 2) {
                if (searchTimeout) clearTimeout(searchTimeout);
                performSearch(query);
            }
        }
    });

    // Setup clear button
    const currentClearBtn = document.getElementById('clearSearch');
    if (currentClearBtn) {
        const newClearBtn = currentClearBtn.cloneNode(true);
        currentClearBtn.parentNode.replaceChild(newClearBtn, currentClearBtn);
        newClearBtn.addEventListener('click', clearSearchResults);
        console.log('✅ Clear button initialized');
    }

    console.log('✅ Search initialized successfully!');
}

// ===================================
// SEARCH HANDLER
// ===================================

function handleSearch(event) {
    console.log('🔍 handleSearch called');

    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');

    if (!searchInput) {
        console.error('❌ Search input not found in handleSearch');
        return;
    }

    const query = searchInput.value.trim();
    console.log('📝 Current query:', query, '| Length:', query.length);

    // Show/hide clear button
    if (clearSearchBtn) {
        clearSearchBtn.style.display = query ? 'block' : 'none';
    }

    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // If query is empty, show initial state
    if (query.length === 0) {
        showInitialState();
        return;
    }

    // If query is too short, don't search
    if (query.length < 2) {
        console.log('⏳ Query too short, waiting...');
        return;
    }

    // Set new timeout for search (debouncing)
    console.log('⏱️ Setting search timeout...');
    searchTimeout = setTimeout(() => {
        console.log('🚀 Executing search for:', query);
        performSearch(query);
    }, 500);
}

// ===================================
// PERFORM SEARCH
// ===================================

async function performSearch(query) {
    console.log('🔍 performSearch called with query:', query);

    const searchResults = document.getElementById('searchResults');
    const searchLoading = document.getElementById('searchLoading');
    const noResults = document.getElementById('noResults');
    const initialState = document.getElementById('initialState');

    if (!searchResults) {
        console.error('❌ Search results container not found');
        return;
    }

    // Update current query
    currentSearchQuery = query;

    // Hide initial state
    if (initialState) initialState.style.display = 'none';

    // Show loading state
    if (searchLoading) searchLoading.style.display = 'block';
    if (noResults) noResults.style.display = 'none';
    searchResults.innerHTML = '';

    try {
        const url = `/api/songs/search?query=${encodeURIComponent(query)}`;
        console.log('📡 Fetching from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Search results received:', data);

        // Check if this is still the current search
        if (query === currentSearchQuery) {
            displaySearchResults(data);
        } else {
            console.log('⏭️ Search query changed, ignoring old results');
        }

    } catch (error) {
        console.error('❌ Search failed:', error);

        if (query === currentSearchQuery) {
            if (searchLoading) searchLoading.style.display = 'none';
            if (noResults) {
                noResults.style.display = 'block';
                noResults.innerHTML = `
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h4>Search Error</h4>
                    <p class="text-muted">Failed to search. Please try again.</p>
                    <small style="color: #666;">${error.message}</small>
                `;
            }
        }
    }
}

// ===================================
// DISPLAY SEARCH RESULTS
// ===================================

function displaySearchResults(data) {
    console.log('🎨 Displaying search results...');

    const searchResults = document.getElementById('searchResults');
    const searchLoading = document.getElementById('searchLoading');
    const noResults = document.getElementById('noResults');
    const initialState = document.getElementById('initialState');

    if (!searchResults) {
        console.error('❌ searchResults element not found!');
        return;
    }

    // Hide loading and initial state
    if (searchLoading) searchLoading.style.display = 'none';
    if (initialState) initialState.style.display = 'none';

    // Handle response - backend returns array directly
    let songs = [];

    if (Array.isArray(data)) {
        songs = data;
        console.log('✅ Data is array, length:', songs.length);
    } else if (data.songs && Array.isArray(data.songs)) {
        songs = data.songs;
        console.log('✅ Data has songs property, length:', songs.length);
    } else if (data.tracks && Array.isArray(data.tracks)) {
        songs = data.tracks;
        console.log('✅ Data has tracks property, length:', songs.length);
    } else {
        console.error('❌ Unexpected data format:', data);
    }

    // Check if we have results
    if (!songs || songs.length === 0) {
        console.log('⚠️ No songs to display');
        if (noResults) {
            noResults.style.display = 'block';
        }
        searchResults.innerHTML = '';
        return;
    }

    // Hide no results message
    if (noResults) noResults.style.display = 'none';

    console.log('🎨 Rendering', songs.length, 'songs');

    // Generate HTML for search results
    const resultsHTML = songs.map((track, index) => {
        const trackId = track.songId || track.id || 'unknown';
        const title = track.title || track.name || 'Unknown Title';
        const artist = track.artist || track.artistName || 'Unknown Artist';
        const imageUrl = track.imageUrl || track.albumArt || 'https://via.placeholder.com/300?text=No+Image';
        const previewUrl = track.previewUrl || track.preview || '';

        return `
            <div class="track-card" data-song-id="${trackId}" data-preview-url="${escapeHtml(previewUrl)}">
                <div class="card-img-container" onclick='playSearchResult(${index}, "${escapeHtml(title)}", "${escapeHtml(artist)}", "${trackId}", "${escapeHtml(imageUrl)}", "${escapeHtml(previewUrl)}")'>
                    <img src="${escapeHtml(imageUrl)}"
                         class="card-img-top"
                         alt="${escapeHtml(title)}"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/300?text=No+Image';">
                    <div class="play-icon-overlay">
                        <div class="play-icon">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h5>
                    <p class="card-text" title="${escapeHtml(artist)}">${escapeHtml(artist)}</p>
                </div>
            </div>
        `;
    }).join('');

    console.log('✅ HTML generated');
    searchResults.innerHTML = resultsHTML;
    console.log('✅ Results displayed in DOM');
}

// ===================================
// PLAY SEARCH RESULT
// ===================================

function playSearchResult(index, title, artist, songId, imageUrl, previewUrl) {
    console.log('🎵 Playing search result:', { title, artist, songId });

    if (!previewUrl || previewUrl === 'null' || previewUrl === 'undefined') {
        console.warn('⚠️ No preview URL available for this track');
        showNotification('No preview available for this track', 'warning');
        return;
    }

    // Try to use the global playSong function if it exists
    if (typeof playSong === 'function') {
        console.log('✅ Using global playSong function');
        playSong(null, index, title, artist, songId, imageUrl, previewUrl);
        return;
    }

    // Fallback: Direct audio player control
    console.log('⚠️ Global playSong not found, using fallback');
    const audioPlayer = document.getElementById('audioPlayer');
    const playerTrackImage = document.getElementById('playerTrackImage');
    const playerTrackTitle = document.getElementById('playerTrackTitle');
    const playerTrackArtist = document.getElementById('playerTrackArtist');
    const playPauseIcon = document.getElementById('playPauseIcon');

    if (!audioPlayer) {
        console.error('❌ Audio player not found');
        showNotification('Audio player not available', 'error');
        return;
    }

    // Update player UI
    if (playerTrackImage) playerTrackImage.src = imageUrl;
    if (playerTrackTitle) playerTrackTitle.textContent = title;
    if (playerTrackArtist) playerTrackArtist.textContent = artist;

    // Play audio
    audioPlayer.src = previewUrl;
    audioPlayer.play()
        .then(() => {
            console.log('✅ Audio playing');
            if (playPauseIcon) {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            }
        })
        .catch(error => {
            console.error('❌ Play failed:', error);
            showNotification('Failed to play track', 'error');
        });
}

// ===================================
// CLEAR SEARCH RESULTS
// ===================================

function clearSearchResults() {
    console.log('🧹 Clearing search results');

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const clearSearchBtn = document.getElementById('clearSearch');
    const noResults = document.getElementById('noResults');
    const searchLoading = document.getElementById('searchLoading');

    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (noResults) noResults.style.display = 'none';
    if (searchLoading) searchLoading.style.display = 'none';

    currentSearchQuery = '';

    if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
    }

    // Show initial state
    showInitialState();
}

// ===================================
// SHOW INITIAL STATE
// ===================================

function showInitialState() {
    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const searchLoading = document.getElementById('searchLoading');

    if (noResults) noResults.style.display = 'none';
    if (searchLoading) searchLoading.style.display = 'none';

    if (searchResults) {
        searchResults.innerHTML = `
            <div class="initial-state" id="initialState">
                <i class="fas fa-music fa-3x mb-3"></i>
                <h3>Start Searching</h3>
                <p>Type in the search box above to find your favorite music</p>
            </div>
        `;
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);

    // Try to use SweetAlert2 if available
    if (typeof Swal !== 'undefined') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: type,
            title: message
        });
    } else {
        // Fallback to console
        console.log(`Notification: ${message}`);
    }
}

// ===================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ===================================

window.initializeSearch = initializeSearch;
window.handleSearch = handleSearch;
window.performSearch = performSearch;
window.displaySearchResults = displaySearchResults;
window.playSearchResult = playSearchResult;
window.clearSearchResults = clearSearchResults;
window.showInitialState = showInitialState;

// ===================================
// AUTO-INITIALIZATION - ROBUST VERSION
// ===================================

console.log('✅ Search.js script loaded');

function attemptInitialization() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        console.log('✅ Search input found! Initializing...');
        initializeSearch();
        return true;
    }
    console.log('⏳ Search input not found yet...');
    return false;
}

// Try multiple times
let initAttempts = 0;
const maxAttempts = 10;

function tryInit() {
    initAttempts++;
    if (attemptInitialization()) {
        console.log('✅ Search initialized successfully!');
    } else if (initAttempts < maxAttempts) {
        console.log(`⏳ Retry attempt ${initAttempts}/${maxAttempts}...`);
        setTimeout(tryInit, 200);
    } else {
        console.error('❌ Failed to initialize search after', maxAttempts, 'attempts');
    }
}

// Start initialization attempts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
} else {
    tryInit();
}