const { getAllLaunches, addNewLaunches } = require('../../models/launches.model');

function httpGetAllLaunches(req, res) {
    return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunches(req, res) {
    const launch = req.body;

    if (!launch.rocket) {
        return res.status(400).json({
            error: 'Missing required rocket',
        });
    }
    else if (!launch.mission) {
        return res.status(400).json({
            error: 'Missing required mission property',
        });
    }
    else if (!launch.launchDate) {
        return res.status(400).json({
            error: 'Missing required launchDate',
        });
    }
    else if (!launch.target) {
        return res.status(400).json({
            error: 'Missing required target',
        });
    }

    launch.launchDate = new Date(launch.launchDate);
    if (isNaN(launch.launchDate)) {
        return res.status(400).json({
            error: 'Invalid launch date',
        });
    }

    addNewLaunches(launch);
    return res.status(201).json(launch);
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunches,
};