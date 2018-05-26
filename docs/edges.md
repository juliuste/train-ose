# `edges()`

Get a list of pairs of connected stations and their distance (**undirected** edges). Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in an array that looks as follows:

```js
const trainOSE = require('trainOSE')

trainOSE.edges()
.then(console.log)
.catch(console.error)
```

## Response

```js
[
    {
        source: "ΠΑΕΡ", // station id
        target: "ΠΚΡΩ", // station id
        distance: 14.57 // distance in km
    },
    {
        source: "ΠΚΡΩ",
        target: "ΠΑΕΡ",
        distance: 14.57
    },
    {
        source: "ΠΑΣΠ",
        target: "ΠΑΝΛ",
        distance: 2.87
    }
    // …
]
```
