'use strict'

const got = require('got')
const moment = require('moment-timezone')
const isString = require('lodash/isString')
const isObject = require('lodash/isObject')
const isDate = require('lodash/isDate')
const sumBy = require('lodash/sumBy')
const minBy = require('lodash/minBy')

const _stations = require('./stations')
const stations = _stations()

const stationById = async (stationId) => {
    const s = await stations
    return s.find(x => x.id === stationId)
}

const hashLeg = (l) => [l.origin.id, l.departure, l.destination.id, l.arrival, l.line.id].join('_')
const hashJourney = (j) => j.legs.map(l => l.schedule).join('_')

// todo: delays
const createLeg = async (l) => {
    // todo: l.typos, l.dogs…, l.delay, l.…_real
    const origin = await stationById(l.apo)
    const destination = await stationById(l.ews)

    const departure = moment.tz(`${l.date1}_${l.wra1}`, 'YYYYMMDD_HH.mm', origin.location.timezone).format() // todo: wra1_real? there is no wra2_real, though… and there's l.delay as well…
    const arrival = moment.tz(`${l.date2}_${l.wra2}`, 'YYYYMMDD_HH.mm', destination.location.timezone).format()

    const leg = {
        origin,
        destination,
        departure,
        arrival,
        mode: 'train', // sigh…
        public: true,
        operator: 'trainOSE',
        line: {
            type: 'line',
            id: l.treno,
            name: l.treno,
            mode: 'train', // sigh…
            operator: 'trainOSE'
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

    leg.schedule = hashLeg(leg)
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

const journeys = async (origin, destination, date = new Date()) => {
    if(isString(origin)) origin = {id: origin, type: 'station'}
    if(!isString(origin.id)) throw new Error('invalid or missing origin id')
    if(origin.type !== 'station') throw new Error('invalid or missing origin type')
    origin = origin.id

    if(isString(destination)) destination = {id: destination, type: 'station'}
    if(!isString(destination.id)) throw new Error('invalid or missing destination id')
    if(destination.type !== 'station') throw new Error('invalid or missing destination type')
    destination = destination.id

    if(!isDate(date)){
        throw new Error('`date` must be a JS Date() object')
    }
    const day = moment.tz(date, 'Europe/Athens').format('YYYY-MM-DD')

    const results = await (got.get('https://extranet.trainose.gr/services/passenger_public/mobile_app/ajax.php', {
        json: true,
        query: {
            apo: origin,
            c: 'dromologia', // todo, translates to "routes"
            // client_platform: 'ios', // todo: optional?
            // client_version: '1.5.1', // todo: optional?
            // date: day,
            date: '2018-06-19',
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
    }).then(res => res.body))

    return (await Promise.all(results.data.metabash.map(createJourney)))
}

module.exports = journeys
