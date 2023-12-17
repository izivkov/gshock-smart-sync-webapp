import GShockAPI from '@api/GShockAPI';

const test = {
    run: async (): Promise<void> => {
        await GShockAPI.init();

        console.log("=============================================== Starting Tests");
        // const name: string = await GShockAPI.getWatchName();
        // console.log("Watch Name:", name);

        // const worldCitiesData: any = await GShockAPI.getWorldCities(0);
        // console.log("World Cities:", worldCitiesData);

        // const homeTime: string = await GShockAPI.getHomeTime();
        // console.log("Home Time:", homeTime);

        // const timer: number = await GShockAPI.getTimer();
        // console.log("Timer:", timer);

        // await GShockAPI.setTimer(201);
        // console.log("Timer Set");

        const batteryLevel: number = await GShockAPI.getBatteryLevel();
        console.log("Battery Level:", batteryLevel);

        const temperature: number = await GShockAPI.getWatchTemperature();
        console.log("Temperature:", temperature);

        // await GShockAPI.setTime();

        // const alarms: any[] = await GShockAPI.getAlarms();
        // console.log("Alarms:", alarms);

        // alarms[3].minute = 23;

        // await GShockAPI.setAlarms(alarms);
        // console.log("Set Alarms:");

        // let events: any[] = await GShockAPI.getEventsFromWatch();
        // console.log(`Events: ${JSON.stringify(events)}`);

        // events[0].title = "Test 1";
        // await GShockAPI.setEvents(events);

        // events = await GShockAPI.getEventsFromWatch();
        // console.log(`Events Again: ${JSON.stringify(events)}`);

        // const settings: any = await GShockAPI.getSettings();
        // console.log("Settings:", settings);

        // settings.dateFormat = "MM:DD";
        // await GShockAPI.setSettings(settings);

        // const settingsAfter: any = await GShockAPI.getSettings();
        // console.log("New Settings:", settingsAfter);

        // const buttonPressed: string = await GShockAPI.getPressedButton();
        // console.log("Button Pressed:", buttonPressed);

        // console.log("Is Action Button Pressed:", GShockAPI.isActionButtonPressed());
        // console.log("Is Normal Button Pressed:", GShockAPI.isNormalButtonPressed());
        // console.log("Is Auto Time Started:", GShockAPI.isAutoTimeStarted());

        console.log("=============================================== End of Tests");
    },
};

export default test;
