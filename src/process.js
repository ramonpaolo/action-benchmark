if (process.env.NODE_ENV === 'development') console.clear()

const core = require('@actions/core');
const github = require('@actions/github');

const { readFileSync, writeFileSync } = require("fs")
const { buildMessage } = require("./message")


try {
  // Input Variables
  let inputFileName = 'summary.json';
  let outputFileName = '';
  let desviationError = 0.1; // 10%
  let desviationLatency = 0.1; // 10%
  let baseLatency = { "AVG": 80, "MAX": 100, "MIN": 70, "P90": 80, "P95": 90 };

  if (process.env.NODE_ENV !== 'development') {
    inputFileName = core.getInput('input-file-name');
    outputFileName = core.getInput('output-file-name');
    desviationError = +core.getInput('desviation-error');
    desviationLatency = +core.getInput('desviation-latency');
    baseLatency = JSON.parse(core.getInput('base-latency'));
  }

  const file = readFileSync(inputFileName)
  const result = JSON.parse(file)

  const {
    vus,
    http_req_failed,
    http_req_duration,
    http_reqs,
  } = result.metrics

  const message = buildMessage(result.metrics, { desviation_error: desviationError, desviation_latency: desviationLatency, base_latency: baseLatency, })

  core.setOutput('message', message)

  if (outputFileName) {
    const outputObject = {
      total_reqs: http_reqs.values.count,
      total_failed_reqs: http_req_failed.values.passes,
      percentage_of_error: http_req_failed.values.rate == 1 ? +http_req_failed.values.rate.toFixed(2).replace('.', '') : +http_req_failed.values.rate.toFixed(2).split('.')[1],
      reqs_per_second: +http_reqs.values.rate.toFixed(0),
      vus: {
        min: vus.values.min,
        max: vus.values.max,
      },
      latency: {
        "avg": http_req_duration.values.avg.toFixed(2) + 'ms',
        "min": http_req_duration.values.min.toFixed(2) + 'ms',
        "max": http_req_duration.values.max.toFixed(2) + 'ms',
        "p(90)": http_req_duration.values['p(90)'].toFixed(2) + 'ms',
        "p(95)": http_req_duration.values['p(95)'].toFixed(2) + 'ms'
      },
    }

    writeFileSync(outputFileName, JSON.stringify(outputObject))
  }

  core.info('finalized with success!')
} catch (error) {
  core.error(error)
  core.error('submit an issue in https://github.com/ramonpaolo/action-benchmark/issue')
}
