export enum RunMode {
    SYNC,
    ASYNC,
}

export enum RunEnvironment {
    NORMAL_CONNECTION,      // Connected by long-pressing the LOWER-LEFT button
    ACTION_BUTTON_PRESSED,  // Connected by short-pressing the LOWER-RIGHT button
    AUTO_TIME_ADJUSTMENT,   // Connected automatically during auto time update
    FIND_PHONE_PRESSED,      // The user has activated the "Find Phone" function
    VOICE_COMMAND,          // Triggered by voice command
    ALWAYS_CONNECTED,       // Some watches are always connected
    DIRECT_INVOCATION,      // Called directly from app code
}

export abstract class Action {
    constructor(
        public title: string,
        public enabled: boolean,
        public runMode: RunMode = RunMode.SYNC
    ) {}

    abstract run(payload?: any): Promise<void> | void;

    shouldRun(runEnvironment: RunEnvironment): boolean {
        switch (runEnvironment) {
            case RunEnvironment.ACTION_BUTTON_PRESSED:
            case RunEnvironment.VOICE_COMMAND:
                return this.enabled;
            case RunEnvironment.NORMAL_CONNECTION:
            case RunEnvironment.AUTO_TIME_ADJUSTMENT:
            case RunEnvironment.FIND_PHONE_PRESSED:
            case RunEnvironment.ALWAYS_CONNECTED:
            case RunEnvironment.DIRECT_INVOCATION:
                return false;
            default:
                return false;
        }
    }
}
