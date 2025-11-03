// main.js
// Page Load Handler
window.addEventListener('load', function() {
    setTimeout(function() {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0';
        document.getElementById('content').style.display = 'block';
        setTimeout(function() {
            loader.style.display = 'none';
        }, 500);
    }, 1000);
});

// Global variables
let tracks = [];
let currentTrackIndex = -1;
let nextTrackIndex = -1;
let isPlaying = false;
let isPremium = false;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    initializePlayer();
});

// Navigation System
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Show Section with Dynamic Loading
async function showSection(sectionId) {
    console.log('Showing section:', sectionId);

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.main-section').forEach(section => {
        section.classList.remove('active');
    });

    // Get section element
    const sectionElement = document.getElementById(`${sectionId}-section`);

    // ALWAYS load content via AJAX for non-dashboard sections
    if (sectionElement && sectionId !== 'dashboard') {
        await loadSectionContent(sectionId);
    }

    // Show section
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
}

// Load Section Content via AJAX
async function loadSectionContent(sectionId) {
    console.log('Loading section via AJAX:', sectionId);
    const sectionElement = document.getElementById(`${sectionId}-section`);

    // Show loading
    sectionElement.innerHTML = `
        <div class="loading-container">
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-3">Loading ${sectionId}...</p>
        </div>
    `;

    try {
        console.log('Making fetch request to:', `/sections/${sectionId}`);
        const response = await fetch(`/sections/${sectionId}`, {
            method: 'GET',
            headers: {
                'Accept': 'text/html',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        sectionElement.innerHTML = html;
        console.log('Section loaded successfully:', sectionId);

        // Initialize section-specific functionality
        initializeSectionScripts(sectionId);

    } catch (error) {
        console.error('Error loading section:', error);
        sectionElement.innerHTML = `
            <div class="alert alert-danger m-5" role="alert">
                <h4 class="alert-heading">Error Loading Content</h4>
                <p>Failed to load ${sectionId} section. Please try again later.</p>
                <hr>
                <button class="btn btn-primary" onclick="showSection('${sectionId}')">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Initialize Section-Specific Scripts
function initializeSectionScripts(sectionId) {
    console.log('Initializing scripts for section:', sectionId);
    switch(sectionId) {
        case 'profile':
            if (typeof initializeProfileSection === 'function') {
                initializeProfileSection();
            }
            break;
        case 'search':
            if (typeof initializeSearchSection === 'function') {
                initializeSearchSection();
            }
            break;
        case 'library':
            // Initialize library section with multiple approaches
            console.log('📚 Initializing library section...');

            // Approach 1: Direct function call
            if (typeof initializeLibrarySection === 'function') {
                console.log('📚 Calling initializeLibrarySection()');
                initializeLibrarySection();
            }

            // Approach 2: Library manager instance
            if (typeof libraryManager !== 'undefined' && libraryManager.initializeLibrarySection) {
                console.log('📚 Calling libraryManager.initializeLibrarySection()');
                libraryManager.initializeLibrarySection();
            }

            // Approach 3: Dispatch event
            console.log('📚 Dispatching sectionChanged event');
            const event = new CustomEvent('sectionChanged', {
                detail: { section: 'library' }
            });
            document.dispatchEvent(event);
            break;
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}