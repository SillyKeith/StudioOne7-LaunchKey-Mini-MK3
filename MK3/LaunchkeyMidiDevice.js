include_file("resource://com.presonus.musicdevices/sdk/midiprotocol.js");
include_file("resource://com.presonus.musicdevices/sdk/controlsurfacedevice.js");
include_file("LaunchkeyProtocol.js");

/**
 * Handles Pad Layout mode changes by processing MIDI events on Channel 16.
 * Updates the device's mode if the MIDI event matches the expected format.
 */
class LayoutChangeHandler extends PreSonus.ControlHandler {
    constructor(name, param) {
        super();
        this.name = name;
        this.param = param; // Reference to the parameter
    }

    // Called when a MIDI message is received
    receiveMidi(status, data1, data2) {
        if (status !== 0xBF || data1 !== 0x03) {
            return super.receiveMidi(status, data1, data2);
        }
        this.log(
            `DAW MIDI: (receiveMidi) status: 0x${status.toString(16).toUpperCase()} (${status}), ` +
            `data1: 0x${data1.toString(16).toUpperCase()} (${data1}), ` +
            `data2: 0x${data2.toString(16).toUpperCase()} (${data2})`
        );
        if (this.param) {
            this.param.updateValue(data2); // Update parameter, notifies component
        }
        return true;
    }

    // Called when the parameter value changes and needs to be sent to the device
    sendValue(value, flags) {
        if (value == null) return;
        if (!this.device.midiConnected) return;
        this.log(`DAW MIDI: (sendValue) Sending Layout mode: ${value}`);
        this.device.sendMidi(0xBF, 0x03, value);
    }
}

/**
 * Base class for handling individual pads on the launchkey.
 */
class PadHandler extends PreSonus.ControlHandler {
    constructor(controlName, padIndex) {
        super();
        this.name = controlName;
        this.padIndex = padIndex;
    }
}

/**
 * Handles the state of a pad's LED, such as turning it on or off.
 */
class PadStateLEDHandler extends PadHandler {
    /**
     * Updates the pad's state and sends the updated state to the device.
     * @param {number} value - The new state value.
     * @param {number} flags - Additional flags for the operation.
     */
    sendValue(value, flags) {
        this.log(`PadStateLEDHandler: padIndex=${this.padIndex}, value=${value}, flags=${flags}`);
        if (!this.device.midiConnected) return;
        let launchkeyDevice = this.device;
        let pad = launchkeyDevice.pads[this.padIndex];
        pad.setState(value);
        this.log(`PadStateLEDHandler: pad.state=${pad.state}, pad.colorIndex=${pad.colorIndex}, pad.animation=${pad.animation}`);
        launchkeyDevice.sendPadState(this.padIndex);
    }
}

/**
 * Handles the animation of a pad's LED, such as blinking or pulsing.
 */
class PadAnimationLEDHandler extends PadHandler {
    /**
     * Updates the pad's animation and sends the updated state to the device.
     * @param {number} value - The new animation value.
     * @param {number} flags - Additional flags for the operation.
     */
    sendValue(value, flags) {
        this.log(`PadAnimationLEDHandler: padIndex=${this.padIndex}, value=${value}, flags=${flags}`);
        if (!this.device.midiConnected) return;
        let launchkeyDevice = this.device;
        let pad = launchkeyDevice.pads[this.padIndex];
        pad.setAnimation(value);
        this.log(`PadAnimationLEDHandler: pad.state=${pad.state}, pad.colorIndex=${pad.colorIndex}, pad.animation=${pad.animation}`);
        launchkeyDevice.sendPadState(this.padIndex);
    }
}


/**
 * Handles the color of a pad's LED by setting its color index.
 */
class PadColorLEDHandler extends PadHandler {
    /**
     * Updates the pad's color and sends the updated state to the device.
     * @param {number} value - The new color index.
     * @param {number} flags - Additional flags for the operation.
     */
    sendValue(value, flags) {
        this.log(`PadColorLEDHandler: padIndex=${this.padIndex}, value=${value}, flags=${flags}`);
        if (!this.device.midiConnected) return;
        let launchkeyDevice = this.device;
        let pad = launchkeyDevice.pads[this.padIndex];
        pad.setColorIndex(value);
        this.log(`PadColorLEDHandler: pad.state=${pad.state}, pad.colorIndex=${pad.colorIndex}, pad.animation=${pad.animation}`);
        launchkeyDevice.sendPadState(this.padIndex);
    }
}

