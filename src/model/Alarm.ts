class Alarm {
    hour: number;
    minute: number;
    enabled: boolean;
    hasHourlyChime: boolean;
    oneTime?: boolean;
    name?: string | null;

    constructor(hour: number, minute: number, enabled: boolean, hasHourlyChime: boolean = false, oneTime: boolean = false, name?: string | null) {
        this.hour = hour;
        this.minute = minute;
        this.enabled = enabled;
        this.hasHourlyChime = hasHourlyChime;
        this.oneTime = oneTime;
        this.name = name ?? null;
    }

    toString(): string {
        return `Alarm(hour=${this.hour}, minute=${this.minute}, enabled=${this.enabled}, hasHourlyChime=${this.hasHourlyChime}, oneTime=${this.oneTime ?? false}, name=${this.name ?? 'null'})`;
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
