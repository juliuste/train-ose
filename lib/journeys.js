'use strict'

const { journeys: validateArguments } = require('fpti-util').validateMethodArguments
const { DateTime } = require('luxon')
const merge = require('lodash/merge')
const take = require('lodash/take')
const got = require('got')
const sumBy = require('lodash/sumBy')
const minBy = require('lodash/minBy')
const getStream = require('get-stream').array

const { all: _stations } = require('./stations')
const stations = getStream(_stations())

const stationById = async (stationId) => {
	const s = await stations
	return s.find(x => x.id === stationId)
}

const operator = {
	type: 'operator',
	id: 'trainOSE',
	name: 'trainOSE',
	url: 'https://www.trainose.gr'
}

const hashLeg = (l) => [l.origin.id, l.departure, l.destination.id, l.arrival, l.line.id].join('_')
const hashJourney = (j) => j.legs.map(hashLeg).join('_')

const parseDate = (day, time, timezone) => {
	const dateString = `${day}_${time}`
	return DateTime.fromFormat(dateString, 'yyyyMMdd_H.m', { zone: timezone }).toISO()
}

// todo: delays
const createLeg = async (l) => {
	// todo: l.typos, l.dogs…, l.delay, l.…_real
	const origin = await stationById(l.apo)
	const destination = await stationById(l.ews)

	const departure = parseDate(l.date1, l.wra1, origin.location.timezone) // todo: wra1_real? there is no wra2_real, though… and there's l.delay as well…
	const arrival = parseDate(l.date2, l.wra2, destination.location.timezone)

	const leg = {
		origin,
		destination,
		departure,
		arrival,
		mode: 'train', // sigh…
		public: true,
		operator,
		line: {
			type: 'line',
			id: l.treno + '',
			name: l.treno + '',
			mode: 'train', // sigh…
			operator
		},
		price: {
			currency: 'EUR',
			amount: l.cost.b.e,
			class: 'B',
			reduced: false,
			available: l.seats.fb
		},
		tariffs: [
			{
				currency: 'EUR',
				amount: l.cost.a.e,
				class: 'A',
				reduced: false,
				available: l.seats.fa
			},
			{
				currency: 'EUR',
				amount: l.cost.a.k,
				class: 'A',
				reduced: true,
				available: l.seats.fa
			},
			{
				currency: 'EUR',
				amount: l.cost.b.e,
				class: 'B',
				reduced: false,
				available: l.seats.fb
			},
			{
				currency: 'EUR',
				amount: l.cost.b.k,
				class: 'B',
				reduced: true,
				available: l.seats.fb
			}
		]
	}

	leg.tariffs = leg.tariffs.filter(t => t.amount)
	if (!leg.price.amount) delete leg.price

	return leg
}

const createJourney = async (j) => {
	const legs = await Promise.all(j.segments.map(createLeg))
	const journey = {
		type: 'journey',
		legs
	}
	if (legs.every(l => !!l.price)) {
		journey.price = {
			amount: sumBy(legs, l => l.price.amount),
			currency: legs[0].price.currency,
			class: legs[0].price.class,
			reduced: false,
			available: minBy(legs, l => l.price.available).price.available
		}
	}
	journey.id = hashJourney(journey)
	return journey
}

const fetchJourneysForDate = async (origin, destination, options, date) => {
	const day = DateTime.fromJSDate(date, { zone: 'Europe/Athens' }).toFormat('yyyy-MM-dd')
	const { body: results } = await got.get('https://extranet.trainose.gr/services/passenger_public/mobile_app/ajax.php', {
		json: true,
		query: {
			apo: origin,
			c: 'dromologia', // todo, translates to "routes"
			client_platform: 'ios',
			client_version: '2.1.1',
			date: day,
			op: 'vres_dromologia', // todo, translates to "find_travels"
			pros: destination,
			rtn_date: undefined, // todo
			rtn_time: undefined, // todo
			rtn_time_type: undefined, // todo
			time: '23:59', // todo
			time_type: 'anaxwrhsh', // todo, translates to "departure"
			travel_type: 1, // todo
			'trena[]': [
				'apla', // todo, translates to "simply"
				'ic', // todo
				'ice', // todo
				'bed' // todo
			]
		}
	})
	return Promise.all(results.data.metabash.map(createJourney))
}

// default options
const defaults = () => ({
	// fpti options
	when: null,
	departureAfter: null,
	results: null,
	transfers: null,
	interval: null
})

const journeys = async (origin, destination, opt = {}) => {
	// merge options with defaults
	const def = defaults()
	if (!(opt.departureAfter || opt.when)) def.departureAfter = new Date()
	const options = merge({}, def, opt)

	// validate arguments, prepare origin and destination
	if (typeof origin !== 'string') origin = { ...origin, name: 'dummy' }
	if (typeof destination !== 'string') destination = { ...destination, name: 'dummy' }
	validateArguments(origin, destination, options)
	if (typeof origin !== 'string') origin = origin.id
	if (typeof destination !== 'string') destination = destination.id

	const date = options.when || options.departureAfter
	const endDate = DateTime.fromJSDate(date).plus({ minutes: options.interval || 0 }).toJSDate()

	let endDateReached = !options.interval || false
	let currentDate = date
	let journeys = []
	do {
		const newJourneys = await fetchJourneysForDate(origin, destination, options, currentDate)
		journeys.push(...newJourneys)

		currentDate = DateTime.fromJSDate(currentDate, { zone: 'Europe/Athens' }).plus({ days: 1 }).startOf('day').toJSDate()
		endDateReached = !options.interval || (+currentDate > +endDate)
	} while (!endDateReached)

	journeys = journeys.filter(j => +new Date(j.legs[0].departure) >= +date)
	if (typeof options.interval === 'number') journeys = journeys.filter(j => +new Date(j.legs[0].departure) <= +endDate)
	if (typeof options.transfers === 'number') journeys = journeys.filter(j => j.legs.length <= options.transfers + 1)
	if (typeof options.results === 'number') journeys = take(journeys, options.results)
	return journeys
}
journeys.features = { // required by fpti
	when: 'Journey date, synonym to departureAfter',
	departureAfter: 'List journeys with a departure (first leg) after this date',
	results: 'Max. number of results returned',
	transfers: 'Max. number of transfers',
	interval: 'Results for how many minutes after / before when (depending on whenRepresents)'
}

module.exports = journeys
