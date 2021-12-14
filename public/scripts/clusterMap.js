mapboxgl.accessToken = 'pk.eyJ1IjoidXBwbGVlIiwiYSI6ImNreDNidjNwbTBqcjIybnFrenU2ZmpxbGwifQ.iUG-K29h-ccPztQ-hO-YGg';
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v10',
	center: [ -103.5917, 40.6699 ],
	zoom: 3
});

map.on('load', () => {
	// Add a new source from our GeoJSON data and
	// set the 'cluster' option to true. GL-JS will
	// add the point_count property to your source data.
	map.addSource('earthquakes', {
		type: 'geojson',
		// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
		// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
		data: campgrounds,
		cluster: true,
		clusterMaxZoom: 14, // Max zoom to cluster points on
		clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
	});

	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'earthquakes',
		filter: [ 'has', 'point_count' ],
		paint: {
			// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
			// with three steps to implement three types of circles:
			//   * Blue, 20px circles when point count is less than 100
			//   * Yellow, 30px circles when point count is between 100 and 750
			//   * Pink, 40px circles when point count is greater than or equal to 750
			'circle-color': [ 'step', [ 'get', 'point_count' ], '#e69122', 10, '#d1691f', 30, '#e3431b' ],
			'circle-radius': [ 'step', [ 'get', 'point_count' ], 20, 10, 30, 20, 40 ]
		}
	});

	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: 'earthquakes',
		filter: [ 'has', 'point_count' ],
		layout: {
			'text-field': '{point_count_abbreviated}',
			'text-font': [ 'DIN Offc Pro Medium', 'Arial Unicode MS Bold' ],
			'text-size': 12
		}
	});

	map.addLayer({
		id: 'unclustered-point',
		type: 'circle',
		source: 'earthquakes',
		filter: [ '!', [ 'has', 'point_count' ] ],
		paint: {
			'circle-color': '#11b4da',
			'circle-radius': 4,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff'
		}
	});

	// inspect a cluster on click
	map.on('click', 'clusters', (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: [ 'clusters' ]
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource('earthquakes').getClusterExpansionZoom(clusterId, (err, zoom) => {
			if (err) return;

			map.easeTo({
				center: features[0].geometry.coordinates,
				zoom: zoom
			});
		});
	});

	// When a click event occurs on a feature in
	// the unclustered-point layer, open a popup at
	// the location of the feature, with
	// description HTML from its properties.
	map.on('click', 'unclustered-point', (e) => {
		const text = e.features[0].properties.popUpMarkup;
		console.log(text);
		const coordinates = e.features[0].geometry.coordinates.slice();

		new mapboxgl.Popup().setLngLat(coordinates).setHTML(text).addTo(map);
	});

	map.on('mouseenter', 'clusters', () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'clusters', () => {
		map.getCanvas().style.cursor = '';
	});
});
