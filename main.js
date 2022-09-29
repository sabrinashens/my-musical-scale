document.addEventListener("DOMContentLoaded", function(event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime)
    globalGain.connect(audioCtx.destination);

    const keyboardFrequencyMap = {
	/*Linear musical scale*/
        '81': 261.63,  //Q
        '87': 299,  //W
        '69': 336.38,  //E
        '82': 373.76,  //R
        '84': 411.13,  //T
        '89': 448.51,  //Y
        '85': 485.88,  //U
        '73': 523.25,  //I

	/*Exponential musical scale*/
        '65': 261.63, //A
        '83': 264.36, //S
        '68': 269.81, //D
        '70': 283.43, //F
        '71': 310.69,  //G
        '72': 354.29,  //H
        '74': 419.70, //J
        '75': 523.25, //K

    /* just intonation*/
        '90': 261.63, //Z
        '88': 293.66, //X
        '67': 329.63, //C
        '86': 349.23, //V
        '66': 392,  //B
        '78': 440,  //N
        '77': 493.88, //M
        '188': 523.25, //,
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

