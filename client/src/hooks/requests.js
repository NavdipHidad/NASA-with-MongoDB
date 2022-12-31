//import { post } from "../../../server/src/app";

const URL = 'http://localhost:8000';

async function httpGetPlanets() {
  const response = await fetch(`${URL}/planets`);
  return response.json();
}

async function httpGetLaunches() {
  const response = await fetch(`${URL}/launches`);
  const fatchedLaunches = await response.json();
  return fatchedLaunches.sort((a, b) => {
    return a.flightNumber - b.flightNumber;
  });
}

async function httpSubmitLaunch(launch) {
  try {
    return await fetch(`${URL}/launches`, {
      method: "post",
      headers: {
        "Conent-Type": "application/json",
      },
      body: JSON.stringify(launch),
    });
  } catch (err) {
    return {
      ok: false,
    };
  }
}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  // Delete launch with given ID.
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};