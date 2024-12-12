// Global Variables
let videos = [];
let player;
let shuffledVideos = [];
let currentVideoIndex = 0;
const skipAmount = 10; // seconds to skip forward or backward
let interactionTimer;

// Fetching Videos from YouTube Playlist
function fetchPlaylistItems() {
    const playlistId = 'PL55EHxewVfr_eBZ9Qiw4-ivuRqXnjY9EM';
    const apiKey = 'AIzaSyDyA5qYffsGkp0vjIs_adMoyzqpk06nw-Q';

    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${apiKey}&maxResults=50`)
        .then(response => response.json())
        .then(data => {
            videos = data.items.map(item => item.snippet.resourceId.videoId);
            shuffleVideos();
            onYouTubeIframeAPIReady();
        })
        .catch(error => console.error('Error fetching playlist items:', error));
}

// Shuffling Videos Array
function shuffleVideos() {
    shuffledVideos = videos
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

fetchPlaylistItems();

// Dynamically load the YouTube IFrame Player API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// YouTube Iframe API Ready
function onYouTubeIframeAPIReady() {
    if (!shuffledVideos.length) return;

    player = new YT.Player('videoContainer', {
        height: '100%',
        width: '100%',
        videoId: shuffledVideos[0],
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'disablekb': 1,
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

// Player Event Handlers
function onPlayerReady(event) {
    event.target.playVideo();
    player.setPlaybackQuality('highres');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.CUED) {
        player.setPlaybackQuality('highres');
    } else if (event.data === YT.PlayerState.ENDED) {
        playNextVideo();
    }
}

function onPlayerError(event) {
    console.error('Player error:', event.data);
    if (event.data === 101 || event.data === 150) {
        console.error('Video unavailable for embedding. Skipping to next video.');
        playNextVideo();
    }
}

// Video Playback Control Functions
function playNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % shuffledVideos.length;
    player.loadVideoById(shuffledVideos[currentVideoIndex]);
}

function playPreviousVideo() {
    currentVideoIndex = (currentVideoIndex - 1 + shuffledVideos.length) % shuffledVideos.length;
    player.loadVideoById(shuffledVideos[currentVideoIndex]);
}

// Keyboard Controls for Video Navigation
document.addEventListener('keydown', function(event) {
    if (event.shiftKey && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
        handleShiftArrowControls(event);
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        playNextVideo();
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        playPreviousVideo();
    } else if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
    }
});

// Handle Shift + Arrow Key Controls for Fast Forward and Rewind
function handleShiftArrowControls(event) {
    event.preventDefault();
    if (player && typeof player.getCurrentTime === 'function') {
        const currentTime = player.getCurrentTime();

        if (event.key === 'ArrowRight') {
            // Fast-forward the video
            player.seekTo(currentTime + skipAmount, true);
        } else if (event.key === 'ArrowLeft') {
            // Rewind the video
            player.seekTo(Math.max(currentTime - skipAmount, 0), true);
        }
    }
}

// Toggle Play and Pause
function togglePlayPause() {
    if (player && typeof player.getPlayerState === 'function') {
        const playerState = player.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.CUED) {
            player.playVideo();
        }
    }
}

// Welcome Modal Control
document.getElementById('startButton').addEventListener('click', function() {
    document.getElementById('welcomeModal').style.display = 'none';
    if (player && typeof player.playVideo === 'function') {
        player.playVideo();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        // Check if the modal is displayed
        const modal = document.getElementById('welcomeModal');
        const startButton = document.getElementById('startButton');

        if (modal.style.display !== 'none' && startButton) {
            startButton.click(); // Programmatically click the Start button
        }
    }
});

// Idle hide timer
// Global Variables
let idleTimer = null;
let periodicShowTimer = null;
const idleTime = 5000; // Time in milliseconds before hiding the header (20 seconds)
const showInterval = 40000; // Time in milliseconds to periodically show the header (40 seconds)

function hideHeader() {
    document.getElementById("header").classList.add("inactive");
}

function showHeader() {
    document.getElementById("header").classList.remove("inactive");
}

// Function to reset the idle timer
function resetIdleTimer() {
    clearTimeout(idleTimer);
    showHeader(); // Show header when the mouse is moved or periodically
    idleTimer = setTimeout(hideHeader, idleTime);
}

// Function to periodically show the header
function setupPeriodicShow() {
    clearInterval(periodicShowTimer); // Clear existing interval if any
    periodicShowTimer = setInterval(resetIdleTimer, showInterval); // Reset idle timer periodically
}

// Set up the timers initially
resetIdleTimer();
setupPeriodicShow();

// Reset the idle timer on mouse movement
window.addEventListener('mousemove', resetIdleTimer);

// Toaster Titles
function onPlayerReady(event) {
    event.target.playVideo();
    player.setPlaybackQuality('highres');
    updateVideoInfo(shuffledVideos[0]); // Update the video info when the player is ready
}

function updateVideoInfo(videoId) {
    // Fetch video details from YouTube API
    fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=AIzaSyDyA5qYffsGkp0vjIs_adMoyzqpk06nw-Q`)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                const videoDetails = data.items[0].snippet;
                const title = videoDetails.title;
                const creator = videoDetails.channelTitle;
                const dateCreated = new Date(videoDetails.publishedAt).toLocaleDateString();

                // Update toaster content without prefixes
                document.getElementById('videoTitle').textContent = title;
                document.getElementById('videoCreator').textContent = creator;
                // document.getElementById('videoDate').textContent = dateCreated;

                // Show toaster with fade-in effect
                const infoElement = document.getElementById('videoInfo');
                infoElement.classList.add('visible'); // Add the 'visible' class to show the toaster

                // Hide toaster after 5 seconds with fade-out effect
                setTimeout(() => {
                    infoElement.classList.remove('visible'); // Remove the 'visible' class to start fade-out
                }, 5000);
            }
        })
        .catch(error => console.error('Error fetching video details:', error));
}

// Function to show the toaster when the mouse moves
function showToaster() {
    const infoElement = document.getElementById('videoInfo');
    if (infoElement && !infoElement.classList.contains('visible')) {
        updateVideoInfo(shuffledVideos[currentVideoIndex]); // Update with current video info
    }
}

// Add mousemove event listener to show toaster
window.addEventListener('mousemove', showToaster);

function playNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % shuffledVideos.length;
    const nextVideoId = shuffledVideos[currentVideoIndex];
    player.loadVideoById(nextVideoId);
    updateVideoInfo(nextVideoId); // Call updateVideoInfo to show toaster
}

// Ensure the updateVideoInfo function is called when the player is ready
function onPlayerReady(event) {
    event.target.playVideo();
    updateVideoInfo(shuffledVideos[0]); // Call updateVideoInfo to show toaster for the first video
}

// Function to show arrow buttons
function showArrows() {
    document.getElementById('left-arrow').classList.add('visible');
    document.getElementById('right-arrow').classList.add('visible');
}

// Function to hide arrow buttons
function hideArrows() {
    document.getElementById('left-arrow').classList.remove('visible');
    document.getElementById('right-arrow').classList.remove('visible');
}

// Mouse movement event listener to show arrows
window.addEventListener('mousemove', () => {
    showArrows();
    clearTimeout(idleTimer); // Reset the idle timer
    idleTimer = setTimeout(() => {
        hideArrows(); // Hide arrows after period of inactivity
    }, idleTime);
});

// Arrow button click event listeners
document.getElementById('left-arrow').addEventListener('click', playPreviousVideo);
document.getElementById('right-arrow').addEventListener('click', playNextVideo);

// Hide arrows initially
hideArrows();
