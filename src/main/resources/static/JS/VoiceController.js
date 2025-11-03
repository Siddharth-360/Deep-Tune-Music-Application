// Alexa-Style Voice Assistant for DeepTune - Fixed Version
class VoiceAssistant {
    constructor() {
        this.isListening = false;
        this.isActive = false;
        this.recognition = null;
        this.wakeWord = 'computer';
        this.commands = new Map();
        this.activityTimeout = null;
        this.init();
    }

    init() {
        console.log('🎤 Initializing Alexa-style voice assistant...');

        if (this.setupSpeechRecognition()) {
            this.registerCommands();
            this.setupUI();
            this.startListening();
            console.log('✅ Voice assistant activated. Say "' + this.wakeWord + '" to start');
        } else {
            console.error('❌ Voice assistant not supported');
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            this.showNotification('Voice assistant not supported in this browser. Try Chrome.', 'error');
            return false;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;

            this.recognition.onstart = () => {
                console.log('🎤 Voice assistant is always listening...');
                this.isListening = true;
                this.updateUI();
            };

            this.recognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript.toLowerCase().trim();
                    const isFinal = event.results[i].isFinal;

                    console.log('🎤 Heard:', transcript, isFinal ? '(final)' : '(interim)');

                    if (!this.isActive) {
                        if (this.checkWakeWord(transcript)) {
                            this.activateAssistant();
                            break;
                        }
                    } else {
                        if (isFinal) {
                            this.processCommand(transcript);
                            break;
                        }
                    }
                }
            };

            this.recognition.onerror = (event) => {
                if (event.error !== 'no-speech') {
                    console.error('🎤 Speech recognition error:', event.error);
                }
            };

            this.recognition.onend = () => {
                console.log('🎤 Recognition ended, restarting...');
                this.isListening = false;
                this.updateUI();
                setTimeout(() => this.startListening(), 1000);
            };