/**
 * Represents the state of an individual pad on the launchkey.
 * Encapsulates properties such as the MIDI note number, state (on/off),
 * color index, and animation type. Provides methods to manipulate and
 * retrieve these properties.
 */
class LaunchkeyPadState {
    /**
     * Initializes a new instance of the launchkeyPadState class.
     * @param {boolean} state - The current state of the pad (true for active, false for inactive).
     * @param {number} colorIndex - The color index of the pad.
     * @param {number} animation - The animation type applied to the pad.
     */
    constructor(state, colorIndex, animation) {
        this.state = state;
        this.colorIndex = colorIndex;
        this.animation = animation;
    }

    /**
     * Updates the state of the pad (on/off).
     * @param {boolean} state - The new state of the pad.
     */
    setState(state) {
        this.state = state;
    }

    /**
     * Updates the animation type of the pad.
     * @param {number} animation - The new animation type.
     */
    setAnimation(animation) {
        this.animation = animation;
    }

    /**
     * Returns the channel offset for the animation type, based on the current layout.
     * @param {string} layout - 'session' or 'drum'
     */
    getAnimationStatus(layout) {
        if (layout === 'session') {
            switch (this.animation) {
                case PreSonus.PadSectionPadAnimation.kNone:
                    return LaunchkeyProtocol.kSessionAnimationStatic;
                case PreSonus.PadSectionPadAnimation.kBlink:
                    return LaunchkeyProtocol.kSessionAnimationFlash;
                case PreSonus.PadSectionPadAnimation.kPulse:
                    return LaunchkeyProtocol.kSessionAnimationPulse;
                default:
                    return LaunchkeyProtocol.kSessionAnimationStatic;
            }
        } else if (layout === 'drum') {
            switch (this.animation) {
                case PreSonus.PadSectionPadAnimation.kNone:
                    return LaunchkeyProtocol.kDrumAnimationStatic;
                case PreSonus.PadSectionPadAnimation.kBlink:
                    return LaunchkeyProtocol.kDrumAnimationFlash;
                case PreSonus.PadSectionPadAnimation.kPulse:
                    return LaunchkeyProtocol.kDrumAnimationPulse;
                default:
                    return LaunchkeyProtocol.kDrumAnimationStatic;
            }
        }
        // Default to session static if unknown
        return LaunchkeyProtocol.kSessionAnimationStatic;
    }

    setColorIndex(index) {
        this.colorIndex = index;
    }

    getColorIndex() {
        return this.colorIndex;  // Always return the color index, even if state is false
    }
}

/**
 * Represents a generic Launchkey MIDI device.
 * Manages the initialization, pad states, button handlers, and MIDI communication.
 * This class serves as a base for specific Launchkey models.
 */
class LaunchkeyMidiDevice extends PreSonus.ControlSurfaceDevice {
     /**
     * Initializes a new instance of the LaunchkeyMidiDevice class.
     * @param {number} padCount - The number of pads on the Launchkey device.
     */
     constructor(padCount) {
        super();
        this.padCount = padCount;
        this.pads = [];
        this.midiConnected = false;
        this.currentLayout = 'session'; // or 'drum'
        this.currentBank = 0; // 0 or 1
        for (let padIndex = 0; padIndex < padCount; padIndex++)
            this.pads.push(new LaunchkeyPadState(false, 0, PreSonus.PadSectionPadAnimation.kNone));
    }
    
    onInit(hostDevice) {
        super.onInit(hostDevice);
        this.debugLog = true;
        this.initPadStates();
    }
   
    enableInControlMode(bool) {
        this.sendMidi(0x9F, 0x0C, bool ? 0x7F : 0x00);
    }

    /**
     * Cleans up the device when it is disconnected or shut down.
     * Sends a Midi Noteoff message to turn off DAW mode.
     */
    onExit() {
        //this.sendMidi(PreSonus.Midi.kNoteOff | 15, 0x00, 0x00);
        this.enableInControlMode(true);
        this.enableInControlMode(false);
        super.onExit();
    }

