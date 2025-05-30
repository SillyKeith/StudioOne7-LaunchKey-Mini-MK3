include_file("resource://com.presonus.musicdevices/sdk/controlsurfacecomponent.js");
include_file("resource://com.presonus.musicdevices/sdk/musicprotocol.js");
include_file("LaunchkeyProtocol.js");

/**
 * Enum representing the Presonus Studio One operational modes of the pad section.
 * These are the PreSonus Studio One modes that can be set.
 * These DO NOT have anything to do with the Launchkey MK3 modes.
 * 
 */
var PadSectionMode;
(function (PadSectionMode) {
    PadSectionMode[PadSectionMode["kPlayMode"] = 0] = "kPlayMode";
    PadSectionMode[PadSectionMode["kSetupMode"] = 1] = "kSetupMode";
    PadSectionMode[PadSectionMode["kLoopEditMode"] = 2] = "kLoopEditMode";
    PadSectionMode[PadSectionMode["kEventEditMode"] = 3] = "kEventEditMode";
    PadSectionMode[PadSectionMode["kInstrumentEditMode"] = 4] = "kInstrumentEditMode";
    PadSectionMode[PadSectionMode["kBankMenuMode"] = 5] = "kBankMenuMode";
    PadSectionMode[PadSectionMode["kRepeatMenuMode"] = 6] = "kRepeatMenuMode";
    PadSectionMode[PadSectionMode["kPitchMenuMode"] = 7] = "kPitchMenuMode";
    PadSectionMode[PadSectionMode["kRateTriggerMode"] = 8] = "kRateTriggerMode";
    PadSectionMode[PadSectionMode["kStepEditMode"] = 9] = "kStepEditMode";
    PadSectionMode[PadSectionMode["kLauncherMode"] = 10] = "kLauncherMode";
    PadSectionMode[PadSectionMode["kRestorePlayMode"] = 11] = "kRestorePlayMode";
    PadSectionMode[PadSectionMode["kLastPadMode"] = 11] = "kLastPadMode";
    PadSectionMode[PadSectionMode["kModeMin"] = 0] = "kModeMin";
    PadSectionMode[PadSectionMode["kModeMax"] = 11] = "kModeMax";
})(PadSectionMode || (PadSectionMode = {}));

/**
 * Enum representing the Layout (Drum Layout vs Session Layout).
 * These correspond to the Launchkey MK3 PAD Layouts as defined in the programmers reference. 
 * We are only using 1,2, & 5 
            Pad mode changes are reported or can be changed by the following MIDI event:
            • Channel 16 (MIDI status: BFh, 191), Control Change 03h (3)

            The Pad modes are mapped to the following values:
         		• 00h (0): Custom Mode 0
         		• 01h (1): Drum layout (aka DRUM MODE)
         		• 02h (2): Session layout (aka SESSION MODE)
         		• 03h (3): Scale Chords
         		• 04h (4): User Chords
         		• 05h (5): Custom Mode 0 (this is the real Custom Mode 0 and what is reported by the device)
         		• 06h (6): Custom Mode 1
         		• 07h (7): Custom Mode 2
         		• 08h (8): Custom Mode 3
         		• 09h (9): Device Select
         		• 0Ah (10): Navigation
 */
var PadLayoutMode;
(function (PadLayoutMode) {
    PadLayoutMode[PadLayoutMode["kDrumLayout"] = 1] = "kDrumLayout";
    PadLayoutMode[PadLayoutMode["kSessionLayout"] = 2] = "kSessionLayout";
    PadLayoutMode[PadLayoutMode["kCustom0"] = 5] = "kCustom0";
})(PadLayoutMode || (PadLayoutMode = {}));

/**
 * Enum representing navigation button indices.
 * - kUp: Up button.
 * - kDown: Down button.
 * - kLeft: Left button.
 * - kRight: Right button.
 */
var NavButtonIndex;
(function (NavButtonIndex) {
    NavButtonIndex[NavButtonIndex["kUp"] = 0] = "kUp";
    NavButtonIndex[NavButtonIndex["kDown"] = 1] = "kDown";
    NavButtonIndex[NavButtonIndex["kLeft"] = 2] = "kLeft";
    NavButtonIndex[NavButtonIndex["kRight"] = 3] = "kRight";
})(NavButtonIndex || (NavButtonIndex = {}));

let bankColors = [
    "#0020FF",
    "lime",
    "yellow",
    "purple",
    "orangered",
    "cyan",
    "crimson",
    "#FF7210"
];
let padSnapColors = [
    "red",
    "orangered",
    "yellow",
    "greenyellow",
    "green",
    "blue",
    "aqua",
    "magenta",
    "darkviolet",
    "gray"
];