            return true;

        } catch (error) {
            console.error('❌ Error setting up voice assistant:', error);
            return false;
        }
    }

    checkWakeWord(transcript) {
        const wakeWordVariations = [
            this.wakeWord,
            'hey ' + this.wakeWord,
            'okay ' + this.wakeWord,
            'hello ' + this.wakeWord
        ];

        return wakeWordVariations.some(wakeWord => {
            const regex = new RegExp(`\\b${wakeWord}\\b`, 'i');
            return regex.test(transcript);
        });
    }

    activateAssistant() {
        console.log('🎯 Wake word detected! Assistant activated');
        this.isActive = true;
        this.updateUI();
        this.showNotification('Listening... What would you like to do?', 'info', 3000);
        this.resetActivityTimeout();
    }

    deactivateAssistant() {
        console.log('💤 Assistant deactivated');
        this.isActive = false;
        this.updateUI();
        this.showNotification('Assistant deactivated. Say "' + this.wakeWord + '" to activate again.', 'info', 2000);
    }

    resetActivityTimeout() {
        if (this.activityTimeout) {
            clearTimeout(this.activityTimeout);
        }
        this.activityTimeout = setTimeout(() => {
            this.deactivateAssistant();
        }, 5000);
    }

    registerCommands() {
        this.commands.clear();

        // BASIC CONTROLS
        this.commands.set('play', () => this.playMusic());
        this.commands.set('start music', () => this.playMusic());
        this.commands.set('pause', () => this.pauseMusic());
        this.commands.set('stop music', () => this.pauseMusic());
        this.commands.set('resume', () => this.playMusic());

        this.commands.set('next', () => this.nextTrack());
        this.commands.set('next song', () => this.nextTrack());
        this.commands.set('skip', () => this.nextTrack());

        this.commands.set('previous', () => this.previousTrack());
        this.commands.set('last song', () => this.previousTrack());
        this.commands.set('go back', () => this.previousTrack());

        // VOLUME CONTROLS
        this.commands.set('volume up', () => this.volumeUp());
        this.commands.set('turn up volume', () => this.volumeUp());
        this.commands.set('louder', () => this.volumeUp());

        this.commands.set('volume down', () => this.volumeDown());
        this.commands.set('turn down volume', () => this.volumeDown());
        this.commands.set('softer', () => this.volumeDown());

        this.commands.set('mute', () => this.muteVolume());
        this.commands.set('silence', () => this.muteVolume());

        this.commands.set('unmute', () => this.unmuteVolume());
        this.commands.set('turn sound back on', () => this.unmuteVolume());

        this.commands.set('max volume', () => this.maxVolume());
        this.commands.set('full volume', () => this.maxVolume());

        // NAVIGATION
        this.commands.set('go home', () => this.showSection('dashboard'));
        this.commands.set('show home', () => this.showSection('dashboard'));
        this.commands.set('main screen', () => this.showSection('dashboard'));

        this.commands.set('search', () => this.showSection('search'));
        this.commands.set('find music', () => this.showSection('search'));
        this.commands.set('browse', () => this.showSection('search'));

        this.commands.set('library', () => this.showSection('library'));
        this.commands.set('my music', () => this.showSection('library'));
        this.commands.set('playlists', () => this.showSection('library'));

        this.commands.set('profile', () => this.showSection('profile'));
        this.commands.set('my account', () => this.showSection('profile'));
        this.commands.set('settings', () => this.showSection('profile'));

        // SMART COMMANDS
        this.commands.set('what\'s playing', () => this.currentTrackInfo());
        this.commands.set('what is this song', () => this.currentTrackInfo());
        this.commands.set('who sings this', () => this.currentTrackInfo());

        this.commands.set('play something random', () => this.playRandom());
        this.commands.set('shuffle music', () => this.playRandom());
        this.commands.set('surprise me', () => this.playRandom());

        this.commands.set('trending', () => this.showTrending());
        this.commands.set('popular songs', () => this.showTrending());
        this.commands.set('what\'s hot', () => this.showTrending());

        // ASSISTANT CONTROLS
        this.commands.set('thank you', () => this.thankYou());
        this.commands.set('thanks', () => this.thankYou());
        this.commands.set('stop listening', () => this.deactivateAssistant());
        this.commands.set('never mind', () => this.deactivateAssistant());
        this.commands.set('cancel', () => this.deactivateAssistant());
        this.commands.set('go to sleep', () => this.deactivateAssistant());
        this.commands.set('stop', () => this.deactivateAssistant());

        this.commands.set('help', () => this.showHelp());
        this.commands.set('what can you do', () => this.showHelp());
        this.commands.set('commands', () => this.showHelp());

        console.log(`✅ Registered ${this.commands.size} voice commands`);
    }

    processCommand(transcript) {
        console.log('🔍 Processing command:', transcript);
        this.resetActivityTimeout();

        let cleanTranscript = transcript.replace(new RegExp(this.wakeWord, 'gi'), '').trim();
        cleanTranscript = cleanTranscript.replace(/^(hey|okay|hello)\s+/gi, '').trim();

        console.log('🧹 Cleaned command:', cleanTranscript);

        let commandExecuted = false;

        // SEARCH COMMANDS - FIXED: Use your existing search functionality
        if (cleanTranscript.startsWith('play ')) {
            const query = cleanTranscript.replace(/^play\s+/, '').trim();
            if (query.length > 0 && !this.isBasicCommand(query)) {
                this.triggerSearchAndPlay(query);
                commandExecuted = true;
            }
        }
        else if (cleanTranscript.startsWith('find ') || cleanTranscript.startsWith('search for ') || cleanTranscript.startsWith('search and play ')) {
            const query = cleanTranscript.replace(/^(find|search for|search and play)\s+/, '').trim();
            if (query.length > 0) {
                this.triggerSearchAndPlay(query);
                commandExecuted = true;
            }
        }

        // VOLUME PRECISION
        else if (cleanTranscript.match(/volume to \d+/)) {
            const volume = cleanTranscript.match(/volume to (\d+)/)[1];
            this.setVolume(parseInt(volume));
            commandExecuted = true;
        }
        else if (cleanTranscript.match(/set volume to \d+/)) {
            const volume = cleanTranscript.match(/set volume to (\d+)/)[1];
            this.setVolume(parseInt(volume));
            commandExecuted = true;
        }

        // EXACT MATCHES
        if (!commandExecuted) {
            for (let [command, action] of this.commands) {
                if (cleanTranscript === command) {
                    console.log(`✅ Executing: ${command}`);
                    action();
                    commandExecuted = true;
                    break;
                }
            }
        }

        // FUZZY MATCHES
        if (!commandExecuted) {
            for (let [command, action] of this.commands) {
                if (this.isSimilarCommand(cleanTranscript, command)) {
                    console.log(`✅ Executing similar: ${command} for "${cleanTranscript}"`);
                    action();
                    commandExecuted = true;
                    break;
                }
            }
        }

        if (!commandExecuted) {
            console.log('❌ No command matched:', cleanTranscript);
            this.showNotification(`I didn't understand "${cleanTranscript}"`, 'warning');
            this.suggestHelp();
        }

        if (commandExecuted && !cleanTranscript.startsWith('play ') && !cleanTranscript.startsWith('find ') && !cleanTranscript.startsWith('search for ') && !cleanTranscript.startsWith('search and play ')) {
            setTimeout(() => this.deactivateAssistant(), 1000);
        }
    }

    isBasicCommand(query) {
        const basicCommands = ['music', 'song', 'something', 'random', 'it', ''];
        return basicCommands.includes(query.toLowerCase());
    }

    isSimilarCommand(spoken, command) {
        const spokenWords = spoken.split(/\s+/);
        const commandWords = command.split(/\s+/);

        let matchCount = 0;
        for (let word of commandWords) {
            if (spoken.includes(word)) {
                matchCount++;
            }
        }

        return matchCount >= Math.max(1, commandWords.length - 1);
    }

    suggestHelp() {
        this.showNotification('Try saying "help" to see available commands', 'info');
    }

    // ACTION METHODS
    playMusic() {
        const playButton = document.getElementById('playPauseBtn');
        if (playButton) {
            playButton.click();
            this.showNotification('Playing music', 'success');
        }
    }

    pauseMusic() {
        const playButton = document.getElementById('playPauseBtn');
        if (playButton) {
            playButton.click();
            this.showNotification('Music paused', 'success');
        }
    }

    nextTrack() {
        const nextButton = document.getElementById('nextBtn');
        if (nextButton) {
            nextButton.click();
            this.showNotification('Skipping to next track', 'success');
        }
    }

    previousTrack() {
        const prevButton = document.getElementById('prevBtn');
        if (prevButton) {
            prevButton.click();
            this.showNotification('Going to previous track', 'success');
        }
    }

    volumeUp() {
        this.adjustVolume(20);
        this.showNotification('Volume increased', 'success');
    }

    volumeDown() {
        this.adjustVolume(-20);
        this.showNotification('Volume decreased', 'success');
    }

    setVolume(level) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.value = Math.min(Math.max(level, 0), 100);
            volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
            this.showNotification(`Volume set to ${level}%`, 'success');
        }
    }

    adjustVolume(change) {
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            const currentVolume = parseInt(volumeSlider.value) || 50;
            const newVolume = Math.min(Math.max(currentVolume + change, 0), 100);
            volumeSlider.value = newVolume;
            volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    muteVolume() {
        this.setVolume(0);
    }

    unmuteVolume() {
        this.setVolume(50);
    }

    maxVolume() {
        this.setVolume(100);
    }

    showSection(sectionName) {
        if (typeof showSection === 'function') {
            showSection(sectionName);
            this.showNotification(`Showing ${sectionName}`, 'success');
        }
    }

    // FIXED: Use your existing search functionality instead of overriding it
    triggerSearchAndPlay(query) {
        this.showNotification(`Searching for: ${query}`, 'info');

        // Navigate to search section first
        if (typeof showSection === 'function') {
            showSection('search');
        }

        // Wait for section to load, then use your existing search function
        setTimeout(() => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && typeof handleSearch === 'function') {
                searchInput.value = query;
                // Use your existing handleSearch function
                handleSearch({ target: searchInput });

                // Wait for search results and play the first one
                this.waitForSearchResultsAndPlay(query);
            } else {
                this.showNotification('Search functionality not available', 'error');
                this.deactivateAssistant();
            }
        }, 1000);
    }

    waitForSearchResultsAndPlay(query) {
        let attempts = 0;
        const maxAttempts = 10;

        const checkForResults = () => {
            attempts++;

            // Look for search results using the same structure as your search.js
            const searchResults = document.getElementById('searchResults');
            let firstResult = null;

            if (searchResults) {
                // Use the same selectors as your search results
                firstResult = searchResults.querySelector('.track-card, .song-item, [data-song]');

                if (!firstResult) {
                    // Check if results are in rows
                    const rows = searchResults.querySelectorAll('.row');
                    for (let row of rows) {
                        firstResult = row.querySelector('.track-card, [data-song]');
                        if (firstResult) break;
                    }
                }
            }

            if (firstResult) {
                console.log('🎵 Found search result, clicking to play...');
                firstResult.click();
                this.showNotification(`Now playing: ${query}`, 'success');
                setTimeout(() => this.deactivateAssistant(), 1000);
                return;
            }

            // Check for no results message
            const noResults = document.getElementById('noResults');
            if (noResults && noResults.style.display !== 'none') {
                this.showNotification(`No results found for: ${query}`, 'warning');
                setTimeout(() => this.deactivateAssistant(), 1000);
                return;
            }

            // Check if still loading
            const searchLoading = document.getElementById('searchLoading');
            if (searchLoading && searchLoading.style.display !== 'none') {
                if (attempts < maxAttempts) {
                    setTimeout(checkForResults, 1000);
                } else {
                    this.showNotification(`Search timeout for: ${query}`, 'warning');
                    setTimeout(() => this.deactivateAssistant(), 1000);
                }
                return;
            }

            // If no results found after max attempts
            if (attempts >= maxAttempts) {
                this.showNotification(`No results found for: ${query}`, 'warning');
                setTimeout(() => this.deactivateAssistant(), 1000);
                return;
            }

            // Continue checking
            setTimeout(checkForResults, 1000);
        };

        // Start checking after a short delay
        setTimeout(checkForResults, 1500);
    }

    currentTrackInfo() {
        const title = document.getElementById('playerTrackTitle');
        const artist = document.getElementById('playerTrackArtist');

        if (title && artist) {
            const trackTitle = title.textContent;
            const trackArtist = artist.textContent;

            if (trackTitle !== 'Select a song') {
                this.showNotification(`Now playing: ${trackTitle} by ${trackArtist}`, 'info');
            } else {
                this.showNotification('No music is currently playing', 'info');
            }
        }
    }

    playRandom() {
        const tracks = document.querySelectorAll('.track-card, .song-item, [data-song]');
        if (tracks.length > 0) {
            const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
            randomTrack.click();
            this.showNotification('Playing random track', 'success');
        } else {
            this.showNotification('No tracks available to play', 'warning');
        }
    }

    showTrending() {
        this.showSection('dashboard');
        this.showNotification('Showing trending music', 'info');
    }

    thankYou() {
        const responses = [
            "You're welcome!",
            "Happy to help!",
            "Anytime!",
            "My pleasure!"
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.showNotification(response, 'success');
    }

    showHelp() {
        const helpMessage = `
I can help you with:
• "Play [song name]" - Play specific songs
• "Search and play [song name]" - Search and play new songs
• "Find [song name]" - Search for music
• "Volume up/down" - Control volume
• "Next/Previous" - Skip tracks
• "What's playing?" - Current song info
• "Go home/search/library" - Navigation
• "Play something random" - Shuffle music
• "Stop listening" - Deactivate assistant
        `.trim();

        this.showNotification(helpMessage, 'info', 6000);
    }

    // UI METHODS
    setupUI() {
        // Only add if not already present
        if (!document.getElementById('voiceAssistantIndicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'voiceAssistantIndicator';
            indicator.innerHTML = `
                <div class="voice-indicator">
                    <i class="fas fa-microphone"></i>
                    <span>Say "${this.wakeWord}" for help</span>
                </div>
            `;
            document.body.appendChild(indicator);
            this.addAssistantCSS();
        }
    }

    addAssistantCSS() {
        // Only add if not already present
        if (!document.querySelector('#voiceAssistantStyles')) {
            const css = `
                .voice-indicator {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    background: rgba(29, 185, 84, 0.9);
                    color: white;
                    padding: 10px 15px;
                    border-radius: 25px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 10000;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                    animation: pulse 2s infinite;
                }

                .voice-indicator.listening {
                    background: rgba(29, 185, 84, 1);
                    animation: pulse-fast 1s infinite;
                }

                .voice-indicator.active {
                    background: rgba(255, 193, 7, 0.9);
                    animation: pulse-fast 0.5s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                @keyframes pulse-fast {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                @media (max-width: 768px) {
                    .voice-indicator {
                        bottom: 80px;
                        right: 10px;
                        font-size: 12px;
                        padding: 8px 12px;
                    }
                }
            `;

            const style = document.createElement('style');
            style.id = 'voiceAssistantStyles';
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    updateUI() {
        const indicator = document.querySelector('.voice-indicator');
        if (indicator) {
            if (this.isActive) {
                indicator.classList.add('active');
                indicator.innerHTML = `<i class="fas fa-microphone-alt"></i><span>Active - Say commands</span>`;
            } else if (this.isListening) {
                indicator.classList.remove('active');
                indicator.classList.add('listening');
                indicator.innerHTML = `<i class="fas fa-microphone"></i><span>Say "${this.wakeWord}"</span>`;
            } else {
                indicator.classList.remove('active', 'listening');
                indicator.innerHTML = '<i class="fas fa-microphone-slash"></i><span>Voice offline</span>';
            }
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
                setTimeout(() => this.startListening(), 2000);
            }
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type,
                title: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: duration,
                background: 'var(--dark)',
                color: 'white'
            });
        } else {
            console.log(`🎤 ${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize the voice assistant
let voiceAssistant;

document.addEventListener('DOMContentLoaded', function() {
    // Wait for page to fully load and ensure search.js is loaded
    setTimeout(() => {
        try {
            voiceAssistant = new VoiceAssistant();
            console.log('🚀 Alexa-style voice assistant ready!');
            console.log('💡 Say "' + voiceAssistant.wakeWord + '" followed by your command');
        } catch (error) {
            console.error('Failed to initialize voice assistant:', error);
        }
    }, 3000); // Increased delay to ensure search.js is loaded
});

// Global access for testing
window.voiceAssistant = voiceAssistant;