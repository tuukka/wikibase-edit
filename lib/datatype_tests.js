const { isEntityId, isItemId } = require('wikibase-sdk')
const _ = require('./utils')
const { parseUnit } = require('./claim/quantity')
const error_ = require('./error')

module.exports = {
  string: _.isNonEmptyString,
  entity: isEntityId,
  // See https://www.mediawiki.org/wiki/Wikibase/DataModel#Dates_and_times
  // The positive years will be signed later
  time: time => {
    time = time.value || time
    var precision
    if (_.isPlainObject(time)) {
      precision = time.precision
      time = time.time
      if (typeof precision !== 'number' || precision < 0 || precision > 14) {
        return false
      }
      if (precision > 11) throw error_.new('time precision not supported by the Wikibase API', { time, precision })
    }
    time = time.toString()
    const year = time.replace(/^-/, '').split('-')[0]
    // Parsing as an ISO String should not throw an Invalid time value error
    // Only trying to parse 5-digit years or below, as higher years
    // will fail, even when valid Wikibase dates
    if (year.length <= 5) {
      try {
        new Date(time).toISOString()
      } catch (err) {
        return false
      }
    }
    if (precision != null && precision > 11) {
      return /^(-|\+)?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2,3}Z$/.test(time)
    } else if (time.match('T')) {
      return /^(-|\+)?\d{4,16}-\d{2}-\d{2}T00:00:00(\.000)?Z$/.test(time)
    } else {
      return /^(-|\+)?\d{4,16}(-\d{2}){0,2}$/.test(time)
    }
  },
  monolingualtext: value => {
    value = value.value || value
    const { text, language } = value
    return _.isNonEmptyString(text) && _.isNonEmptyString(language)
  },
  // cf https://www.mediawiki.org/wiki/Wikibase/DataModel#Quantities
  quantity: amount => {
    var unit
    amount = amount.value || amount
    if (_.isPlainObject(amount)) {
      unit = amount.unit || amount.value.unit
      amount = amount.amount || amount.value.amount
      if (!isItemId(parseUnit(unit)) && unit !== '1') return false
    } else {
      unit = '1'
    }
    // Accepting both numbers or string numbers as the amount will be
    // turned as a string lib/claim/builders.js signAmount function anyway
    return _.isNumber(amount) || _.isStringNumber(amount)
  },
  globecoordinate: obj => {
    obj = obj.value || obj
    if (!_.isPlainObject(obj)) return false
    const { latitude, longitude, precision } = obj
    return _.isNumber(latitude) && _.isNumber(longitude) && _.isNumber(precision)
  }
}
