/**

DeviceIDs for LaunchKey keyboards
All SysEx messages begin with the following header regardless of direction (Host => Launchkey [MK3] or Launchkey 
[MK3] => Host):
    Launchkey 25 |37 | 49 | 61
    Hex: 0xF0  0x00  0x20  0x29  0x02  0x0F
    Dec: 240 0 32 41 2 15

    Launchkey 88
    Hex: 0xF0  0x00  0x20  0x29  0x02  0x12
    Dec: 240 0 32 41 2 18

The <dev_type> field encodes which Launchkey [MK3] is connected:
 • 34h (52): Launchkey [MK3] 25
 • 35h (53): Launchkey [MK3] 37
 • 36h (54): Launchkey [MK3] 49
 • 37h (55): Launchkey [MK3] 61
 • 40h (64): Launchkey [MK3] 88

DAW Mode
DAW mode provides DAWs and DAW-like software functionality to realize intuitive user interfaces on the Launchkey 
[MK3]’s surface. The capabilities described in this chapter are only available once DAW mode is enabled.

All functionality described in this chapter is accessible through the Launchkey [MK3] DAW In/Out (USB) interface.

DAW Mode Control
The following MIDI events are used to set DAW mode:
 • Channel 16, Note 0Ch (12): DAW mode enable/disable.
 • Channel 16, Note 0Bh (11): Continuous control Touch event enable/disable.
 • Channel 16, Note 0Ah (10): Continuous control Pot Pickup enable/disable.

By default, upon entry to DAW mode, Continuous control Touch events are disabled, and Continuous control Pot 
Pickup is disabled.

A Note On event enters DAW mode or enables the respective feature, while a Note Off event exits DAW mode or 
disables the respective feature.

When the DAW or DAW-like software recognizes the Launchkey [MK3] and connects to it, it should first enter DAW 
mode (send 9Fh 0Ch 7Fh), and then, if necessary, enable the features needed.

When the DAW or DAW-like software exits, it should exit from DAW mode on the Launchkey [MK3] (send 9Fh 0Ch 
00h) to return it to Standalone (MIDI) mode.

Mode report and select
    The modes of the Pads, Pots and Faders can be controlled by MIDI events, and are also reported back by the 
    Launchkey [MK3] whenever it changes mode due to user activity. These messages are important to capture as the 
    DAW should follow these setting up and using the surfaces as intended based on the selected mode.

Pad modes
    Pad mode changes are reported or can be changed by the following MIDI event:
        • Channel 16 (MIDI status: BFh, 191), Control Change 03h (3)
    The Pad modes are mapped to the following values:
        • 00h (0): Custom Mode 0
        • 01h (1): Drum layout
        • 02h (2): Session layout
        • 03h (3): Scale Chords
        • 04h (4): User Chords
        • 05h (5): Custom Mode 0
        • 06h (6): Custom Mode 1
        • 07h (7): Custom Mode 2
        • 08h (8): Custom Mode 3
        • 09h (9): Device Select
        • 0Ah (10): Navigation

Pot modes
    Pot mode changes are reported or can be changed by the following MIDI event:
        • Channel 16 (MIDI status: BFh, 191), Control Change 09h (9)
    The Pot modes are mapped to the following values:
        • 00h (0): Custom Mode 0
        • 01h (1): Volume
        • 02h (2): Device
        • 03h (3): Pan
        • 04h (4): Send-A
        • 05h (5): Send-B
        • 06h (6): Custom Mode 0
        • 07h (7): Custom Mode 1
        • 08h (8): Custom Mode 2
        • 09h (9): Custom Mode 3
*/

class LaunchkeyProtocol {
}
LaunchkeyProtocol.kLaunchkey88DeviceID = 0x12;  // Added to support Launchkey 88- see Programmers ref PDF
LaunchkeyProtocol.kLaunchkeyMiniDeviceID = 0x0F;  // Added to support Launchkey 25,37,49, and 61 - see Programmers ref PDF
//LaunchkeyProtocol.kAnimationStatic = 0x01;  // Channel 1 is default for Session layout mode. Channel 10 (0x9A) is default for DRUM layout mode.
//LaunchkeyProtocol.kAnimationFlash = 0x02;  // Channel 2 is default for Session layout mode. Channel 11 (0x9B) is default for DRUM layout mode.
//LaunchkeyProtocol.kAnimationPulse = 0x03;  // Channel 3 is default for Session layout mode. Channel 12 (0x9C) is default for DRUM layout mode.
LaunchkeyProtocol.kNoColorIndex = 0;

