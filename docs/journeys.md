# `journeys(origin, destination, date = new Date())`

Get directions for routes from A to B. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an array of `journey`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

`origin` and `destination` must be `station` objects or ids (use the [`stations`](stations.md) method to get this information).

`date` must be a JS `Date` object.

## Example

```js
const athens = {
    type: "station",
    id: "ΑΘΗΝ",
    name: "Αθήνα",
    nameEnglish: "Athens",
    location: {
        type: "location",
        longitude: 23.7208405,
        latitude: 37.9926109,
        country: "GR",
        timezone: "Europe/Athens"
    },
    active: true
}

const thessaloniki = 'ΘΕΣΣ'

const trainOSE = require('train-ose')

trainOSE.journeys(thessaloniki, athens, new Date())
.then(console.log)
.catch(console.error)
```

## Response

```js
[
    {
        type: "journey",
        legs: [
            {
                origin: {
                    type: "station",
                    id: "ΘΕΣΣ",
                    name: "Θεσσαλονίκη",
                    nameEnglish: "Thessaloniki",
                    location: {
                        type: "location",
                        longitude: 22.9297791,
                        latitude: 40.6444092,
                        country: "GR",
                        timezone: "Europe/Athens"
                    },
                    active: true
                },
                destination: {
                    type: "station",
                    id: "ΑΘΗΝ",
                    name: "Αθήνα",
                    nameEnglish: "Athens",
                    location: {
                        type: "location",
                        longitude: 23.7208405,
                        latitude: 37.9926109,
                        country: "GR",
                        timezone: "Europe/Athens"
                    },
                    active: true
                },
                departure: "2018-06-19T05:13:00+03:00",
                arrival: "2018-06-19T10:23:00+03:00",
                mode: "train",
                public: true,
                operator: "trainOSE",
                line: {
                    type: "line",
                    id: "51",
                    name: "51",
                    mode: "train",
                    operator: "trainOSE"
                },
                price: {
                    currency: "EUR",
                    amount: 25.1,
                    class: "B",
                    reduced: false,
                    available: 238
                },
                tariffs: [
                    {
                        currency: "EUR",
                        amount: 35.1,
                        class: "A",
                        reduced: false,
                        available: 20
                    },
                    {
                        currency: "EUR",
                        amount: 20.3,
                        class: "A",
                        reduced: true,
                        available: 20
                    },
                    {
                        currency: "EUR",
                        amount: 25.1,
                        class: "B",
                        reduced: false,
                        available: 238
                    },
                    {
                        currency: "EUR",
                        amount: 20.3,
                        class: "B",
                        reduced: true,
                        available: 238
                    }
                ],
                schedule: "ΘΕΣΣ_2018-06-19T05:13:00+03:00_ΑΘΗΝ_2018-06-19T10:23:00+03:00_51"
            }
        ],
        price: {
            amount: 25.1,
            currency: "EUR",
            class: "B",
            reduced: false,
            available: 238
        },
        id: "ΘΕΣΣ_2018-06-19T05:13:00+03:00_ΑΘΗΝ_2018-06-19T10:23:00+03:00_51"
    }
    // …
]
```
