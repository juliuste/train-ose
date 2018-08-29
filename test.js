'use strict'

const tape = require('tape')
const validate = require('validate-fptf')
const isBoolean = require('lodash/isBoolean')
const isNumber = require('lodash/isNumber')
const moment = require('moment-timezone')
const trainOSE = require('./index')

tape('train-ose.stations & train-ose.edges', async (t) => {
	const s = await trainOSE.stations()
	t.ok(s.length > 30, 'stations length')

	for(let station of s) {
		validate(station)
		t.ok(station.location.country.length === 2, 'station location country')
		t.ok(station.location.timezone.length > 8, 'station location timezone')
		t.ok(station.location.timezone.indexOf('Europe/') === 0, 'station location timezone')

		t.ok(isBoolean(station.active), 'station active')
	}

	const athens = s.find(x => x.id === 'ΑΘΗΝ')
	t.ok(athens.name === 'Αθήνα', 'athens name')
	t.ok(athens.nameEnglish === 'Athens', 'athens nameEnglish')
	t.ok(athens.location.country === 'GR', 'athens location country')
	t.ok(athens.location.timezone === 'Europe/Athens', 'athens location timezone')
	t.ok(athens.active === true, 'athens active')

	const e = await trainOSE.edges()
	t.ok(e.length > 30, 'edges length')

	for (let edge of e) {
		t.ok(edge.source, 'edge source')
		const source = s.find(x => x.id === edge.source)
		t.ok(source, 'edge source')

		t.ok(edge.target, 'edge target')
		const target = s.find(x => x.id === edge.target)
		t.ok(target, 'edge target')

		t.ok(isNumber(edge.distance), 'edge distance')
		t.ok(edge.distance > 0, 'edge distance')
	}

	t.end()
})

tape('train-ose.journeys', async (t) => {
	const j = await trainOSE.journeys('ΑΘΗΝ', 'ΘΕΣΣ', moment.tz('Europe/Athens').add(3, 'days').startOf('day').toDate())

	t.ok(j.length > 0, 'journeys length')

	for (let journey of j) {
		validate(journey)

		t.ok(journey.legs[0].origin.id === 'ΑΘΗΝ', 'origin id')
		t.ok(journey.legs[journey.legs.length-1].destination.id === 'ΘΕΣΣ', 'destination id')

		for (let l of journey.legs) {
			t.ok(l.operator === 'trainOSE', 'leg operator')
			t.ok(l.line.operator === 'trainOSE', 'leg line operator')
			t.ok(l.tariffs.length > 0, 'leg tariffs')
			t.ok(l.price.amount > 0, 'leg price amount')
			t.ok(l.price.currency === 'EUR', 'leg price currency')
			t.ok(l.price.reduced === false, 'leg price reduced')
			t.ok(isNumber(l.price.available), 'leg price available')
			t.ok(l.price.class === 'B', 'leg price class')
		}

		t.ok(journey.price.amount > 0, 'journey price amount')
		t.ok(journey.price.currency === 'EUR', 'journey price currency')
		t.ok(journey.price.reduced === false, 'journey price reduced')
		t.ok(isNumber(journey.price.available), 'journey price available')
		t.ok(journey.price.class === 'B', 'journey price class')
	}

	t.end()
})
