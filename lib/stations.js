'use strict'

const got = require('got')
const _transformISOCode = require('i18n-iso-countries').alpha3ToAlpha2
const timezonesForCountry = require('country-tz').getTimeZonesByCode
const intoStream = require('into-stream').object

const transformISOCode = c => {
	if (c === 'SKO') return _transformISOCode('MKD') // sigh… without taking any specific side here: MKD is the ISO-standard
	else return _transformISOCode(c)
}

const timezoneForCountry = cISO => {
	const timezones = timezonesForCountry(cISO)
	if (timezones.length !== 1) throw new Error('multiple or zero possible timezones for country, please report this issue')
	return timezones[0]
}

const getActiveBool = a => {
	if (+a === 1) return true
	if (+a === 0) return false
	throw new Error('unexpected IS_ACTIVE result, please report this issue')
}

const createStation = station => {
	const countryISO = transformISOCode(station.COUNTRY)
	return ({
		type: 'station',
		id: station.STAT + '',
		name: station.LABEL_EL,
		nameEnglish: station.LABEL_EN,
		location: {
			type: 'location',
			longitude: +station.LON,
			latitude: +station.LAT,
			country: countryISO,
			timezone: timezoneForCountry(countryISO)
		},
		active: getActiveBool(station.IS_ACTIVE)
		// todo: TYPOS
	})
}

const allAsync = async (opt) => {
	const network = await (got.get('https://extranet.trainose.gr/services/passenger_public/mobile_app/ajax.php', {
		json: true,
		query: {
			c: 'm.data',
			client_platform: 'ios',
			client_version: '2.1.1',
			op: 'getDiktyo'
		}
	}).then(res => res.body))

	return network.data.nodes.map(createStation)
}

const all = (opt = {}) => {
	return intoStream(allAsync(opt))
}
all.features = {} // required by fpti

module.exports = { all }
