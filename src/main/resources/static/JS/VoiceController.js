// Alexa-Style Voice Assistant for DeepTune - Enhanced Version
class VoiceAssistant {
    constructor() {
        this.isListening = false;
        this.isActive = false;
        this.recognition = null;
        this.wakeWord = 'computer';
        this.commands = new Map();
        this.activityTimeout = null;
        this.originalVolume = 80; // Store original volume
        this.isDucked = false; // Track if volume is ducked
        this.previousVolume = null;
        this.conversationContext = null; // For multi-turn conversations
        this.lastCommand = null;
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
            'hello ' + this.wakeWord,
            'hi ' + this.wakeWord
        ];

        return wakeWordVariations.some(wakeWord => {
            const regex = new RegExp(`\\b${wakeWord}\\b`, 'i');
            return regex.test(transcript);
        });
    }

    activateAssistant() {
        console.log('🎯 Wake word detected! Assistant activated');
        this.isActive = true;
        this.duckVolume(); // Lower music volume
        this.updateUI();
        this.playActivationSound();
        this.showNotification('Listening... What would you like to do?', 'info', 3000);
        this.resetActivityTimeout();
    }

    deactivateAssistant() {
        console.log('💤 Assistant deactivated');
        this.isActive = false;
        this.restoreVolume(); // Restore original volume
        this.updateUI();
        this.playDeactivationSound();
        this.showNotification('Assistant deactivated. Say "' + this.wakeWord + '" to activate again.', 'info', 2000);
        this.conversationContext = null;
    }

    // VOLUME DUCKING - Lower music when listening
    duckVolume() {
        const volumeSlider = document.getElementById('volumeSlider');
        const audioPlayer = document.getElementById('audioPlayer');

        if (volumeSlider && audioPlayer && !audioPlayer.paused) {
            this.previousVolume = parseInt(volumeSlider.value) || 80;
            const duckLevel = Math.max(10, this.previousVolume * 0.15); // 15% of original or 10%, whichever is higher

            volumeSlider.value = duckLevel;
            volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
            this.isDucked = true;

            console.log(`🔉 Volume ducked from ${this.previousVolume}% to ${duckLevel}%`);
        }
    }

    restoreVolume() {
        if (this.isDucked && this.previousVolume !== null) {
            const volumeSlider = document.getElementById('volumeSlider');

            if (volumeSlider) {
                volumeSlider.value = this.previousVolume;
                volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                this.isDucked = false;

                console.log(`🔊 Volume restored to ${this.previousVolume}%`);
                this.previousVolume = null;
            }
        }
    }

    resetActivityTimeout() {
        if (this.activityTimeout) {
            clearTimeout(this.activityTimeout);
        }
        this.activityTimeout = setTimeout(() => {
            this.deactivateAssistant();
        }, 8000); // Increased to 8 seconds
    }

    registerCommands() {
        this.commands.clear();

        // ============================================
        // PLAYBACK CONTROLS
        // ============================================
        this.commands.set('play', () => this.playMusic());
        this.commands.set('start music', () => this.playMusic());
        this.commands.set('start playing', () => this.playMusic());
        this.commands.set('play music', () => this.playMusic());

        this.commands.set('pause', () => this.pauseMusic());
        this.commands.set('stop', () => this.pauseMusic());
        this.commands.set('stop music', () => this.pauseMusic());
        this.commands.set('pause music', () => this.pauseMusic());
        this.commands.set('hold on', () => this.pauseMusic());

        this.commands.set('resume', () => this.playMusic());
        this.commands.set('continue', () => this.playMusic());
        this.commands.set('keep playing', () => this.playMusic());

        this.commands.set('next', () => this.nextTrack());
        this.commands.set('next song', () => this.nextTrack());
        this.commands.set('skip', () => this.nextTrack());
        this.commands.set('skip this', () => this.nextTrack());
        this.commands.set('skip this song', () => this.nextTrack());
        this.commands.set('next track', () => this.nextTrack());
        this.commands.set('forward', () => this.nextTrack());

        this.commands.set('previous', () => this.previousTrack());
        this.commands.set('last song', () => this.previousTrack());
//        this.commands.set('go back', () => this.previousTrack());
        this.commands.set('back', () => this.previousTrack());
        this.commands.set('previous song', () => this.previousTrack());
        this.commands.set('replay', () => this.replayTrack());
        this.commands.set('restart song', () => this.replayTrack());
        this.commands.set('start over', () => this.replayTrack());

        // ============================================
        // VOLUME CONTROLS
        // ============================================
        this.commands.set('volume up', () => this.volumeUp());
        this.commands.set('turn up volume', () => this.volumeUp());
        this.commands.set('louder', () => this.volumeUp());
        this.commands.set('increase volume', () => this.volumeUp());
        this.commands.set('turn it up', () => this.volumeUp());

        this.commands.set('volume down', () => this.volumeDown());
        this.commands.set('turn down volume', () => this.volumeDown());
        this.commands.set('softer', () => this.volumeDown());
        this.commands.set('quieter', () => this.volumeDown());
        this.commands.set('decrease volume', () => this.volumeDown());
        this.commands.set('turn it down', () => this.volumeDown());

        this.commands.set('mute', () => this.muteVolume());
        this.commands.set('silence', () => this.muteVolume());
        this.commands.set('turn off sound', () => this.muteVolume());
        this.commands.set('be quiet', () => this.muteVolume());

        this.commands.set('unmute', () => this.unmuteVolume());
        this.commands.set('turn sound back on', () => this.unmuteVolume());
        this.commands.set('sound on', () => this.unmuteVolume());

        this.commands.set('max volume', () => this.maxVolume());
        this.commands.set('full volume', () => this.maxVolume());
        this.commands.set('maximum volume', () => this.maxVolume());
        this.commands.set('turn it all the way up', () => this.maxVolume());

        this.commands.set('half volume', () => this.setVolume(50));
        this.commands.set('medium volume', () => this.setVolume(50));

        // ============================================
        // NAVIGATION
        // ============================================
        this.commands.set('go to home', () => this.showSection('dashboard'));
        this.commands.set('show home', () => this.showSection('dashboard'));
        this.commands.set('main screen', () => this.showSection('dashboard'));
        this.commands.set('home page', () => this.showSection('dashboard'));
        this.commands.set('dashboard', () => this.showSection('dashboard'));

        this.commands.set('search', () => this.showSection('search'));
        this.commands.set('find music', () => this.showSection('search'));
        this.commands.set('browse', () => this.showSection('search'));
        this.commands.set('search music', () => this.showSection('search'));
        this.commands.set('discover', () => this.showSection('search'));

        this.commands.set('library', () => this.showSection('library'));
        this.commands.set('go to library', () => this.showSection('library'));
        this.commands.set('my music', () => this.showSection('library'));
        this.commands.set('playlists', () => this.showSection('library'));
        this.commands.set('my library', () => this.showSection('library'));
        this.commands.set('show library', () => this.showSection('library'));
        this.commands.set('my playlists', () => this.showSection('library'));

        this.commands.set('profile', () => this.showSection('profile'));
        this.commands.set('go to profile', () => this.showSection('profile'));
        this.commands.set('my account', () => this.showSection('profile'));
        this.commands.set('settings', () => this.showSection('profile'));
        this.commands.set('my profile', () => this.showSection('profile'));
        this.commands.set('account settings', () => this.showSection('profile'));

        // ============================================
        // SMART COMMANDS
        // ============================================
        this.commands.set('what\'s playing', () => this.currentTrackInfo());
        this.commands.set('what is this song', () => this.currentTrackInfo());
        this.commands.set('who sings this', () => this.currentTrackInfo());
        this.commands.set('song info', () => this.currentTrackInfo());
        this.commands.set('current song', () => this.currentTrackInfo());
        this.commands.set('what song is this', () => this.currentTrackInfo());
        this.commands.set('track info', () => this.currentTrackInfo());
        this.commands.set('tell me about this song', () => this.currentTrackInfo());

        this.commands.set('play something random', () => this.playRandom());
        this.commands.set('shuffle music', () => this.playRandom());
        this.commands.set('surprise me', () => this.playRandom());
        this.commands.set('random song', () => this.playRandom());
        this.commands.set('play random', () => this.playRandom());
        this.commands.set('something random', () => this.playRandom());

        this.commands.set('trending', () => this.showTrending());
        this.commands.set('popular songs', () => this.showTrending());
        this.commands.set('what\'s hot', () => this.showTrending());
        this.commands.set('show trending', () => this.showTrending());
        this.commands.set('top songs', () => this.showTrending());
        this.commands.set('popular music', () => this.showTrending());

        // ============================================
        // LIKE/FAVORITE COMMANDS
        // ============================================
        this.commands.set('like this', () => this.likeCurrentSong());
        this.commands.set('like this song', () => this.likeCurrentSong());
        this.commands.set('add to favorites', () => this.likeCurrentSong());
        this.commands.set('favorite this', () => this.likeCurrentSong());
        this.commands.set('save this song', () => this.likeCurrentSong());
        this.commands.set('i love this', () => this.likeCurrentSong());

        this.commands.set('unlike this', () => this.unlikeCurrentSong());
        this.commands.set('remove from favorites', () => this.unlikeCurrentSong());
        this.commands.set('unfavorite', () => this.unlikeCurrentSong());

        // ============================================
        // PLAYLIST COMMANDS
        // ============================================
        this.commands.set('add to playlist', () => this.addToPlaylist());
        this.commands.set('save to playlist', () => this.addToPlaylist());
        this.commands.set('create playlist', () => this.createPlaylist());
        this.commands.set('new playlist', () => this.createPlaylist());
        this.commands.set('show playlists', () => this.showSection('library'));

        // ============================================
        // TIME/SEEKING COMMANDS
        // ============================================
        this.commands.set('fast forward', () => this.seekForward(10));
        this.commands.set('skip ahead', () => this.seekForward(10));
        this.commands.set('forward ten seconds', () => this.seekForward(10));
        this.commands.set('forward 10 seconds', () => this.seekForward(10));

        this.commands.set('rewind', () => this.seekBackward(10));
        this.commands.set('go back ten seconds', () => this.seekBackward(10));
        this.commands.set('back 10 seconds', () => this.seekBackward(10));

        this.commands.set('how long', () => this.getSongDuration());
        this.commands.set('song length', () => this.getSongDuration());
        this.commands.set('how much time left', () => this.getTimeRemaining());
        this.commands.set('time remaining', () => this.getTimeRemaining());

        // ============================================
        // INFORMATIONAL COMMANDS
        // ============================================
        this.commands.set('what time is it', () => this.tellTime());
        this.commands.set('time', () => this.tellTime());
        this.commands.set('current time', () => this.tellTime());

        this.commands.set('what date is it', () => this.tellDate());
        this.commands.set('what\'s the date', () => this.tellDate());
        this.commands.set('today\'s date', () => this.tellDate());

        // ============================================
        // FUN/PERSONALITY COMMANDS
        // ============================================
        this.commands.set('hello', () => this.greet());
        this.commands.set('hi', () => this.greet());
        this.commands.set('hey', () => this.greet());
        this.commands.set('good morning', () => this.greet());
        this.commands.set('good afternoon', () => this.greet());
        this.commands.set('good evening', () => this.greet());

        this.commands.set('how are you', () => this.respond("I'm doing great! Ready to help you with music."));
        this.commands.set('how\'s it going', () => this.respond("All systems operational and ready to rock!"));

        this.commands.set('tell me a joke', () => this.tellJoke());
        this.commands.set('joke', () => this.tellJoke());
        this.commands.set('make me laugh', () => this.tellJoke());

        this.commands.set('who are you', () => this.introduce());
        this.commands.set('what are you', () => this.introduce());
        this.commands.set('introduce yourself', () => this.introduce());

        // ============================================
        // ASSISTANT CONTROL COMMANDS
        // ============================================
        this.commands.set('thank you', () => this.thankYou());
        this.commands.set('thanks', () => this.thankYou());
        this.commands.set('appreciate it', () => this.thankYou());
        this.commands.set('good job', () => this.thankYou());

        this.commands.set('stop listening', () => this.deactivateAssistant());
        this.commands.set('never mind', () => this.deactivateAssistant());
        this.commands.set('cancel', () => this.deactivateAssistant());
        this.commands.set('go to sleep', () => this.deactivateAssistant());
        this.commands.set('that\'s all', () => this.deactivateAssistant());
        this.commands.set('goodbye', () => this.goodbye());
        this.commands.set('bye', () => this.goodbye());

        this.commands.set('help', () => this.showHelp());
        this.commands.set('what can you do', () => this.showHelp());
        this.commands.set('commands', () => this.showHelp());
        this.commands.set('show commands', () => this.showHelp());
        this.commands.set('list commands', () => this.showHelp());

        this.commands.set('repeat that', () => this.repeatLastCommand());
        this.commands.set('say that again', () => this.repeatLastCommand());
        this.commands.set('do that again', () => this.repeatLastCommand());

        console.log(`✅ Registered ${this.commands.size} voice commands`);
    }

    processCommand(transcript) {
        console.log('🔍 Processing command:', transcript);
        this.resetActivityTimeout();

        let cleanTranscript = transcript.replace(new RegExp(this.wakeWord, 'gi'), '').trim();
        cleanTranscript = cleanTranscript.replace(/^(hey|okay|hello|hi)\s+/gi, '').trim();

        console.log('🧹 Cleaned command:', cleanTranscript);

        let commandExecuted = false;

        // SEARCH COMMANDS
        if (cleanTranscript.startsWith('play ')) {
            const query = cleanTranscript.replace(/^play\s+/, '').trim();
            if (query.length > 0 && !this.isBasicCommand(query)) {
                this.triggerSearchAndPlay(query);
                commandExecuted = true;
            }
        }
                else if (cleanTranscript.startsWith('find ') ||
                         cleanTranscript.startsWith('search for ') ||
                         cleanTranscript.startsWith('search and play ') ||
                         cleanTranscript.startsWith('look for ')) {
                    const query = cleanTranscript.replace(/^(find|search for|search and play|look for)\s+/, '').trim();
                    if (query.length > 0) {
                        this.triggerSearchAndPlay(query);
                        commandExecuted = true;
                    }
                }

                // VOLUME PRECISION COMMANDS
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
                else if (cleanTranscript.match(/volume (\d+)/)) {
                    const volume = cleanTranscript.match(/volume (\d+)/)[1];
                    this.setVolume(parseInt(volume));
                    commandExecuted = true;
                }

                // SEEK COMMANDS WITH TIME
                else if (cleanTranscript.match(/forward (\d+) seconds?/)) {
                    const seconds = cleanTranscript.match(/forward (\d+) seconds?/)[1];
                    this.seekForward(parseInt(seconds));
                    commandExecuted = true;
                }
                else if (cleanTranscript.match(/back (\d+) seconds?/)) {
                    const seconds = cleanTranscript.match(/back (\d+) seconds?/)[1];
                    this.seekBackward(parseInt(seconds));
                    commandExecuted = true;
                }
                else if (cleanTranscript.match(/skip (\d+) seconds?/)) {
                    const seconds = cleanTranscript.match(/skip (\d+) seconds?/)[1];
                    this.seekForward(parseInt(seconds));
                    commandExecuted = true;
                }

                // EXACT MATCHES
                if (!commandExecuted) {
                    for (let [command, action] of this.commands) {
                        if (cleanTranscript === command) {
                            console.log(`✅ Executing: ${command}`);
                            this.lastCommand = action;
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
                            this.lastCommand = action;
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

                // Only deactivate if not a search command
                if (commandExecuted &&
                    !cleanTranscript.startsWith('play ') &&
                    !cleanTranscript.startsWith('find ') &&
                    !cleanTranscript.startsWith('search for ') &&
                    !cleanTranscript.startsWith('search and play ') &&
                    !cleanTranscript.startsWith('look for ')) {
                    setTimeout(() => this.deactivateAssistant(), 1500);
                }
            }

            isBasicCommand(query) {
                const basicCommands = ['music', 'song', 'something', 'random', 'it', 'this', '', 'that'];
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
                setTimeout(() => {
                    this.showNotification('Try saying "help" to see available commands', 'info', 3000);
                }, 2000);
            }

            // ============================================
            // ACTION METHODS
            // ============================================

            playMusic() {
                const playButton = document.getElementById('playPauseBtn');
                const playIcon = document.getElementById('playPauseIcon');

                if (playButton && playIcon) {
                    if (playIcon.classList.contains('fa-play')) {
                        playButton.click();
                        this.showNotification('Playing music', 'success');
                    } else {
                        this.showNotification('Music is already playing', 'info');
                    }
                }
            }

            pauseMusic() {
                const playButton = document.getElementById('playPauseBtn');
                const playIcon = document.getElementById('playPauseIcon');

                if (playButton && playIcon) {
                    if (playIcon.classList.contains('fa-pause')) {
                        playButton.click();
                        this.showNotification('Music paused', 'success');
                    } else {
                        this.showNotification('Music is already paused', 'info');
                    }
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

            replayTrack() {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.currentTime = 0;
                    audioPlayer.play();
                    this.showNotification('Restarting song', 'success');
                }
            }

            volumeUp() {
                this.adjustVolume(20);
                const currentVol = this.getCurrentVolume();
                this.showNotification(`Volume increased to ${currentVol}%`, 'success');
            }

            volumeDown() {
                this.adjustVolume(-20);
                const currentVol = this.getCurrentVolume();
                this.showNotification(`Volume decreased to ${currentVol}%`, 'success');
            }

            setVolume(level) {
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider) {
                    const newVolume = Math.min(Math.max(level, 0), 100);
                    volumeSlider.value = newVolume;
                    volumeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                    this.showNotification(`Volume set to ${newVolume}%`, 'success');
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

            getCurrentVolume() {
                const volumeSlider = document.getElementById('volumeSlider');
                return volumeSlider ? parseInt(volumeSlider.value) : 50;
            }

            muteVolume() {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.muted = true;
                    this.showNotification('Music muted', 'success');
                }
            }

            unmuteVolume() {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.muted = false;
                    const currentVol = this.getCurrentVolume();
                    this.showNotification(`Sound on - Volume at ${currentVol}%`, 'success');
                }
            }

            maxVolume() {
                this.setVolume(100);
            }

            // ============================================
            // SEEKING/TIME CONTROLS
            // ============================================

            seekForward(seconds) {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + seconds, audioPlayer.duration);
                    this.showNotification(`Skipped forward ${seconds} seconds`, 'success');
                }
            }

            seekBackward(seconds) {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - seconds, 0);
                    this.showNotification(`Rewound ${seconds} seconds`, 'success');
                }
            }

            getSongDuration() {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer && audioPlayer.duration) {
                    const minutes = Math.floor(audioPlayer.duration / 60);
                    const seconds = Math.floor(audioPlayer.duration % 60);
                    this.showNotification(`Song length: ${minutes}:${seconds.toString().padStart(2, '0')}`, 'info');
                } else {
                    this.showNotification('No song is playing', 'info');
                }
            }

            getTimeRemaining() {
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer && audioPlayer.duration) {
                    const remaining = audioPlayer.duration - audioPlayer.currentTime;
                    const minutes = Math.floor(remaining / 60);
                    const seconds = Math.floor(remaining % 60);
                    this.showNotification(`Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`, 'info');
                } else {
                    this.showNotification('No song is playing', 'info');
                }
            }

            // ============================================
            // NAVIGATION
            // ============================================

            showSection(sectionName) {
                if (typeof showSection === 'function') {
                    showSection(sectionName);
                    this.showNotification(`Showing ${sectionName}`, 'success');
                }
            }

            // ============================================
            // SEARCH FUNCTIONALITY
            // ============================================

            triggerSearchAndPlay(query) {
                this.showNotification(`Searching for: ${query}`, 'info');

                // Navigate to search section first
                if (typeof showSection === 'function') {
                    showSection('search');
                }

                // Wait for section to load, then use existing search function
                setTimeout(() => {
                    const searchInput = document.getElementById('searchInput');
                    if (searchInput && typeof handleSearch === 'function') {
                        searchInput.value = query;
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
                    console.log(`🔍 Attempt ${attempts}/${maxAttempts}...`);

                    const searchResults = document.getElementById('searchResults');

                    if (searchResults) {
                        // Get all track cards
                        const trackCards = searchResults.querySelectorAll('.track-card');

                        if (trackCards && trackCards.length > 0) {
                            console.log(`✅ Found ${trackCards.length} results`);

                            const firstTrack = trackCards[0];

                            // Extract data from the first track
                            const songId = firstTrack.getAttribute('data-song-id');
                            const previewUrl = firstTrack.getAttribute('data-preview-url');

                            // Get title and artist from card body
                            const titleElement = firstTrack.querySelector('.card-title');
                            const artistElement = firstTrack.querySelector('.card-text');
                            const imageElement = firstTrack.querySelector('.card-img-top');

                            const title = titleElement ? titleElement.textContent : 'Unknown';
                            const artist = artistElement ? artistElement.textContent : 'Unknown';
                            const imageUrl = imageElement ? imageElement.src : '';

                            console.log('🎵 Playing:', { title, artist, songId });

                            // ✅ Directly call the play function
                            if (typeof playSearchResult === 'function') {
                                playSearchResult(0, title, artist, songId, imageUrl, previewUrl);
                                this.showNotification(`Playing: ${title}`, 'success');
                                setTimeout(() => this.deactivateAssistant(), 2000);
                                return;
                            } else {
                                // Fallback: click the image container
                                const imgContainer = firstTrack.querySelector('.card-img-container');
                                if (imgContainer) {
                                    imgContainer.click();
                                    this.showNotification(`Playing: ${query}`, 'success');
                                    setTimeout(() => this.deactivateAssistant(), 2000);
                                    return;
                                }
                            }
                        }
                    }

                    // Check for no results
                    const noResults = document.getElementById('noResults');
                    if (noResults && noResults.style.display !== 'none') {
                        this.showNotification(`No results for: ${query}`, 'warning');
                        setTimeout(() => this.deactivateAssistant(), 1500);
                        return;
                    }

                    // Retry if not max attempts
                    if (attempts < maxAttempts) {
                        setTimeout(checkForResults, 1000);
                    } else {
                        this.showNotification('Search timeout', 'warning');
                        setTimeout(() => this.deactivateAssistant(), 1500);
                    }
                };

                setTimeout(checkForResults, 2000); // Give search more time
            }

            // ============================================
            // SMART FEATURES
            // ============================================

            currentTrackInfo() {
                const title = document.getElementById('playerTrackTitle');
                const artist = document.getElementById('playerTrackArtist');

                if (title && artist) {
                    const trackTitle = title.textContent;
                    const trackArtist = artist.textContent;

                    if (trackTitle !== 'Select a song') {
                        this.showNotification(`Now playing: ${trackTitle} by ${trackArtist}`, 'info', 5000);
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

            // ============================================
            // LIKE/PLAYLIST FEATURES
            // ============================================

            likeCurrentSong() {
                const likeBtn = document.getElementById('playerLikeBtn');
                if (likeBtn) {
                    const icon = likeBtn.querySelector('i');
                    if (icon && icon.classList.contains('far')) {
                        likeBtn.click();
                        this.showNotification('Added to liked songs', 'success');
                    } else {
                        this.showNotification('This song is already liked', 'info');
                    }
                }
            }

            unlikeCurrentSong() {
                const likeBtn = document.getElementById('playerLikeBtn');
                if (likeBtn) {
                    const icon = likeBtn.querySelector('i');
                    if (icon && icon.classList.contains('fas')) {
                        likeBtn.click();
                        this.showNotification('Removed from liked songs', 'success');
                    } else {
                        this.showNotification('This song is not liked', 'info');
                    }
                }
            }

            addToPlaylist() {
                const addBtn = document.getElementById('addToPlaylistBtn');
                if (addBtn) {
                    addBtn.click();
                    this.showNotification('Opening playlist selector', 'info');
                }
            }

            createPlaylist() {
                this.showSection('library');
                setTimeout(() => {
                    this.showNotification('Navigate to library to create a playlist', 'info');
                }, 1000);
            }

            // ============================================
            // INFORMATIONAL FEATURES
            // ============================================

            tellTime() {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;

                this.showNotification(`It's ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`, 'info', 4000);
            }

            tellDate() {
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const dateString = now.toLocaleDateString('en-US', options);

                this.showNotification(`Today is ${dateString}`, 'info', 5000);
            }

            // ============================================
            // PERSONALITY FEATURES
            // ============================================

            greet() {
                const hour = new Date().getHours();
                let greeting;

                if (hour < 12) {
                    greeting = "Good morning! Ready for some music?";
                } else if (hour < 18) {
                    greeting = "Good afternoon! What would you like to hear?";
                } else {
                    greeting = "Good evening! Let's play some music!";
                }

                this.showNotification(greeting, 'info', 4000);
            }

            respond(message) {
                this.showNotification(message, 'info', 4000);
            }

            tellJoke() {
                const jokes = [
                    "Why did the music teacher need a ladder? To reach the high notes!",
                    "What's Beethoven's favorite fruit? Ba-na-na-naaaa!",
                    "Why did the pianist keep banging his head? He was playing by ear!",
                    "What do you call a musical insect? A humbug!",
                    "Why was the musician arrested? For getting into treble!",
                    "What's a skeleton's favorite instrument? The trom-bone!",
                    "Why did the guitar go to school? To get better at chord-reading!",
                    "What do you get when you drop a piano down a mine shaft? A flat minor!"
                ];

                const joke = jokes[Math.floor(Math.random() * jokes.length)];
                this.showNotification(joke, 'info', 7000);
            }

            introduce() {
                this.showNotification("I'm your DeepTune voice assistant! I can help you control music, search for songs, and more. Say 'help' to see what I can do!", 'info', 6000);
            }

            thankYou() {
                const responses = [
                    "You're welcome!",
                    "Happy to help!",
                    "Anytime!",
                    "My pleasure!",
                    "Glad I could help!",
                    "You got it!"
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                this.showNotification(response, 'success');
            }

            goodbye() {
                const responses = [
                    "Goodbye! Enjoy your music!",
                    "See you later!",
                    "Catch you later!",
                    "Have a great day!"
                ];
                const response = responses[Math.floor(Math.random() * responses.length)];
                this.showNotification(response, 'info');
                this.deactivateAssistant();
            }

            repeatLastCommand() {
                if (this.lastCommand) {
                    this.showNotification("Repeating last command", 'info');
                    this.lastCommand();
                } else {
                    this.showNotification("No previous command to repeat", 'warning');
                }
            }

            showHelp() {
                const helpMessage = `
        🎵 DeepTune Voice Assistant - Available Commands:

        PLAYBACK:
        • "Play/Pause/Resume" - Control playback
        • "Next/Previous/Skip" - Navigate tracks
        • "Replay/Restart song" - Start over

        VOLUME:
        • "Volume up/down" - Adjust volume
        • "Volume to [number]" - Set specific level
        • "Mute/Unmute" - Toggle sound
        • "Max volume" - Set to 100%

        SEARCH:
        • "Play [song name]" - Search and play
        • "Find [song name]" - Search for music
        • "Play something random" - Surprise me

        NAVIGATION:
        • "Go home/Search/Library/Profile"
        • "Show trending" - Popular songs

       TIME CONTROLS:
       • "Forward/Back [X] seconds" - Skip time
       • "How long/Time remaining" - Track info

       SMART FEATURES:
       • "What's playing?" - Current song info
       • "Like this/Unlike this" - Favorites
       • "Add to playlist" - Save songs

       INFORMATION:
       • "What time is it?" - Current time
       • "What's the date?" - Today's date
       • "Tell me a joke" - Have fun!

       CONTROL:
       • "Help" - Show this menu
       • "Stop listening" - Deactivate
       • "Repeat that" - Redo last command
               `.trim();

               this.showNotification(helpMessage, 'info', 15000);
           }

           // ============================================
           // SOUND EFFECTS
           // ============================================

           playActivationSound() {
               // Create a simple beep sound for activation
               this.playTone(800, 100);
           }

           playDeactivationSound() {
               // Create a different beep for deactivation
               this.playTone(400, 100);
           }

           playTone(frequency, duration) {
               try {
                   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                   const oscillator = audioContext.createOscillator();
                   const gainNode = audioContext.createGain();

                   oscillator.connect(gainNode);
                   gainNode.connect(audioContext.destination);

                   oscillator.frequency.value = frequency;
                   oscillator.type = 'sine';

                   gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                   gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                   oscillator.start(audioContext.currentTime);
                   oscillator.stop(audioContext.currentTime + duration / 1000);
               } catch (error) {
                   console.log('Audio feedback not available');
               }
           }

           // ============================================
           // UI METHODS
           // ============================================

           setupUI() {
               if (!document.getElementById('voiceAssistantIndicator')) {
                   const indicator = document.createElement('div');
                   indicator.id = 'voiceAssistantIndicator';
                   indicator.innerHTML = `
                       <div class="voice-indicator">
                           <div class="voice-icon-container">
                               <i class="fas fa-microphone"></i>
                               <div class="pulse-ring"></div>
                           </div>
                           <span class="voice-status">Say "${this.wakeWord}" for help</span>
                       </div>
                   `;
                   document.body.appendChild(indicator);
                   this.addAssistantCSS();
               }
           }

           addAssistantCSS() {
               if (!document.querySelector('#voiceAssistantStyles')) {
                   const css = `
                       #voiceAssistantIndicator {
                           position: fixed;
                           bottom: 100px;
                           right: 20px;
                           z-index: 10000;
                       }

                       .voice-indicator {
                           background: rgba(29, 185, 84, 0.95);
                           color: white;
                           padding: 12px 18px;
                           border-radius: 30px;
                           font-size: 14px;
                           display: flex;
                           align-items: center;
                           gap: 10px;
                           backdrop-filter: blur(10px);
                           border: 2px solid rgba(255,255,255,0.2);
                           box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                           animation: float 3s ease-in-out infinite;
                           transition: all 0.3s ease;
                       }

                       .voice-icon-container {
                           position: relative;
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           width: 30px;
                           height: 30px;
                       }

                       .voice-indicator i {
                           font-size: 18px;
                           z-index: 2;
                       }

                       .pulse-ring {
                           position: absolute;
                           width: 100%;
                           height: 100%;
                           border: 2px solid rgba(255,255,255,0.6);
                           border-radius: 50%;
                           animation: pulse 2s ease-out infinite;
                           opacity: 0;
                       }

                       .voice-indicator.listening {
                           background: rgba(29, 185, 84, 1);
                           box-shadow: 0 4px 20px rgba(29, 185, 84, 0.6);
                       }

                       .voice-indicator.listening .pulse-ring {
                           animation: pulse 1.5s ease-out infinite;
                       }

                       .voice-indicator.active {
                           background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
                           box-shadow: 0 4px 25px rgba(255, 193, 7, 0.7);
                           transform: scale(1.05);
                       }

                       .voice-indicator.active .pulse-ring {
                           animation: pulse-fast 0.8s ease-out infinite;
                           border-color: rgba(255,255,255,0.8);
                       }

                       .voice-status {
                           font-weight: 500;
                           white-space: nowrap;
                       }

                       @keyframes pulse {
                           0% {
                               transform: scale(0.8);
                               opacity: 1;
                           }
                           100% {
                               transform: scale(1.8);
                               opacity: 0;
                           }
                       }

                       @keyframes pulse-fast {
                           0% {
                               transform: scale(0.8);
                               opacity: 1;
                           }
                           100% {
                               transform: scale(2);
                               opacity: 0;
                           }
                       }

                       @keyframes float {
                           0%, 100% {
                               transform: translateY(0px);
                           }
                           50% {
                               transform: translateY(-10px);
                           }
                       }

                       /* Responsive design */
                       @media (max-width: 768px) {
                           #voiceAssistantIndicator {
                               bottom: 80px;
                               right: 10px;
                           }

                           .voice-indicator {
                               font-size: 12px;
                               padding: 10px 15px;
                           }

                           .voice-icon-container {
                               width: 25px;
                               height: 25px;
                           }

                           .voice-indicator i {
                               font-size: 16px;
                           }

                           .voice-status {
                               max-width: 150px;
                               overflow: hidden;
                               text-overflow: ellipsis;
                           }
                       }

                       @media (max-width: 480px) {
                           .voice-status {
                               display: none;
                           }

                           .voice-indicator {
                               padding: 10px;
                               border-radius: 50%;
                           }
                       }

                       /* Custom SweetAlert2 styling for voice notifications */
                       .swal2-popup.swal2-toast {
                           background: rgba(18, 18, 18, 0.95) !important;
                           color: white !important;
                           border: 1px solid rgba(29, 185, 84, 0.3);
                       }

                       .swal2-popup.swal2-toast .swal2-title {
                           color: white !important;
                       }

                       .swal2-popup.swal2-toast .swal2-icon {
                           border-color: rgba(29, 185, 84, 0.5) !important;
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
                   indicator.classList.remove('active', 'listening');

                   if (this.isActive) {
                       indicator.classList.add('active');
                       indicator.querySelector('.voice-status').textContent = 'Listening - Say your command';
                   } else if (this.isListening) {
                       indicator.classList.add('listening');
                       indicator.querySelector('.voice-status').textContent = `Say "${this.wakeWord}" to activate`;
                   } else {
                       indicator.querySelector('.voice-status').textContent = 'Voice assistant offline';
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
                       timerProgressBar: true,
                       background: 'rgba(18, 18, 18, 0.95)',
                       color: 'white',
                       didOpen: (toast) => {
                           toast.addEventListener('mouseenter', Swal.stopTimer);
                           toast.addEventListener('mouseleave', Swal.resumeTimer);
                       }
                   });
               } else {
                   console.log(`🎤 ${type.toUpperCase()}: ${message}`);

                   // Fallback notification
                   const notification = document.createElement('div');
                   notification.style.cssText = `
                       position: fixed;
                       top: 20px;
                       right: 20px;
                       background: rgba(18, 18, 18, 0.95);
                       color: white;
                       padding: 15px 20px;
                       border-radius: 10px;
                       border: 1px solid rgba(29, 185, 84, 0.3);
                       z-index: 10001;
                       max-width: 300px;
                       animation: slideIn 0.3s ease;
                   `;
                   notification.textContent = message;
                   document.body.appendChild(notification);

                   setTimeout(() => {
                       notification.style.animation = 'slideOut 0.3s ease';
                       setTimeout(() => notification.remove(), 300);
                   }, duration);
               }
           }
       }

       // ============================================
       // INITIALIZATION
       // ============================================

       let voiceAssistant;

       // Wait for DOM and search functionality to load
       document.addEventListener('DOMContentLoaded', function() {
           console.log('🎤 Preparing voice assistant...');

           // Wait for page to fully load and ensure search.js is loaded
           setTimeout(() => {
               try {
                   voiceAssistant = new VoiceAssistant();
                   window.voiceAssistant = voiceAssistant;

                   console.log('🚀 Alexa-style voice assistant ready!');
                   console.log('💡 Say "' + voiceAssistant.wakeWord + '" followed by your command');
                   console.log('📋 Available features:');
                   console.log('   ✅ 100+ voice commands');
                   console.log('   ✅ Automatic volume ducking');
                   console.log('   ✅ Smart search and play');
                   console.log('   ✅ Personality responses');
                   console.log('   ✅ Time and information queries');
                   console.log('   ✅ Playlist management');

                   // Show welcome notification
                   setTimeout(() => {
                       if (voiceAssistant) {
                           voiceAssistant.showNotification(
                               `Voice assistant ready! Say "${voiceAssistant.wakeWord}" to start`,
                               'success',
                               4000
                           );
                       }
                   }, 2000);

               } catch (error) {
                   console.error('❌ Failed to initialize voice assistant:', error);
               }
           }, 3000);
       });

       // Keyboard shortcut to manually activate (Ctrl+Space)
       document.addEventListener('keydown', function(event) {
           if (event.ctrlKey && event.code === 'Space') {
               event.preventDefault();
               if (voiceAssistant && !voiceAssistant.isActive) {
                   voiceAssistant.activateAssistant();
               }
           }
       });

       // Add slideIn/slideOut animations
       const animationStyles = document.createElement('style');
       animationStyles.textContent = `
           @keyframes slideIn {
               from {
                   transform: translateX(400px);
                   opacity: 0;
               }
               to {
                   transform: translateX(0);
                   opacity: 1;
               }
           }

           @keyframes slideOut {
               from {
                   transform: translateX(0);
                   opacity: 1;
               }
               to {
                   transform: translateX(400px);
                   opacity: 0;
               }
           }
       `;
       document.head.appendChild(animationStyles);

       console.log('✅ VoiceController.js loaded successfully');