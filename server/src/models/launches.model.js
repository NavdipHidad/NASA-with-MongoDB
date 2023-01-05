const launchesDB = require('./launches.mongo');
const planetDB = require('./planets.mongo');

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;
//let latestFlightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: "Kepler Exploration Y",
    rocket: "Explore IS2",
    launchDate: new Date('January 27, 2030'),
    target: "Kepler-442 b",
    customers: ['NASA', 'ZTM'],
    upcoming: true,
    success: true,
};

//launches.set(launch.flightNumber, launch);
saveLaunchDB(launch);
async function saveLaunchDB(launch) {
    const planet = await planetDB.findOneAndUpdate({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet found');
    }

    await launchesDB.updateOne({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDB
        .findOne()
        .sort('-flightNumber');
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches() {
    //return Array.from(launches.values());
    return await launchesDB.find({}, {
        '__v': 0, '_id': 0,
    });
}

async function existsLaunchWithId(launchId) {
    return await launchesDB.findOne({
        flightNumber: launchId,
    });
}

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        upcoming: true,
        success: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNumber,
    });
    await saveLaunchDB(newLaunch);
}

// function addNewLaunch(launch) {
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch, {
//             upcoming: true,
//             success: true,
//             customers: ['Zero to Mastery', 'NASA'],
//             flightNumber: latestFlightNumber,
//         })
//     );
// }

async function abortLaunchById(launchId) {
    const aborted = await launchesDB.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });
    return true;
    // const aborted = launches.get(launchId);
    // aborted.upcoming = false;
    // aborted.success = false;
    // return aborted;
}

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    //addNewLaunch,
    scheduleNewLaunch,
    abortLaunchById,
}