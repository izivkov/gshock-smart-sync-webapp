import GShockAPI from "./GShockAPI"

const test = {

    run: async () => {
        await GShockAPI.init()

        // const name = await GShockAPI.getWatchName()
        // console.log("Watch Name:", name)

        // const worldCitiesData = await GShockAPI.getWorldCities(0)
        // console.log("World Cities:", worldCitiesData)

        // const homeTime = await GShockAPI.getHomeTime()
        // console.log("Hone Time:", homeTime)

        // const timer = await GShockAPI.getTimer()
        // console.log("Timer:", timer)

        // await GShockAPI.setTimer(201)
        // console.log("Timer Set")

        // const batteryLevel = await GShockAPI.getBatteryLevel()
        // console.log("batteryLevel:", batteryLevel)

        // const temperature = await GShockAPI.getWatchTemperature()
        // console.log("temperature:", temperature)

        await GShockAPI.setTime()

        // const alarms = await GShockAPI.getAlarms()
        // console.log("alarms:", alarms)

        // alarms[3].minute = 23

        // await GShockAPI.setAlarms(alarms)
        // console.log("Set alarms:")

        // let events = await GShockAPI.getEventsFromWatch()
        // console.log(`Events: ${JSON.stringify(events)}`)

        // events[0].title = "Test 1"
        // await GShockAPI.setEvents(events)

        // events = await GShockAPI.getEventsFromWatch()
        // console.log(`Events Again: ${JSON.stringify(events)}`)

        // const settings = await GShockAPI.getSettings()
        // console.log("Settings:", settings)

        // settings.dateFormat = "MM:DD"
        // await GShockAPI.setSettings(settings)

        // const settingsAfter = await GShockAPI.getSettings()
        // console.log("New Settings:", settingsAfter)

        // const buttonPressed = await GShockAPI.getPressedButton()
        // console.log("ButtonPressed:", buttonPressed)

        // console.log("isActionButtonPressed:", GShockAPI.isActionButtonPressed())
        // console.log("isNormalButtonPressed:", GShockAPI.isNormalButtonPressed())
        // console.log("isAutoTimeStarted:", GShockAPI.isAutoTimeStarted())

        console.log("End of tests\n")
    }
}

export default test
