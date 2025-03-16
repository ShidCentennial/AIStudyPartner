var speech = true;
let isRecording = false; // Track if speech recognition is active
let hasPermission = false; // Track if permission is granted
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;

const words = document.querySelector('.words');
const p = document.getElementById('p');
const startBtn = document.getElementById('startBtn'); // Button reference

// Listen for speech results and update the <p> element
recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
    
    p.textContent = transcript;
    console.log(transcript);
});

// Listen for recognition starting
recognition.addEventListener('start', () => {
    console.log('Speech recognition started.');
    isRecording = true;  // Set recording flag to true
    startBtn.textContent = "Stop Recording"; // Change button text to stop recording
});

// Listen for recognition stopping
recognition.addEventListener('end', () => {
    console.log('Speech recognition ended.');
    isRecording = false;  // Set recording flag to false
    startBtn.textContent = "Start Recording"; // Change button text to start recording again
});

// Function to toggle speech recognition
startBtn.addEventListener('click', () => {
    if (!hasPermission) {
        recognition.start(); // Start recognition, request permission on the first click
        hasPermission = true; // Mark permission as granted after first start
    } else if (isRecording) {
        recognition.stop();  // Stop recording if already recording
    } else {
        recognition.start();  // Start recording again if it's not recording
    }
});
