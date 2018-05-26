# train-ose

JavaScript client for the Greek 🇬🇷 [trainOSE](https://www.trainose.gr) railway API. Complies with the [friendly public transport format](https://github.com/public-transport/friendly-public-transport-format). Inofficial, using *trainOSE* endpoints. Ask them for permission before using this module in production. *Work in progress.*

[![npm version](https://img.shields.io/npm/v/train-ose.svg)](https://www.npmjs.com/package/train-ose)
[![Build Status](https://travis-ci.org/juliuste/train-ose.svg?branch=master)](https://travis-ci.org/juliuste/train-ose)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/train-ose.svg)](https://greenkeeper.io/)
[![dependency status](https://img.shields.io/david/juliuste/train-ose.svg)](https://david-dm.org/juliuste/train-ose)
[![license](https://img.shields.io/github/license/juliuste/train-ose.svg?style=flat)](license)
[![fptf version](https://fptf.badges.juliustens.eu/badge/juliuste/train-ose)](https://fptf.badges.juliustens.eu/link/juliuste/train-ose)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

```shell
npm install --save train-ose
```

## Usage

```javascript
const trainOSE = require('train-ose')
```

This package contains data in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) and provides the following methods:

- [`stations()`](docs/stations.md) to get a list of operated stations, such as `Αθήνα` (Athens) or `Θεσσαλονίκη` (Thessaloniki).
- [`edges()`](docs/edges.md) to get a list of pairs of adjacent stations and their distance (as in *edges* of the greek railway network graph).
- [`journeys(origin, destination, date = new Date())`](docs/journeys.md) to get routes between stations.

## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/train-ose/issues).
