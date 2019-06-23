'use strict'

const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)
const validate = require('validate-fptf')()
const isBoolean = require('lodash/isBoolean')
const isNumber = require('lodash/isNumber')
const { DateTime } = require('luxon')
const fptiTests = require('fpti-tests')
const getStream = require('get-stream').array

const trainOSE = require('.')
const pkg = require('./package.json')

const when = DateTime.fromObject({ zone: 'Europe/Athens', weekday: 4 }).plus({ weeks: 1, hours: 5 }).toJSDate() // next thursday, 05:00
const isStationWithEnglishName = (s, name) => (s.type === 'station' && s.nameEnglish === name)

tape('train-ose fpti tests', async t => {
	await t.doesNotReject(fptiTests.packageJson(pkg), 'valid package.json')
	t.doesNotThrow(() => fptiTests.packageExports(trainOSE, ['stations.all', 'journeys']), 'valid module exports')
	t.doesNotThrow(() => fptiTests.stationsAllFeatures(trainOSE.stations.all.features, []), 'valid stations.all features')
	t.doesNotThrow(() => fptiTests.journeysFeatures(trainOSE.journeys.features, ['when', 'departureAfter', 'results', 'interval', 'transfers']), 'valid journeys features')
})

tape('train-ose.stations & train-ose.edges', async t => {
	const stations = await getStream(trainOSE.stations.all())
	t.ok(stations.length > 30, 'stations length')

	// base-check all stations
	for (let station of stations) {
		t.doesNotThrow(() => validate(station), 'valid fptf')
		t.ok(station.location.country.length === 2, 'station location country')
		t.ok(station.location.timezone.length > 8, 'station location timezone')
		t.ok(station.location.timezone.indexOf('Europe/') === 0, 'station location timezone')
		t.ok(isBoolean(station.active), 'station active')
	}

	// deep-check athens station
	const athens = stations.find(x => x.id === 'ΑΘΗΝ')
	t.ok(athens.name === 'Αθήνα', 'athens name')
	t.ok(athens.nameEnglish === 'Athens', 'athens nameEnglish')
	t.ok(athens.location.country === 'GR', 'athens location country')
	t.ok(athens.location.timezone === 'Europe/Athens', 'athens location timezone')
	t.ok(athens.active === true, 'athens active')

	// check edges
	const edges = await getStream(trainOSE.edges())
	t.ok(edges.length > 30, 'edges length')

	for (let edge of edges) {
		t.ok(edge.source, 'edge source')
		const source = stations.find(x => x.id === edge.source)
		t.ok(source, 'edge source')

		t.ok(edge.target, 'edge target')
		const target = stations.find(x => x.id === edge.target)
		t.ok(target, 'edge target')

		t.ok(isNumber(edge.distance), 'edge distance')
		t.ok(edge.distance > 0, 'edge distance')
	}
})

tape('train-ose.journeys', async t => {
	const athens = 'ΑΘΗΝ'
	const thessaloniki = 'ΘΕΣΣ'

	const journeys = await trainOSE.journeys(athens, thessaloniki, { when })
	t.ok(journeys.length >= 3, 'number of journeys')
	for (let journey of journeys) {
		t.doesNotThrow(() => validate(journey), 'valid fptf')
		t.ok(isStationWithEnglishName(journey.legs[0].origin, 'Athens'), 'origin')
		t.ok(isStationWithEnglishName(journey.legs[journey.legs.length - 1].destination, 'Thessaloniki'), 'destination')
		t.ok(+new Date(journey.legs[0].departure) >= +when, 'departure')

		for (let leg of journey.legs) {
			t.ok(leg.mode === 'train', 'leg mode')
			t.ok(leg.operator.id === 'trainOSE', 'leg operator')
			t.doesNotThrow(() => validate(leg.line), 'valid fptf')
			t.ok(leg.line.mode === 'train', 'leg line mode')
			t.ok(leg.line.operator.id === 'trainOSE', 'leg line operator')

			t.ok(leg.tariffs.length > 0, 'leg tariffs')
			t.ok(leg.price.amount > 0, 'leg price amount')
			t.ok(leg.price.currency === 'EUR', 'leg price currency')
			t.ok(leg.price.reduced === false, 'leg price reduced')
			t.ok(Number.isInteger(leg.price.available), 'leg price available')
			t.ok(leg.price.class === 'B', 'leg price class')
		}

		t.ok(journey.price.amount > 0, 'price amount')
		t.ok(journey.price.currency === 'EUR', 'price currency')
		t.ok(journey.price.reduced === false, 'journey price reduced')
		t.ok(Number.isInteger(journey.price.available), 'journey price available')
		t.ok(journey.price.class === 'B', 'journey price class')
	}
})

tape('train-ose.journeys opt.results, opt.departureAfter', async t => {
	const athens = 'ΑΘΗΝ'
	const thessaloniki = 'ΘΕΣΣ'

	const journeys = await trainOSE.journeys(athens, thessaloniki, { departureAfter: when, results: 2 })
	t.ok(journeys.length === 2, 'number of journeys')
	for (let journey of journeys) t.doesNotThrow(() => validate(journey), 'valid fptf')
})

tape('train-ose.journeys opt.transfers', async t => {
	const athens = 'ΑΘΗΝ'
	const drama = 'ΔΡΑΜ'

	const journeysWithoutTransfer = await trainOSE.journeys(athens, drama, { when, transfers: 0 })
	t.ok(journeysWithoutTransfer.length === 0, 'number of journeys')

	const journeysWithTransfer = await trainOSE.journeys(athens, drama, { when, transfers: 2 })
	t.ok(journeysWithTransfer.length > 0, 'number of journeys')
	for (let journey of journeysWithTransfer) {
		t.doesNotThrow(() => validate(journey), 'valid fptf')
		t.ok(journey.legs.length === 2, 'number of legs')
	}
})

tape('train-ose.journeys opt.interval', async t => {
	const athens = 'ΑΘΗΝ'
	const drama = 'ΔΡΑΜ'
	const dayAfterWhen = DateTime.fromJSDate(when, { zone: 'Europe/Athens' }).plus({ days: 1 }).toJSDate()

	const journeysWithoutInterval = await trainOSE.journeys(drama, athens, { when })
	for (let journey of journeysWithoutInterval) t.doesNotThrow(() => validate(journey), 'valid fptf')
	t.ok(journeysWithoutInterval.length > 0, 'precondition')
	const journeysWithoutIntervalDayAfterWhen = journeysWithoutInterval.filter(journey => +new Date(journey.legs[0].departure) >= +dayAfterWhen)
	t.ok(journeysWithoutIntervalDayAfterWhen.length === 0, 'number of journeys')

	const journeysWithInterval = await trainOSE.journeys(drama, athens, { when, interval: 30 * 60 }) // journeys for the next 30h
	for (let journey of journeysWithInterval) t.doesNotThrow(() => validate(journey), 'valid fptf')
	t.ok(journeysWithInterval.length > 0, 'precondition')
	const journeysWithIntervalDayAfterWhen = journeysWithInterval.filter(journey => +new Date(journey.legs[0].departure) >= +dayAfterWhen)
	t.ok(journeysWithIntervalDayAfterWhen.length > 0, 'number of journeys')
})