/**
 * Represents the base component for managing a Launchkey device.
 * Handles initialization, pad section modes, navigation, and parameter changes.
 */
class LaunchkeyComponent extends PreSonus.ControlSurfaceComponent {
    /**
     * Initializes the Launchkey component.
     * Sets up parameters, color mappings, and handlers for the pad section.
     * @param {object} hostComponent - The host component managing this Launchkey.
     */
    onInit(hostComponent) {
        super.onInit(hostComponent);
        this.debugLog = true;
        this.model = hostComponent.model;
        let root = this.model.root;
        
        // Configure color mappings for DAW mode.
        this.configureDawModeColors(root);
        let paramList = hostComponent.paramList;


        // Build the padSection object to keep track of it's state, animation, coloring, etc
        this.padSection = root.find("PadSectionElement");
            if (!this.padSection) {
                this.log("Error:    PadSectionElement could not be found. Is your XML correct?");
            } else {
                this.log("Success:  PadSectionElement found and assigned to this.padSection.");
            }
        


        // Initialize padSectionMode and layoutReceiver
        //  padSectionMode tracks which Studio One playback/usage mode is active
        // For example, Play, Setup, Loop Edit, Event Edit, Instrument Edit, etc.

        this.padSectionMode = paramList.addInteger(PadSectionMode.kModeMin, PadSectionMode.kModeMax, "padMode");
        
        // layoutReceiver tracks Pad Layout changes like Session Layout, Drum Layout, and Custom Layout, etc.
        // This is very important to track.
        this.layoutReceiver = paramList.addInteger(PadLayoutMode.kDrumLayout, PadLayoutMode.kCustom0, "layoutReceiver");  // Surface XML corresponding line:  <PlainValue control="layoutReceiver" param="padLayoutMode"/>
        //this.log("DAW Component:    Setting Value for layoutReceiver parameter");
        this.layoutReceiver.setValue(PadLayoutMode.kSessionLayout, true); // Set the default value to Session Layout    
        
        this.layoutSender = paramList.addInteger(PadLayoutMode.kDrumLayout, PadLayoutMode.kCustom0, "layoutSender");
        
        this.setupLaunchKeyDAWComponent();

        // Configure pad section and handlers.
        let c = this.padSection.component;
        c.setPadColoringSupported(true);
        for (let i = 0; i < padSnapColors.length; i++)
            c.addPadPaletteColor(padSnapColors[i]);
        c.addHandlerForRole(PreSonus.PadSectionRole.kMusicInput);
        c.addNullHandler();
        c.setActiveHandler(PadLayoutMode.kSessionLayout);


        // Set the default pad section mode.
        this.updatePadSectionMode(PadSectionMode.kPlayMode);

        // Notifications
        PreSonus.HostUtils.enableEngineEditNotifications(this, true);
        PreSonus.HostUtils.enableEditorNotifications(this, true);
        //Host.Signals.advise(this.layoutReceiver, this);
        Host.Signals.advise(c, this);
    }
    
    onExit() {
        let c = this.padSection.component;
        Host.Signals.unadvise(c, this);
        PreSonus.HostUtils.enableEngineEditNotifications(this, false);
        //Host.Signals.unadvise(this.layoutReceiver, this);
        Host.Signals.unadvise("LaunchKeyMK3");
        super.onExit();
    }

    /**
     * Configures the color mappings for DAW mode.
     * @param {object} root - The root model object.
     */
    configureDawModeColors(root) {
        let colorMapper = root.findColorTable("DAWModeColors");
        if (colorMapper) {
            LaunchkeyProtocol.kDAWModeColors.forEach((tableColor) => {
                colorMapper.addColor(tableColor);
            });
            this.log("DAW Component:    Colors configured successfully.");
        } else {
            this.log("DAW Component:    ERROR - Color table not found, your XML is probably messed up.");
        }
    }
    
    setupLaunchKeyDAWComponent() {
        //Host.Signals.advise("LaunchkeyMK3", this);
        //this.log("DAW Component: LaunchkeyMK3 component registered as a listener");
        //
        this.log("DAW Component:    Launchkey DAW component initialized");
    }

    /**
     * Updates the active handler for the pad section based on the mode.
     * @param {number} mode - The new pad section mode.
     */
    updatePadSectionMode(mode) {
        this.padSection.component.setActiveHandler(mode);
    }

