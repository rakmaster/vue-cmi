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
  __feature: (data, style, state) => {
    var source = {}
    source.geometry = data
    if (style) {
      source.style = style
    }
    if (state) {
      source.state = state
    }
    return new openlayers.Feature(source)
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
    let coords, styl, feature, state
    if (Array.isArray(data)) {
      coords = data
    } else {
      coords = data.coordinates
      if(data.state) {
        state = data.state
      }
    }
    if (typeof data.style !== 'undefined') {
      if (data.style.method) {
        let styleFunc = data.style.method
        feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), styleFunc, 'inactive')
      } else {
        styl = data.style
        styl.type = 'Point'
        styl = _style(styl)
        feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), styl, state)
      }
    } else {
      feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), null, state)
    }
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
    let vertices = []
    for (let d = 0; d < data.coordinates.length; d++) {
      vertices.push(_source._normalize(data.coordinates[d]))
    }
    return _source._feature(new openlayers.geom.Polygon([vertices]))
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
   * Create one circle feature
   *
   * @param data Object
   * @returns {ol.Feature}
   */
  _radius: (data) => {
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
    let c = _source._normalize(data.coordinates)
    return _source._feature(new openlayers.geom.Circle(c, r))
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
    return new openlayers.source.ImageStatic(_source._image(data))
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
    return new openlayers.source.Vector(features)
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
    return new openlayers.source.Vector(features)
  },
  /**
   * radius
   * Create one vector source with one circle shape feature
   *
   * @param data Object
   * @return {ol.source.Vector}
   */
  radius: (data) => {
    let features = [_source._radius(data)]
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
    let out = {}
    let features = []
    for (var d = 0; d < data.length; d++) {
      let met = _source['_' + data[d].type]
      features.push(met(data[d]))
    }
    out.features = features
    return new openlayers.source.Vector(out)
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
  }
}
