# `stations()`

Get a list of all stations. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in an array of `station`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

```js
const trainOSE = require('trainOSE')

trainOSE.stations()
.then(console.log)
.catch(console.error)
```

## Response

```js
[
    {
        type: "station",
        id: "ΑΒΑΣ",
        name: "Άγιος Βασίλειος", // always in Greek, even for stations in neighbouring countries
        nameEnglish: "Agios Vassileios", // always in English
        location: {
            type: "location",
            longitude: 21.8205891,
            latitude: 38.3145294,
            country: "GR", // ISO 3166-1 alpha-2 code
            timezone: "Europe/Athens"
        },
        active: false
    },
    {
        type: "station",
        id: "ΑΓΓΕ",
        name: "Αγγείαι",
        nameEnglish: "Aggeie",
        location: {
            type: "location",
            longitude: 22.1905403,
            latitude: 39.0905685,
            country: "GR",
            timezone: "Europe/Athens"
        },
        active: true
    }
    // …
]
```