    paramChanged(param) {
        Host.Signals.signal("LaunchKeyMK3", 'paramChanged', param); // This allows the BASIC component to receive signals.
        if (!param) return;
        // this.log(`DAW Component:    (paramChanged) value change ${param.value}`);
        if (param == this.layoutReceiver) {
            this.log(`DAW Component:    (paramChanged) layoutReceiver to: ${param.value}`);
            this.onLayoutChanged(param.value);
        }
        else if (param == this.padSectionMode) {
            this.log(`DAW Component:    (paramChanged) padSectionMode to: ${param.value}`);
            this.updatePadSectionMode(param.value);
        }
        else {
            this.log(`DAW Component:    (paramChanged) param: ${param.name} value: ${param.value}`);
            //super.paramChanged(param);
        }
    }
    
    onLayoutChanged(padLayoutMode) {
        this.log(`DAW Component:    (onLayoutChanged) Entered function: padLayoutMode: ${padLayoutMode}`);
    
        // Update the pad section layout (if needed)
        if (padLayoutMode === PadLayoutMode.kDrumLayout) {
            this.log("DAW Component:    Switching to Drum Layout");
            // Add logic for Drum Layout
        } else if (padLayoutMode === PadLayoutMode.kSessionLayout) {
            this.log("DAW Component:    Switching to Session Layout");
            // Add logic for Session Layout
        } else if (padLayoutMode === PadLayoutMode.kCustom0) {
            this.log("DAW Component:    Switching to Custom Layout 0");
            // Add logic for Custom Layout
        }
    }

    onLayoutReceived(data2) {
        this.log(`DAW Component:    (onLayoutReceived) Midi data2: ${data2}`);
    }

    onScenePressed(state) {
        this.log(`onScenePressed called with state: ${state}`);
        if (!state) {
            return;
        }
        let c = this.padSection.component;
        if (!c) {
            this.log("onScenePressed: padSection.component not found!");
            return;
        }
    
        let padIndex = 8;
        let purpleIndex = 48; // Default to index 48 for purple in DAWModeColors
    
        //this.log(`onScenePressed: Setting pad[${padIndex}] to pulse purple (index ${purpleIndex})`);
        
        // Ensure the correct handler is active for session layout
        //c.setActiveHandler(PadLayoutMode.kSessionLayout);
        //c.setPadColor(purpleIndex); // Set to purple
        //c.setPadAnimation(padIndex, LaunchkeyProtocol.kSessionAnimationPulse); // Pulse animation
    
        //this.log(`onScenePressed: Completed pad[${padIndex}] pulse purple.`);
    }
    
    notify(subject, msg) {
        this.log(
            `DAW Component: ID: ${msg.id}, ` +
            `Type of: ${typeof msg.id}, ` +
            `Value of: "${msg.id}", ` +
            (msg.getArg(0) && msg.getArg(0).name
                ? `Name: ${msg.getArg(0).name}, Val: ${msg.getArg(0).value}, Type: ${msg.getArg(0).type}`
                : "No info")
        );

        if(!msg)
            return;
        else if (msg.id == "changed") {
            this.log(`DAW Component:    changed event seen ${subject}: ${msg.id}`);
            if (subject == this.kkEvent)
                this.onLayoutChanged(this.kkEvent.value);
        }
        this.log(`DAW Component:    notify function ${subject}: ${msg.id}`);
        
    }
    /**
     * Updates the active handler for the pad section based on the mode.
     * @param {number} mode - The new pad section mode.
     */
    updatePadSectionMode(mode) {
        this.padSection.component.setActiveHandler(mode);
    }
}

/**
 * A class representing a generic MK3 Launcher component for suspending and resuming the launcher mode.
 * Apparently, this is used for "good hygiene" so Studio One can suspend the component when it is not in use.
 * onSuspend is an internal function.
*/
class MK3LauncherComponent extends LaunchkeyComponent {
    constructor() {
        super();
        this.launcherModeSuspended = false;
    }
    onSuspend(state) {
        super.onSuspend(state);
        if (state && this.isLauncherModeEnabled()) {
            this.suspendLauncherMode();
            this.launcherModeSuspended = true;
        }
        else if (!state && this.launcherModeSuspended) {
            this.resumeLauncherMode();
            this.launcherModeSuspended = false;
        }
    }
    isLauncherModeEnabled() {
        return false;
    }
    resumeLauncherMode() {
    }
    suspendLauncherMode() {
    }
}

/**
 * Factory function to create an instance of the Launchkey component.
 * @returns {LaunchkeyComponent} - A new instance of the Launchkey component.
 */
function createLaunchkeyDawComponentInstance() {
    return new LaunchkeyComponent();
}