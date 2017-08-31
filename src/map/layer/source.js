import _style from './style'

const openlayers = require('../../../node_modules/openlayers/dist/ol-debug.js')

let _source = {}
export default _source = {
  /**
   * __feature
   * Utility method for creating a source feature
   *
   * @param data ol.geom.*
   * @returns {ol.Feature}
   * @private
   */
  __feature: (data, style, state, meta) => {
    let feature = new openlayers.Feature()
    feature.setGeometry(data)
    if (style) {
      feature.setStyle(style)
    }
    if (state) {
      feature.set('state', state)
    }
    if (meta) {
      feature.set('meta', meta)
    }
    return feature
  },
  /**
   * __attributions
   * Utility method for creating source attributions. Can
   * be either a single string, or an array of strings
   *
   * @param data String | Array
   * @returns {Array(ol.Attribution)}
   * @private
   */
  __attributions: (data) => {
    let attributions = []
    if (data) {
      if (Array.isArray(data)) {
        for (var d in data) {
          attributions.push(new openlayers.Attribution({html: data[d]}))
        }
      } else {
        let attribution = new openlayers.Attribution({
          html: data
        })
        attributions.push(attribution)
      }
    }
    return attributions
  },
  /**
   * __normalize
   * Utility method for standardizing all point projections
   *
   * @param coordinates
   * @returns Array(transformedCoordinates)
   * @private
   */
  __normalize: (coordinates) => {
    return openlayers.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857')
  },
  /**
   * __stylize
   * Test if this feature has a unique style and apply that style
   *
   * @param data
   * @returns {ol.Style}
   * @private
   */
  __stylize: (data) => {
    let styl
    if (data.method) {
      styl = data.method
    } else {
      styl = _style(data)
    }
    return styl
  },
  /**
   * _point
   * Utility method for creating a single point feature.
   * Points are unique in that each point can have a
   * different style aassociated with the feature
   *
   * @param data Array[longitude, latitude]
   * @returns {ol.Feature}
   * @private
   */
  _point: (data) => {
    let feature, coords, styl, state, meta
    if (Array.isArray(data)) {
      coords = data
    } else {
      coords = data.coordinates
      if (data.state) {
        state = data.state
      }
      if (data.meta) {
        meta = data.meta
      }
    }
    if (typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style)
    }
    feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), styl, state, meta)
    return feature
  },
  /**
   * _shape
   * Create a single Polygon feature
   *
   * @param data Object
   * @returns {ol.Feature}
   */
  _shape: (data) => {
    let feature, styl, state, meta
    let vertices = []
    for (let d = 0; d < data.coordinates.length; d++) {
      vertices.push(_source.__normalize(data.coordinates[d]))
    }
    if (data.state) {
      state = data.state
    }
    if (data.meta) {
      meta = data.meta
    }
    if (typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style)
    }
    feature = _source.__feature(new openlayers.geom.Polygon([vertices]), styl, state, meta)
    return feature
  },
  /**
   * _xyz
   * Create a single tile source
   *
   * @param data Object
   * @returns {}
   */
  _xyz: (data) => {
    let attributions, url
    if (data.attributions) {
      attributions = _source.__attributions(data.attributions)
    }
    if (data.url) {
      url = data.url
    } else { // If there's no tiles url, we don't have a layer
      return false
    }
    return {
      attributions: attributions,
      url: url
    }
  },
  /**
   * _image
   * Create a single image source
   *
   * @param data Object
   * @returns {}
   */
  _image: (data) => {
    // Create a "fake" layer so we can get the extents
    // where the image should place itself on our map
    let fake = _source.shape(data.coordinates)
    let extent = fake.getExtent()
    let attributions, url
    if (data.attributions) {
      attributions = _source.__attributions(data.attributions)
    }
    if (data.url) {
      url = data.url
    } else { // If there's no image url, we don't have a layer
      return false
    }
    return {
      attributions: attributions,
      url: url,
      imageExtent: extent
    }
  },
  /**
   * _radius
   * Create one radius feature
   *
   * @param data Object
   * @returns {ol.Feature}
   */
  _radius: (data) => {
    let feature, styl, state, meta
    let radiusMiles = data.radius
    let arrConversion = []
    arrConversion['degrees'] = (1 / (60 * 1.1508))
    arrConversion['dd'] = arrConversion['degrees']
    arrConversion['m'] = (1609.344)
    arrConversion['ft'] = (5280)
    arrConversion['km'] = (1.609344)
    arrConversion['mi'] = (1)
    arrConversion['inches'] = (63360)
    // need to multiply by sqrt(2)/2 or 1.41421356/2  because
    // were passing in RADIUS and that's a diagonal when drawing the square.  so we have to
    // adjust by root 2 so we get the actual sides in length that we want
    let r = radiusMiles * arrConversion[data.units] * (1.41421356 / 2)
    let c = _source.__normalize(data.coordinates)
    if (data.state) {
      state = data.state
    }
    if (data.meta) {
      meta = data.meta
    }
    if(typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style)
    }
    feature = _source.__feature(new openlayers.geom.Circle(c, r), styl, state, meta)
    return feature
  },
  /**
   * _circle
   * Create a circle from a radius
   *
   * @param data Object
   * @returns {ol.Feature}
   */
  _circle: (data) => {
    let sides, angle, styl, state, meta
    let radius = _source._radius(data).getGeometry()
    if (data.sides) {
      sides = data.sides
    } else {
      sides = 32
    }
    if(data.angle) {
      angle = data.angle
    } else {
      angle = 0
    }
    if (data.state) {
      state = data.state
    }
    if (data.meta) {
      meta = data.meta
    }
    if (typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style)
    }
    let circle = openlayers.geom.Polygon.fromCircle(radius, sides, angle)
    let feature = _source.__feature(circle, styl, state, meta)
    return feature
  },
  /**
   * default
   * Create the default map base source
   *
   * @returns {ol.source.OSM}
   */
  default: () => {
    return new openlayers.source.OSM()
  },
  /**
   * xyz
   * Create one xyz source object
   *
   * @param data Object
   * @returns {ol.source.XYZ}
   */
  xyz: (data) => {
    return new openlayers.source.XYZ(_source._xyz(data))
  },
  /**
   * image
   * Create one image source object
   *
   * @param data
   * @returns {ol.source.ImageStatic}
   */
  image: (data) => {
    if(data.type && data.type === 'arcgis') {
      return new openlayers.source.ImageArcGISRest({
         ratio: 1,
         params: {},
         url: data.url
      })
    } else {
      return new openlayers.source.ImageStatic(_source._image(data))
    }
  },
  /**
   * point
   * Create one vector source with one point feature
   *
   * @param data Object
   * @returns {ol.source.Vector}
   */
  point: (data) => {
    let features = [_source._point(data)]
    let source = new openlayers.source.Vector()
    source.addFeatures(features)
    return source
  },
  /**
   * shape
   * Create one vector source with one polygon shape feature
   *
   * @param data Object
   * @returns {ol.source.Vector}
   */
  shape: (data) => {
    let features = [_source._shape(data)]
    let source = new openlayers.source.Vector()
    source.addFeatures(features)
    return source
  },
  /**
   * radius
   * Create one vector source with one radius shape feature
   *
   * @param data Object
   * @return {ol.source.Vector}
   */
  radius: (data) => {
    let features = [_source._radius(data)]
    let source = new openlayers.source.Vector()
    source.addFeatures(features)
    return source
  },
  /**
   * circle
   * Create one vector source with one circle shape feature
   */
  circle: (data) => {
    let features = [_source._circle(data)]
    return new openlayers.source.Vector(features)
  },
  /**
   * multi
   * Create a vector source with many features
   *
   * @param data Object
   * @return {ol.source.Vector}
   */
  multi: (data) => {
    let source = new openlayers.source.Vector()
    for (var d = 0; d < data.length; d++) {
      let method = _source['_' + data[d].type]
      source.addFeature(method(data[d]))
    }
    return source
  },
  /**
   * geojson
   * Create one vector source with a shape based on a GeoJSON string
   *
   * @param data Object
   * @return {ol.source.Vector}
   */
  geojson: (data) => {
    let out
    if (data !== null && typeof data === 'object') {
      out = new openlayers.source.Vector({
        features: (new openlayers.format.GeoJSON()).readFeatures(data),
        format: new ol.format.GeoJSON()
      })
    } else if (typeof data === 'string') {
      out = new openlayers.source.Vector({
        url: data,
        format: new ol.format.GeoJSON()
      })
    }
    return out
  },
  /**
   *
   */
  wms: (data) => {
    let out
    let params = {
      LAYERS: data.coordinates,
      TILED: true
    }
    if (data.time) {
      params.TIME = data.time
    }
    out = new openlayers.source.TileWMS({
      url: data.url,
      params: params,
      serverType: 'geoserver'
    })
    return out
  },
  /**
   * compound
   * Create a compound shape based on a series of coordinates
   *
   * @param data Array
   * @return {ol.source.Vector}
   */
  compound: (data) => {
    let coords = []
    let source = new openlayers.source.Vector()
    for (let d in data) {
      // Extract the geometry from the shape...
      let method = _source['_' + data[d].type]
      let shape = method(data[d])
      let geom = shape.getGeometry().getCoordinates()[0].slice()
      if(geom.length % 2 === 0) {
        let newGeom = geom.slice()
        geom.push(newGeom[0])
      }
      coords.push(geom)
    }
    let feature = _source.__feature(new openlayers.geom.Polygon(coords))
    source.addFeature(feature)
    return source
  }
}
