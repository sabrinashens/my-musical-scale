document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime)
    globalGain.connect(audioCtx.destination);

    const keyboardFrequencyMap = {
	/*Exponential musical scale*/
        '65': 500, //A
        '83': 522, //S
        '68': 557, //D
        '70': 603, //F
        '71': 657,  //G
        '72': 718,  //H
        '74': 783, //J
        '75': 853, //K

    /* just intonation*/
        '90': 261, //Z
        '88': 279, //X
        '67': 302, //C
        '86': 328, //V
        '66': 359,  //B
        '78': 392,  //N
        '77': 426, //M
    }
    
    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillators = {}
    gainNode = {}

    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
         playNote(key);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            gainNode[key].gain.cancelScheduledValues(audioCtx.currentTime);
            gainNode[key].gain.setValueAtTime(gainNode[key].gain.value, audioCtx.currentTime); //begin at current value
            gainNode[key].gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1); //ramp down
            gainNode[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.1)
            activeOscillators[key].stop(audioCtx.currentTime + 0.15);
            delete activeOscillators[key];
            delete gainNode[key];
        }
    }

    function playNote(key) {
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.type = 'sine';

        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        osc.start();

        const nodeNum = Object.keys(key).length; //number of notes pressed
        Object.keys(key).forEach(function(key) { //lower amp
            gain.gain.linearRampToValueAtTime(0.8/nodeNum, audioCtx.currentTime + 0.1); //ramp up
            gain.gain.exponentialRampToValueAtTime(0.75/nodeNum, audioCtx.currentTime + 0.2); //decay down to sustain level
        });

        activeOscillators[key] = osc
        gainNode[key] = gain;
     }
})

