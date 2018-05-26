'use strict'

const got = require('got')

const createEdge = e => ({
    source: ''+e.NODE1,
	target: ''+e.NODE2,
	distance: +e.DIST_KM
})

const edges = async () => {
	const network = await (got.get('https://extranet.trainose.gr/services/passenger_public/mobile_app/ajax.php', {
		json: true,
		query: {
			c: 'm.data',
			// client_platform: 'ios',
			// client_version: '1.5.1',
			op: 'getDiktyo'
		}
	}).then(res => res.body))

	return network.data.edges.map(createEdge)
}

module.exports = edges
