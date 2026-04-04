class Alarm {
    hour: number;
    minute: number;
    enabled: boolean;
    hourlyChime: boolean;

    constructor(hour: number, minute: number, enabled: boolean, hourlyChime: boolean = false) {
        this.hour = hour;
        this.minute = minute;
        this.enabled = enabled;
        this.hourlyChime = hourlyChime;
    }

    toString(): string {
        return `Alarm(hour=${this.hour}, minute=${this.minute}, enabled=${this.enabled}, hourlyChime=${this.hourlyChime})`;
    }

    static clear(): void {
        this.alarms = [];
    }

    static alarms: Alarm[] = [];
}

// Example usage:
// const alarm1 = new Alarm(8, 30, true, false);
// console.log(alarm1.toString()); // Outputs: Alarm(hour=8, minute=30, enabled=true, hasHourlyChime=false)
// Alarm.clear(); // Clears the static alarms array

export const alarm = new Alarm(0, 0, false, false);
export default Alarm;
