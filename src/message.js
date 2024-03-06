const { readFileSync, writeFileSync } = require("fs")
const { resolve } = require("path")
const { cwd } = require("process")

/**
 * @param {String} tag - The fixed value in MESSAGE.md
 * @param {String | Number} value - The value to put in tag
 * @param {String} file - The name of Markdown file to write
 * @param {String?} emoji - The emoji
 */
const replaceTags = (tag, value, file, emoji) => {
  if (emoji)
    return file.replace(`{{ ${tag} }}`, `${value} ${emoji}`)
  return file.replace(`{{ ${tag} }}`, `${value}`)
}

const buildMessage = ({ vus, http_reqs, http_req_failed, http_req_duration }) => {
  const currentDirectory = cwd()
  
  const pathMessageTemplate = resolve(currentDirectory, 'markdown', 'MESSAGE_TEMPLATE.md')

  const messages = [
    ['MAX_VUS', vus.values.max, null],
    ['MIN_VUS', vus.values.min, null],
    ['TOTAL_TIME', (http_reqs.values.count / http_reqs.values.rate).toFixed(0) + 's', null],
    ['RPS', +http_reqs.values.rate.toFixed(0), null],
    ['TOTAL_REQUESTS', http_reqs.values.count, null],
    ['FAILED_REQUESTS', http_req_failed.values.passes, null],
    ['PERCENTAGE_ERROR', http_req_failed.values.rate == 1
      ? +http_req_failed.values.rate.toFixed(2).replace('.', '') : +http_req_failed.values.rate.toFixed(2).split('.')[1], null],
    ['LATENCY_AVG', http_req_duration.values.avg.toFixed(2) + 'ms', null],
    ['LATENCY_MAX', http_req_duration.values.max.toFixed(2) + 'ms', null],
    ['LATENCY_MIN', http_req_duration.values.min.toFixed(2) + 'ms', null],
    ['LATENCY_P90', http_req_duration.values['p(90)'].toFixed(2) + 'ms', null],
    ['LATENCY_P95', http_req_duration.values['p(95)'].toFixed(2) + 'ms', null],
  ]

  const file = readFileSync(pathMessageTemplate)

  let fileString = file.toString()

  messages.map(([tag, value, emoji]) => {
    fileString = replaceTags(tag, value, fileString, emoji)
  })

  return fileString;
}

module.exports = {
  buildMessage,
}