// Animation channel offsets for Session layout (channels 1,2,3)
LaunchkeyProtocol.kSessionAnimationStatic = 0; // Channel 1
LaunchkeyProtocol.kSessionAnimationFlash  = 1; // Channel 2
LaunchkeyProtocol.kSessionAnimationPulse  = 2; // Channel 3

// Animation channel offsets for Drum layout (channels 10,11,12)
LaunchkeyProtocol.kDrumAnimationStatic = 9;  // Channel 10
LaunchkeyProtocol.kDrumAnimationFlash  = 10; // Channel 11
LaunchkeyProtocol.kDrumAnimationPulse  = 11; // Channel 12

// Device types for different Launchkey [MK3] models
LaunchkeyProtocol.kLaunchkey25DevTypeID = 0x34;
LaunchkeyProtocol.kLaunchkey37DevTypeID = 0x35;
LaunchkeyProtocol.kLaunchkey49DevTypeID = 0x36;
LaunchkeyProtocol.kLaunchkey61DevTypeID = 0x37;
LaunchkeyProtocol.kLaunchkey88DevTypeID = 0x40;

// DAW Mode Control Notes on Channel 16
LaunchkeyProtocol.kDAWModeEnableDisable = 0x0C; // Note 12
LaunchkeyProtocol.kTouchEventEnableDisable = 0x0B; // Note 11
LaunchkeyProtocol.kPotPickupEnableDisable = 0x0A; // Note 10

// Pad Modes and Layouts
LaunchkeyProtocol.kPadModeDrumLayout = 0x01;    // AKA Drum Mode
LaunchkeyProtocol.kPadModeSessionLayout = 0x02; // AKA Session Mode
LaunchkeyProtocol.kPadModeScaleChords = 0x03;
LaunchkeyProtocol.kPadModeUserChords = 0x04;
LaunchkeyProtocol.kPadModeCustom0 = 0x05;
LaunchkeyProtocol.kPadModeCustom1 = 0x06;
LaunchkeyProtocol.kPadModeCustom2 = 0x07;
LaunchkeyProtocol.kPadModeCustom3 = 0x08;
LaunchkeyProtocol.kPadModeDeviceSelect = 0x09;
LaunchkeyProtocol.kPadModeNavigation = 0x0A;

// Pot Modes
LaunchkeyProtocol.kPotModeCustom0 = 0x00;
LaunchkeyProtocol.kPotModeVolume = 0x01;
LaunchkeyProtocol.kPotModeDevice = 0x02;
LaunchkeyProtocol.kPotModePan = 0x03;
LaunchkeyProtocol.kPotModeSendA = 0x04;
LaunchkeyProtocol.kPotModeSendB = 0x05;
LaunchkeyProtocol.kPotModeCustom1 = 0x07;
LaunchkeyProtocol.kPotModeCustom2 = 0x08;
LaunchkeyProtocol.kPotModeCustom3 = 0x09;

// Session layout pad note numbers (example, update as needed)
LaunchkeyProtocol.PAD_BANKS = {
    session: [
        [0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67], // Bank 0 (top row)
        [0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77]  // Bank 1 (bottom row)
    ],
    drum: [
        [0x28, 0x29, 0x2A, 0x2B, 0x30, 0x31, 0x32, 0x33], // Bank 0
        [0x24, 0x25, 0x26, 0x27, 0x2C, 0x2D, 0x2E, 0x2F]  // Bank 1
    ]
};

/**
 * LaunchkeyProtocol.kDAWModeColors
 * 
 * This array defines a set of hexadecimal color codes used to represent various states or modes
 * in DAW (Digital Audio Workstation) mode for the Launchkey [MK3] series. These colors are 
 * used for visual feedback on the device's pads, buttons, or other LED-enabled components.
 * 
 * Each color is represented in the standard hexadecimal format (#RRGGBB), where:
 * - RR: Red component (00 to FF)
 * - GG: Green component (00 to FF)
 * - BB: Blue component (00 to FF)
 * 
 * The colors range from basic shades (e.g., black, white, gray) to vibrant colors (e.g., red, green, blue),
 * providing a wide palette for different visual states or feedback.
 * 
 * Example usage:
 * - A specific color could indicate a pad's state (e.g., active, inactive, muted).
 * - Colors may also represent different modes or functionalities in DAW mode.
 */
