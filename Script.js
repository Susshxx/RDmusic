 let isPlaying = false;
        let currentTrack = 0;
        let currentAlbum = 'album1';
        
        const albums = {
            album1: {
                name: 'Album 1',
                coverImage: '', // User will add this
                tracks: [
                    { title: 'Song Name', album: 'Album 1', duration: '4:20' },
                    { title: 'Window Seat', album: 'Album 1', duration: '3:48' },
                    { title: 'Pink Morning', album: 'Album 1', duration: '4:06' },
                    { title: 'Afterglow', album: 'Album 1', duration: '3:32' }
                ]
            },
            album2: {
                name: 'Album 2',
                coverImage: '', // User will add this
                tracks: [
                    { title: 'Midnight Drive', album: 'Album 2', duration: '3:55' },
                    { title: 'City Lights', album: 'Album 2', duration: '4:12' },
                    { title: 'Neon Dreams', album: 'Album 2', duration: '3:33' },
                    { title: 'Sunset Boulevard', album: 'Album 2', duration: '4:45' }
                ]
            },
            solos: {
                name: 'Solos',
                coverImage: '', // User will add this
                tracks: [
                    { title: 'Piano Solo', album: 'Solos', duration: '2:30' },
                    { title: 'Guitar Solo', album: 'Solos', duration: '3:15' },
                    { title: 'Violin Solo', album: 'Solos', duration: '2:45' },
                    { title: 'Drum Solo', album: 'Solos', duration: '1:58' }
                ]
            }
        };
        
        let tracks = albums.album1.tracks;

        const recordGroup = document.querySelector('#recordGroup');
        const tonearm = document.querySelector('#tonearm');
        const volumeControl = document.querySelector('#volumeControl');
        const volumeLevel = document.querySelector('.volume-level');
        const volumeKnob = document.querySelector('#volumeKnob');
        const shuffleButton = document.querySelector('#shuffleButton');
        const previousButton = document.querySelector('#prevButton');
        const nextButton = document.querySelector('#nextButton');
        const shuffleIcon = document.querySelector('.shuffle-icon');
        const loopIcon = document.querySelector('.loop-icon');
        const loopOneIcon = document.querySelector('.loop-one-icon');
        const queueButton = document.querySelector('#queueButton');
        const queuePanel = document.querySelector('#queuePanel');
        const queueList = document.querySelector('#queueList');
        const queueHeading = document.querySelector('#queueHeading');
        const songTitle = document.querySelector('.song-copy p');
        const albumTitle = document.querySelector('.song-copy span');
        const trackDuration = document.querySelector('#trackDuration');
        const nextSongName = document.querySelector('#nextSongName');
        const turntableDropZone = document.querySelector('#turntableDropZone');
        const albumCards = document.querySelectorAll('.album-card');
        let volume = 68;
        let playbackMode = 0;

        function renderQueue() {
            queueList.replaceChildren();
            tracks.forEach((track, index) => {
                const item = document.createElement('li');
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = `${String(index + 1).padStart(2, '0')}  ${track.title}`;
                button.classList.toggle('is-current', index === currentTrack);
                button.addEventListener('click', () => selectTrack(index));
                item.append(button);
                queueList.append(item);
            });
        }

        function loadAlbum(albumId) {
            currentAlbum = albumId;
            tracks = albums[albumId].tracks;
            currentTrack = 0;
            const track = tracks[currentTrack];
            songTitle.textContent = track.title;
            albumTitle.textContent = track.album;
            trackDuration.textContent = track.duration;
            nextSongName.textContent = `up next: ${tracks[(currentTrack + 1) % tracks.length].title}`;
            updateQueueHeading();
            renderQueue();
            setPlaying(true);
        }

        // Drag and drop functionality
        albumCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.album);
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        turntableDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            turntableDropZone.classList.add('drag-over');
        });

        turntableDropZone.addEventListener('dragleave', () => {
            turntableDropZone.classList.remove('drag-over');
        });

        turntableDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            turntableDropZone.classList.remove('drag-over');
            
            const albumId = e.dataTransfer.getData('text/plain');
            if (albumId && albums[albumId]) {
                loadAlbum(albumId);
                
                // Hide the vinyl disc for the dragged album
                const draggedCard = document.querySelector(`[data-album="${albumId}"]`);
                if (draggedCard) {
                    const disc = draggedCard.querySelector('.album-disc');
                    if (disc) {
                        disc.style.display = 'none';
                    }
                }
            }
        });

        function selectTrack(index) {
            currentTrack = (index + tracks.length) % tracks.length;
            const track = tracks[currentTrack];
            songTitle.textContent = track.title;
            albumTitle.textContent = track.album;
            trackDuration.textContent = track.duration;
            nextSongName.textContent = `up next: ${tracks[(currentTrack + 1) % tracks.length].title}`;
            renderQueue();
            setPlaying(true);
        }

        function updateQueueHeading() {
            if (queueHeading && albums[currentAlbum]) {
                queueHeading.textContent = albums[currentAlbum].name;
            }
        }

        function setPlaying(nextState) {
            isPlaying = nextState;
            recordGroup.classList.toggle('is-spinning', isPlaying);
            tonearm.classList.toggle('is-playing', isPlaying);
            tonearm.setAttribute('aria-pressed', String(isPlaying));
            tonearm.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
        }

        tonearm.addEventListener('click', () => setPlaying(!isPlaying));
        tonearm.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setPlaying(!isPlaying);
            }
        });

        // Initialize with album 1
        updateQueueHeading();

        function moveVolume(amount) {
            volume = Math.max(0, Math.min(100, volume + amount));
            const knobY = 393 - (volume * 0.6);
            volumeLevel.setAttribute('y2', String(knobY));
            volumeKnob.setAttribute('cy', String(knobY));
            volumeControl.setAttribute('aria-valuenow', String(volume));
        }

        volumeControl.addEventListener('click', (event) => {
            const bounds = volumeControl.getBoundingClientRect();
            const nextVolume = Math.round((1 - ((event.clientY - bounds.top) / bounds.height)) * 100);
            volume = Math.max(0, Math.min(100, nextVolume));
            moveVolume(0);
        });
        volumeControl.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') moveVolume(-10);
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') moveVolume(10);
        });
        shuffleButton.addEventListener('click', () => {
            playbackMode = (playbackMode + 1) % 3;
            shuffleIcon.classList.toggle('is-hidden', playbackMode !== 0);
            loopIcon.classList.toggle('is-hidden', playbackMode !== 1);
            loopOneIcon.classList.toggle('is-hidden', playbackMode !== 2);
            shuffleButton.classList.toggle('is-active', playbackMode !== 0);
            shuffleButton.setAttribute('aria-pressed', String(playbackMode !== 0));
            shuffleButton.setAttribute('aria-label', ['Shuffle tracks', 'Loop tracks', 'Loop current track'][playbackMode]);
        });
        previousButton.addEventListener('click', () => selectTrack(currentTrack - 1));
        nextButton.addEventListener('click', () => selectTrack(currentTrack + 1));
        queueButton.addEventListener('click', () => {
            const isOpen = !queuePanel.hasAttribute('hidden');
            queuePanel.toggleAttribute('hidden', isOpen);
            queueButton.setAttribute('aria-expanded', String(!isOpen));
            if (!isOpen) {
                updateQueueHeading();
                renderQueue();
            }
        });