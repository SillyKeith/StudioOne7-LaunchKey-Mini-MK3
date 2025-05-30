include_file("resource://com.presonus.musicdevices/sdk/controlsurfacedevice.js");
include_file("resource://com.presonus.musicdevices/sdk/midiprotocol.js");
include_file("LaunchkeyProtocol.js");

class LaunchKeyBasicMidiDevice extends PreSonus.ControlSurfaceDevice {
    constructor() {
        super();
        this.handlers = {};
    }

    onInit(hostDevice) {
        super.onInit(hostDevice);
        this.debugLog = true;
    }

    onMidiOutConnected(state) {
        super.onMidiOutConnected(state);
        if (!state) 
            return; 
        this.log("BASIC MIDI:   (onMidiOutConnected) MIDI Out device");
        this.sendMidi(PreSonus.Midi.kNoteOff | 15, 0x00, 0x7F);
        this.hostDevice.invalidateAll();
    }

    onExit() {
        this.sendMidi(PreSonus.Midi.kNoteOff | 15, 0x00, 0x00);
        super.onExit();
    }
}

// factory entry called by host
function createLaunchkeyBasicDeviceInstance() {
    return new LaunchKeyBasicMidiDevice();
}
