const http = require('k6/http');
const { sleep } = require('k6');

export const options = {
    duration: `${__ENV.START_DURATION}`, // The duration of test(E.g. 30s)
    vus: Number(__ENV.VUS), // The number of VUS(E.g. 10)
};

export default function () {
    let res;

    res = http.get(`${__ENV.BASE_URL}/healthcheck`);

    sleep(1) // 1 request per second per VU
}

export function handleSummary(data) {
    return {
        'result.json': JSON.stringify(data)
    };
}