LaunchkeyProtocol.kDAWModeColors = [
    "#000000", "#252525", "#8F8F8F", "#FDFDFD", "#FF655C", "#FF2812", "#6E0A03", "#220100",
    "#FFC77C", "#FF6C1D", "#6E2806", "#301F02", "#FFF84D", "#FFF83F", "#6C6915", "#201F02",
    "#94F751", "#53F63C", "#1E6814", "#193306", "#45F751", "#09F63B", "#026813", "#001E02",
    "#43F768", "#09F63B", "#026813", "#001E02", "#40F897", "#04F75D", "#016822", "#002413",
    "#39F8C1", "#00F7A7", "#006943", "#001F13", "#3FCCFC", "#00B8FC", "#005263", "#00141F",
    "#499EFB", "#0070FA", "#00296B", "#000720", "#4F69FA", "#003CF9", "#00146C", "#000220",
    "#926AFA", "#5B3DF9", "#171877", "#080840", "#FF70FA", "#FF47FA", "#6D196B", "#210320",
    "#FF6995", "#FF2C65", "#6E0D24", "#2C0213", "#FF3313", "#AD4710", "#8E6315", "#507417",
    "#01460A", "#006743", "#00678F", "#003CF9", "#00555F", "#0A32D6", "#8F8F8F", "#2B2B2B",
    "#FF2812", "#C8F73E", "#BAEB3A", "#6BF73C", "#039520", "#00F794", "#00B8FC", "#0046F9",
    "#383DF9", "#863FF9", "#C2348E", "#532B05", "#FF611A", "#97E137", "#7AF73C", "#09F63B",
    "#09F63B", "#57F77F", "#00F9D5", "#5C9EFB", "#2868CF", "#9193ED", "#DA46FA", "#FF2D6C",
    "#FF9025", "#C7BB2D", "#9EF73D", "#966F18", "#4A3406", "#105C13", "#006148", "#171A35",
    "#0D2F6B", "#7E4D23", "#BC190A", "#E96749", "#E57D1F", "#FFE33A", "#ABE137", "#74BD2C",
    "#23263F", "#E5F975", "#88F9C7", "#A4ADFC", "#9A80FA", "#515151", "#878787", "#E4FCFD",
    "#B51809", "#450301", "#06D332", "#014F0C", "#C7BB2D", "#4F3E09", "#C3701A", "#5D1C03"
];

/**
 * LaunchkeySysExMessage
 * 
 * This class provides a base for handling System Exclusive (SysEx) MIDI messages specific to
 * Launchkey devices. SysEx messages are used for device-specific communication and configuration.
 * 
 * - The `isHeader` method checks if the given data array starts with a specific sequence of bytes
 *   (`0xF0`, `0x00`, `0x20`, `0x29`, `0x02`), which identifies the message as a Launchkey SysEx message.
 * - The `kHeader` constant defines the standard header for Launchkey SysEx messages.
 */
class LaunchkeySysExMessage {
    static isHeader(data) {
        return data[0] == 0xF0 && data[1] == 0x00 &&
            data[2] == 0x20 && data[3] == 0x29 && data[4] == 0x02;
    }
}
LaunchkeySysExMessage.kHeader = [0x00, 0x20, 0x29, 0x02];

/**
 * LaunchkeyDAWModeMessage
 * 
 * This class extends `LaunchkeySysExMessage` and represents a specific type of SysEx message
 * related to DAW mode. It provides methods to validate, extract, and construct DAW mode messages.
 * 
 * - `isMessage`: Validates if a given message matches the expected format for DAW mode.
 * - `getValue`: Extracts the value (e.g., mode state) from the message.
 * - `build`: Constructs a new DAW mode message with the specified device ID and value.
 * 
 * Constants:
 * - `kDAWModeOff` and `kDAWModeOn`: Represent the states for DAW mode (off/on).
 * - `kMessageID`: Identifies the message type as DAW mode.
 * - `kLength`: Specifies the expected length of a DAW mode message.
 */
