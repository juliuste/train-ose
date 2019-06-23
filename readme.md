# train-ose

JavaScript client for the Greek 🇬🇷 [trainOSE](https://www.trainose.gr) railway API. Inofficial, using *trainOSE* endpoints. Ask them for permission before using this module in production.

[![npm version](https://img.shields.io/npm/v/train-ose.svg)](https://www.npmjs.com/package/train-ose)
[![Build Status](https://travis-ci.org/juliuste/train-ose.svg?branch=master)](https://travis-ci.org/juliuste/train-ose)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/train-ose.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/juliuste/train-ose.svg?style=flat)](license)
[![fpti-js version](https://fpti-js.badges.juliustens.eu/badge/juliuste/train-ose)](https://fpti-js.badges.juliustens.eu/link/juliuste/train-ose)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

```shell
npm install --save train-ose
```

## Usage

```javascript
const trainOSE = require('train-ose')
```

The `train-ose` module conforms to the [FPTI-JS `0.3.2` standard](https://github.com/public-transport/fpti-js/tree/0.3.2) for JavaScript public transportation modules and exposes the following methods:

Method | Feature description | [FPTI-JS `0.3.2`](https://github.com/public-transport/fpti-js/tree/0.3.2)
-------|---------------------|--------------------------------------------------------------------
[`stations.all([opt])`](#stationsallopt) | All stations of the *TrainOSE* network, such as `Αθήνα` (Athens) or `Θεσσαλονίκη` (Thessaloniki) | [✅ yes](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/stations-stops-regions.all.md)
[`journeys(origin, destination, [opt])`](#journeysorigin-destination-opt) | Journeys between stations | [✅ yes](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/journeys.md)
[`edges()`](#edges) | All pairs of adjacent stations and their distance (as in *edges* of the greek railway network graph) | ❌ no

---

### `stations.all([opt])`

Get **all** stations of the *TrainOSE* network, such as `Αθήνα` (Athens) or `Θεσσαλονίκη` (Thessaloniki). See [this method in the FPTI-JS `0.3.2` spec](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/stations-stops-regions.all.md).

#### Supported Options

There currently aren't any supported options for this method, but this might change in a future release.

#### Example

```js
const trainOSE = require('train-ose')
const stationStream = trainOSE.stations.all()

stationStream.on('data', item => {
    // item is an FPTF station object
    console.log(item)
})
```

```js
{
    type: "station",
    id: "ΑΘΗΝ",
    name: "Αθήνα",
    nameEnglish: "Athens",
    location: {
        type: "location",
        longitude: 23.720840454101562,
        latitude: 37.992610931396484,
        country: "GR",
        timezone: "Europe/Athens"
    },
    active: true
}
```

---

### `journeys(origin, destination, [opt])`

Find journeys between stations. See [this method in the FPTI-JS `0.3.2` spec](https://github.com/public-transport/fpti-js/blob/0.3.2/docs/journeys.md).

#### Supported Options

Attribute | Description | FPTI-spec | Value type | Default
----------|-------------|------------|------------|--------
`when` | Journey date, synonym to `departureAfter` | ✅ | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/date) | `new Date()`
`departureAfter` | List journeys with a departure (first leg) after this date | ✅ | [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/date) | `new Date()`
`results` | Max. number of results returned | ✅ | `Number` | `null`
`interval` | Results for how many minutes after `when`/`departureAfter` | ✅ | `Number` | `null`
`transfers` | Max. number of transfers | ✅ | `Number` | `null`

**Please note that this module fetches a list of stations using the `stations.all()` method upon initialization, which takes about 1 second.**

Also note that, unless `opt.interval` is specified, the module will return journeys that start after `when`/`departureAfter`, but before the beginning of the following calendar day in `Europe/Athens` time zone.

#### Example

```js
const athens = 'ΑΘΗΝ' // station id
const thessaloniki = { // FPTF station
	type: 'station',
	id: 'ΘΕΣΣ'
	// …
}
trainOSE.journeys(athens, thessaloniki, { when: new Date('2019-06-27T05:00:00+0200'), transfers: 0 }).then(…)
```

```js
{
    type: "journey",
    legs: [
        {
            origin: {
                type: "station",
                id: "ΑΘΗΝ",
                name: "Αθήνα",
                nameEnglish: "Athens",
                location: {
                    type: "location",
                    longitude: 23.720840454101562,
                    latitude: 37.992610931396484,
                    country: "GR",
                    timezone: "Europe/Athens"
                },
                active: true
            },
            destination: {
                type: "station",
                id: "ΘΕΣΣ",
                name: "Θεσσαλονίκη",
                nameEnglish: "Thessaloniki",
                location: {
                    type: "location",
                    longitude: 22.929779052734375,
                    latitude: 40.6444091796875,
                    country: "GR",
                    timezone: "Europe/Athens"
                },
                active: true
            },
            departure: "2019-06-27T06:22:00.000+03:00",
            arrival: "2019-06-27T10:32:00.000+03:00",
            mode: "train",
            public: true,
            operator: {
                type: "operator",
                id: "trainOSE",
                name: "trainOSE",
                url: "https://www.trainose.gr"
            },
            line: {
                type: "line",
                id: "50",
                name: "50",
                mode: "train",
                operator: {
                    type: "operator",
                    id: "trainOSE",
                    name: "trainOSE",
                    url: "https://www.trainose.gr"
                }
            },
            price: {
                currency: "EUR",
                amount: 25.1,
                class: "B",
                reduced: false,
                available: 218
            },
            tariffs: [
                {
                    currency: "EUR",
                    amount: 35.1,
                    class: "A",
                    reduced: false,
                    available: 52
                },
                {
                    currency: "EUR",
                    amount: 20.3,
                    class: "A",
                    reduced: true,
                    available: 52
                },
                {
                    currency: "EUR",
                    amount: 25.1,
                    class: "B",
                    reduced: false,
                    available: 218
                },
                {
                    currency: "EUR",
                    amount: 20.3,
                    class: "B",
                    reduced: true,
                    available: 218
                }
            ]
        }
    ],
    price: {
        amount: 25.1,
        currency: "EUR",
        class: "B",
        reduced: false,
        available: 218
    },
    id: "ΑΘΗΝ_2019-06-27T06:22:00.000+03:00_ΘΕΣΣ_2019-06-27T10:32:00.000+03:00_50"
}
```

---

---

### `edges()`

All pairs of adjacent stations and their distance (as in *edges* of the greek railway network graph). Returns a `Readable` stream in object mode.

#### Example

```js
const edgeStream = trainOSE.edges()
edgeStream.on('data', item => {
    console.log(item)
})
```

```js
{
    "source": "ΑΓΥΑ",
    "target": "ΚΑΣΛ",
    "distance": 2.1
}
```

## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/train-ose/issues).
