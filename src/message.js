const { readFileSync } = require("fs")
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

const createTags = (arr, obj, prefix, sufix, base_latency, desviation_latency) => {
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = key.toUpperCase().replace('(', '').replace(')', '')

    const tagName = `${prefix}_${sanitizedKey}`
    const tagValue = `${value.toFixed(2)}${sufix}`

    let emoji = null;

    if (prefix === 'LATENCY')
      emoji = value - (base_latency[sanitizedKey] * desviation_latency) <= base_latency[sanitizedKey] ? '✅' : '🙅🏼'

    arr.push([tagName, tagValue, emoji])
  }

  return arr;
}

const buildMessage = ({ vus, http_reqs, http_req_failed, http_req_duration }, { desviation_error, desviation_latency, base_latency, }) => {
  const currentDirectory = cwd()

  const pathMessageTemplate = resolve(currentDirectory, 'markdown', 'MESSAGE_TEMPLATE.md')

  let arr = []

  createTags(arr, http_req_duration.values, 'LATENCY', 'ms', base_latency, desviation_latency)
  createTags(arr, http_req_failed.values, 'HTTP_FAILED', '')
  createTags(arr, http_reqs.values, 'HTTP', '')
  createTags(arr, vus.values, 'VUS', '')


  arr.push(['TOTAL_TIME', (http_reqs.values.count / http_reqs.values.rate).toFixed(0) + 's', null])
  arr.push(['DESVIATION', desviation_latency * 100, null])
  arr.push(['PERCENTAGE_ERROR', http_req_failed.values.rate == 1
    ? +http_req_failed.values.rate.toFixed(2).replace('.', '') : +http_req_failed.values.rate.toFixed(2).split('.')[1], http_req_failed.values.rate <= desviation_error ? '✅' : '🙅🏼'])

  const file = readFileSync(pathMessageTemplate)

  let fileString = file.toString()

  arr.map(([tag, value, emoji]) => {
    fileString = replaceTags(tag, value, fileString, emoji)
  })

  return fileString;
}

module.exports = {
  buildMessage,
}