class LaunchkeyDAWModeMessage extends LaunchkeySysExMessage {
    static isMessage(data, length) {
        if (length < LaunchkeyDAWModeMessage.kLength)
            return false;
        if (LaunchkeySysExMessage.isHeader(data) == false)
            return false;
        return data[6] == LaunchkeyDAWModeMessage.kMessageID;
    }
    static getValue(data) {
        return data[7];
    }
    static build(sysexBuffer, deviceId, value) {
        sysexBuffer.begin(LaunchkeySysExMessage.kHeader);
        sysexBuffer.push(deviceId);
        sysexBuffer.push(LaunchkeyDAWModeMessage.kMessageID);
        sysexBuffer.push(value);
        sysexBuffer.end();
        return sysexBuffer;
    }
}
LaunchkeyDAWModeMessage.kDAWModeOff = 0x00;
LaunchkeyDAWModeMessage.kDAWModeOn = 0x01;
LaunchkeyDAWModeMessage.kMessageID = 0x10;
LaunchkeyDAWModeMessage.kLength = 9;

/**
 * No Pro
         * LaunchkeyProLayoutMessage
         * 
         * This class extends `LaunchkeySysExMessage` and represents messages related to the layout
         * of a Launchkey Pro device. It provides methods to validate and extract layout-specific data.
         * 
         * - `isMessage`: Validates if a given message matches the expected format for layout messages.
         * - `getLayoutValue`: Extracts the layout value from the message.
         * 
         * Constants:
         * - `kMessageID`: Identifies the message type as a layout message.
         * - `kLength`: Specifies the expected length of a layout message.
         
        class LaunchkeyProLayoutMessage extends LaunchkeySysExMessage {
            static isMessage(data, length) {
                if (length < LaunchkeyProLayoutMessage.kLength)
                    return false;
                if (LaunchkeySysExMessage.isHeader(data) == false)
                    return false;
                return data[5] == LaunchkeyProtocol.kLaunchkeyProDeviceID &&
                    data[6] == LaunchkeyProLayoutMessage.kMessageID;
            }
            static getLayoutValue(data) {
                return data[7];
            }
        }
        LaunchkeyProLayoutMessage.kSession = 0x00;
        LaunchkeyProLayoutMessage.kLayoutMin = 0x00;
        LaunchkeyProLayoutMessage.kLayoutMax = 0x13;
        LaunchkeyProLayoutMessage.kMessageID = 0x00;
        LaunchkeyProLayoutMessage.kLength = 11;
*/


/* 
Layouts roughly correspond to how the Launchkey [MK3] uses things like Pad Mode, Pot Mode, Fader Mode, etc. when in its DAW mode.

***** LAUNCHKEY [MK3] *****
The modes of the Pads, Pots and Faders can be controlled by MIDI events, and are also reported back by the 
Launchkey [MK3] whenever it changes mode due to user activity. These messages are important to capture as the 
DAW should follow these setting up and using the surfaces as intended based on the selected mode.
 
Pad modes
Pad mode changes are reported or can be changed by the following MIDI event:
    Channel 16 (MIDI status: BFh, 191), Control Change 03h (3)

The Pad modes are mapped to the following values:
 • 00h (0): Custom Mode 0
 • 01h (1): Drum layout
 • 02h (2): Session layout
 • 03h (3): Scale Chords
 • 04h (4): User Chords
 • 05h (5): Custom Mode 0
 • 06h (6): Custom Mode 1
 • 07h (7): Custom Mode 2
 • 08h (8): Custom Mode 3
 • 09h (9): Device Select
 • 0Ah (10): Navigation

***** LAUNCHPAD*****
Selecting layouts 
The Launchpad Mini [MK3] has several layouts to choose from, which can be controlled by either the 
device’s User Interface (see the User Guide for more details), or the following SysEx message: 

Host => Launchpad Mini [MK3]: 
Hex: F0h 00h 20h 29h 02h 0Dh 00h <layout> F7h 
Dec: 240 0 32 41 2 13 0 <layout> 247 

Where the available layouts are: - - - - - - 
00h (0): Session (only selectable in DAW mode) 
04h (4): Custom mode 1 (Drum Rack by factory default) 
05h (5): Custom mode 2 (Keys by factory default) 
06h (6): Custom mode 3 (Lighting mode in Drum Rack layout by factory default) 
0Dh (13): DAW Faders (only selectable in DAW mode) 
7Fh (127): Programmer mode
*/

