include_file("resource://com.presonus.musicdevices/sdk/controlsurfacecomponent.js");
include_file("resource://com.presonus.musicdevices/sdk/controlsurfacedevice.js");
include_file("LaunchkeyProtocol.js");

class LaunchKeyBasicComponent extends PreSonus.ControlSurfaceComponent {
    onInit(hostComponent) {
        super.onInit(hostComponent);
        this.debugLog = true;

        this.model = hostComponent.model;

        // creating a bridge for layoutReceiver to be used in the extended component
        let paramList = 		    hostComponent.paramList;
        //this.layoutReceiver = paramList.addInteger(1, 5, "layoutReceiver");  // Surface XML corresponding line:  <PlainValue control="layoutReceiver" param="padLayoutMode"/>
        Host.Signals.advise("LaunchkeyMK3", this);
        
        this.setupLaunchKeyBasicComponent();
    }

    setupLaunchKeyBasicComponent() {
        //
        // Define this entire component as a Listener
        // so the DAW component can receive the MIDI events this piece captures
        // There is a corresponding paramChanged event to watch for these notifications
        // "LaunchkeyMK3" is an arbitrary name for the component
        // It should be unique to this component

        //this.log("BASIC Comp: LaunchkeyMK3 component registered as a listener");
        //
        this.log("BASIC Comp:    Launchkey BASIC component initialized");
    }

    onExit() {  // turn off notifications and unadvise signals
        Host.Signals.unadvise("LaunchkeyMK3", this);  // unadvise the component
        super.onExit();
    }
    
    notify(subject, msg) {
        this.log(
            `BASIC Comp:    (notify) ID: ${msg.id}, ` +
            `Type: ${typeof msg.id}, ` +
            `Val: "${msg.id}", ` +
            `ParamName: ${msg.getArg(0).name}, ` +
            `ParamValue: ${msg.getArg(0).value}, ` +
            `ParamType: ${msg.getArg(0).type}`
        );


        if (msg.id === "paramChanged") {  // This notification is being passed into the Extended Component script
            //this.log(`BASIC Comp:    HURRAY- paramChanged notification received ${subject}`);
            //if (this[msg.getArg(0).name]) {  // Example items are shiftModifier and sceneHold
            
            this.log(`BASIC Comp:    (notify) Setting parameter:   ${msg.getArg(0).name} to ${msg.getArg(0).value}`);
            //this[msg.getArg(0).name].setValue(msg.getArg(0).value, true);
            //}
            //else {
                // Handle unknown parameter
            //    this.log(`BASIC-  parameter: ${msg.getArg(0).name} to ${msg.getArg(0).value}`);
            //}
        } else {
            // Handle unknown notification
        }
    }
}

// factory entry called by host
function createLaunchKeyBasicComponentInstance()
{
    return new LaunchKeyBasicComponent;
}
