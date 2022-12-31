const launches = new Map();

let latestflightNumber = 100;

const launch = {
    flightNumber: 100,
    mission: 'Kepler exploration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('December 27, 2030'),
    target: 'Kepler-442 b',
    customers: ['NASA', 'ZTM'],
    upcoming: true,
    success: true
}

function getAllLaunches() {
    return Array.from(launches.values());
}

launches.set(launch.flightNumber, launch);

function addNewLaunches(launch) {
    latestflightNumber++;
    launches.set(
        latestflightNumber,
        Object.assign(launch, {
            success: true,
            upcoming: true,
            customers: ['Zero to Mastery', 'NASA'],
            flightNumber: latestflightNumber,
        })
    );
}
module.exports = {
    getAllLaunches,
    addNewLaunches
};