    createHandler(name, attributes) {
        let className = attributes.getAttribute("class");
        // Extract padIndex from the control name, e.g. "padLEDColor[3]" → 3
        let padIndexMatch = name.match(/\[(\d+)\]/);
        let padIndex = padIndexMatch ? parseInt(padIndexMatch[1], 10) : 0;
        let handler = null;
        if (className == "LayoutChangeHandler")
            handler = new LayoutChangeHandler(name, padIndex);
        else if (className == "PadStateLEDHandler"){
            //this.log(`DAW MIDI:     Creating PadStateLEDHandler for ${name}: padIndex: ${padIndex}`);
            handler = new PadStateLEDHandler(name, padIndex);
        }
        else if (className == "PadAnimationLEDHandler"){
            //this.log(`DAW MIDI:     Creating PadAnimationLEDHandler for ${name}: padIndex: ${padIndex}`);
            handler = new PadAnimationLEDHandler(name, padIndex);
        }
        else if (className == "PadColorLEDHandler"){
            //this.log(`DAW MIDI:     Creating PadColorLEDHandler for ${name}: padIndex: ${padIndex}`);
            handler = new PadColorLEDHandler(name, padIndex);
        }
        else
            return false;
        if (!handler)
            return false;
        this.addHandler(handler);
        return true;
    }

    /**
     * Handles the connection state of the MIDI output.
     * Sends a NoteOFF message to enable DAW mode if the output is connected.
     * @param {boolean} state - True if the MIDI output is connected, false otherwise.
     */
    onMidiOutConnected(state) {
        super.onMidiOutConnected(state);
        this.midiConnected = state;  // Keep track of the connection state so we can use it in the handlers
        if (!state) 
            return;
        this.log("DAW MIDI:     (onMidiOutConnected) MIDI Out Device connected");
        this.enableInControlMode(false); // Force an OFF to clear leftovers
        this.enableInControlMode(true);  // Enable DAW mode - Sends 9Fh 0Ch 7Fh
        this.sendMidi(0xBF, 0x03, 0x02); // Enable Session layout on PADS (Default)
        this.sendMidi(0xBF, 0x09, 0x03); // Enable Pan mode on POTS (Default)
        //this.sendMidi(0xBF, 0x03, 0x02); // Enable Session layout on PADS (Default)
        this.hostDevice.invalidateAll();
    }
    

    sendPadState(padIndex) {
        const pad = this.pads[padIndex];
        const layout = this.currentLayout; // 'session' or 'drum'
        let row = padIndex < 8 ? 0 : 1;
        let col = padIndex % 8;
        const note = LaunchkeyProtocol.PAD_BANKS[layout][row][col];
        const channelOffset = pad.getAnimationStatus(layout); // e.g. 0,1,2 for session; 9,10,11 for drum
        const status = PreSonus.Midi.kNoteOn | channelOffset; // Note On, correct channel
        const offstatus = PreSonus.Midi.kNoteOff | channelOffset; // Note Off, correct channel
        const velocity = pad.getColorIndex();
        if (velocity) {
            this.sendMidi(status, note, velocity);
        }
        else {
            this.sendMidi(offstatus, note, 0x00); // Note Off
        }
        this.log(`DAW MIDI:     Sending PadState: ${padIndex} - ${pad.state} - ${note} - ${velocity}`);
    }

    /**
     * Sends a MIDI message to update the color of a button.
     * @param {number} address - The MIDI address of the button.
     * @param {number} colorIndex - The color index to set for the button.
     */
    sendButtonColor(address, colorIndex) {
        this.sendMidi(PreSonus.Midi.kController, address, colorIndex);
    }

    /**
     * Initializes the pad states for the device.
     * Creates a LaunchkeyPadState instance for each pad in the grid.
     */
    initPadStates() {
        this.pads = [];
        for (let padIndex = 0; padIndex < this.padCount; padIndex++) {
            this.pads.push(new LaunchkeyPadState(false, 0, PreSonus.PadSectionPadAnimation.kNone));
        }
    }

    /**
     * Sends MIDI messages to set the controller to the specified pad mode.
     * @param {number} padModeValue - The value representing the pad mode (e.g., 0x01 for Drum layout).
     */
    sendUpdates(padModeValue) {
        this.log(`DAW MIDI:     Sending Midi updates: ${padModeValue}`);
        this.sendMidi(0xBF, 0x03, padModeValue);
    }

}

function createLaunchkeyDawDeviceInstance() {
    return new LaunchkeyMidiDevice(16); // 16 pads
}

