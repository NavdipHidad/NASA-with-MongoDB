const axios = require('axios');

const launchesDB = require('./launches.mongo');
const planetDB = require('./planets.mongo');

const launches = new Map();

const DEFAULT_FLIGHT_NUMBER = 100;
//let latestFlightNumber = 100;

const launch = {
    flightNumber: 100, //flight_number
    mission: "Kepler Exploration Y", //name
    rocket: "Explore IS2", //rocket.name
    launchDate: new Date('January 27, 2030'), //date_local
    target: "Kepler-442 b", //not applicable
    customers: ['NASA', 'ZTM'], //payload.customers for each payload
    upcoming: true, //upcoming
    success: true, //success
};

//launches.set(launch.flightNumber, launch);
saveLaunchDB(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading launches data..');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            "pagination": false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name: 1
                    }
                },
                {
                    path: "payloads",
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    const launchDocs = response.data.docs;
    for (launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });
        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers,
        }
        console.log(`${launch.flightNumber}. ${launch.mission}`);
        await saveLaunchDB(launch);
    }
}

async function loadLaunchData() {
    const firstlaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if (firstlaunch) {
        console.log('Launch data already loaded');
    }
    else {
        await populateLaunches();
    }
}

async function saveLaunchDB(launch) {
    await launchesDB.findOneAndUpdate({
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

async function findLaunch(filter) {
    return await launchesDB.findOne(filter);
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function scheduleNewLaunch(launch) {
    const planet = await planetDB.findOne({
        keplerName: launch.target,
    });

    if (!planet) {
        throw new Error('No matching planet found');
    }
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
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    //addNewLaunch,
    scheduleNewLaunch,
    abortLaunchById,
}