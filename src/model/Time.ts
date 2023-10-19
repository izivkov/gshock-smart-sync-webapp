class Time {
    time: Date;
    timer: Date;
    watchName: string;
    homeTime: string;
    bateryLevel: number;
    temperature: number;

    constructor(time: Date,
        timer: Date,
        watchName: string,
        homeTime: string,
        bateryLevel: number,
        temperature: number
    ) {
        this.time = time;
        this.timer = timer;
        this.watchName = watchName;
        this.homeTime = homeTime;
        this.bateryLevel = bateryLevel;
        this.temperature = temperature;
    }

}

export const time = new Time(new Date(), new Date(), "", "", 0, 0)
export default Time;
