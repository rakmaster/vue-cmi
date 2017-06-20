/**
 * layer
 * by William Logan
 *
 * Abstraction to Openlayers 3 to simplify drawing a layer
 *
 */
import _source from './source'
import _style from './style'
const openlayers = require('../../../node_modules/openlayers/dist/ol-debug.js')

let _layer = {}
export default _layer = {
  /**
   * _vector
   * Utility method to do the standard vector layer creation
   */
  _vector (name, source) {
    let layer = new openlayers.layer.Vector()
    layer.set('name', name)
    layer.setSource(source)
    return layer
  },
  /**
   * draw
   * Master controller for drawing a layer
   *
   * @param data Object
   * @returns ol.layer.*
   */
  draw (data) {
    let layer
    if (!data) { // If no data, return the default OSM base layer. All maps have at least 1 layer
      layer = new openlayers.layer.Tile({name: 'base', source: _source.default()})
    } else { // Since we only ever draw one layer at a time, draw the layer passed to us
      // data.src possible values:
      // attributions : proper attribution for the source of the map data
      // url : url to the remote source for the layer
      // coordinates : array of long, lat pairs or array of array of long, lat pairs
      // style : object containing image, font, fill and stroke style assignments
      let func = this[data.type]
      layer = func(data.name, data.src)
    }
    return layer
  },
  /**
   * tile
   * Draw a layer of the type Tile that is NOT OSM.
   * Note: all layers should have a unique name so we can find them later
   *
   * @param name String
   * @param source Object
   * @returns {ol.layer.Tile}
   *
   */
  tile (name, source) {
    // source should be an object of attributions, url
    let layer = new openlayers.layer.Tile()
    layer.set('name', name)
    layer.setSource(_source.xyz(source))
    return layer
  },
  /**
   * image
   * Draw a layer of the type Image
   * Note: all image layers are tied to geospacial coordinates, or they
   * will end up finding their own place somewhere you don't expect
   *
   * @param name String
   * @param source Object
   * @returns {ol.layer.Image}
   *
   */
  image (name, source) {
    // source should be an object of coordinates, attributions, url
    let layer = new openlayers.layer.Image()
    layer.set('name', name)
    layer.setSource(_source.image(source))
    return layer
  },
  /**
   * shape
   * Draw a layer of the type Vector with one Shape feature
   * Note: the shape layer may have a custom style assignment. If the shape data
   * does not contain its own style designation it will use the global instead
   *
   * @param name
   * @param source
   * @returns {ol.layer.Vector|ol.source.Vector|ol.test.rendering.layer.Vector}
   */
  shape (name, source) {
    let src = _source.shape(source)
    let layer = _layer._vector(name, src)
    if (source.style) {
      layer.setStyle(_style(source.style))
    } else {
      layer.setStyle(_style({type: 'Polygon'}))
    }
    return layer
  },
  /**
   * radius
   * Draw a layer of the type Vector with one Shape Feature
   * Note: radius draws a ciclre shape based on a single point,
   * with a radius of n miles as the boundaries of the shape
   *
   * @param name String
   * @param soruce Object
   * @returns {ol.layer.Vector}
   */
  radius (name, source) {
    // should be an object of coordinates (object), style (optional)
    let src = _source.radius(source)
    let layer = _layer._vector(name, src)
    if (source.style) {
      layer.setStyle(_style(source.style))
    } else {
      layer.setStyle(_style({type: 'Polygon'}))
    }
    return layer
  },
  /**
   * circle
   * Draw a polygon shape based on a radius shape
   * Note: converts a radius shape into a series of points
   * that become a polygon that is displayed as a circle
   *
   */
  circle (name, source) {
    let src = _source.circle(source)
    let layer = _layer._vector(name, src)
    if (source.style) {
      layer.setStyle(_style(source.style))
    } else {
      layer.setStyle(_style({type: 'Polygon'}))
    }
    return layer
  },
  /**
   * geojson
   * Draw a layer based on a GeoJSON string
   *
   * @apram name String
   * @param source Object
   * @returns {ol.layer.Vector}
   */
  geojson (name, source) {
    let src = _source.geojson(source.coordinates)
    let layer = _layer._vector(name, src)
    if (source.style) {
      layer.setStyle(_style(source.style))
    } else {
      layer.setStyle(_style({type: 'MultiPolygon'}))
    }
    return layer
  },
  /**
   * compound
   * Draw a compound shape from two or more polygon shapes
   *
   * @param name String
   * @param source Object
   * @returns {ol.layer.Vector}
   */
  compound (name, source) {
    let src = _source.compound(source.shapes)
    let layer = _layer._vector(name, src)
    if (source.style) {
      layer.setStyle(_style(source.style))
    } else {
      layer.setStyle(_style({type: 'MultiPolygon'}))
    }
    return layer
  },
  /**
   * multi
   * Draw multiple features in one layer from an array of feature data objects
   *
   * @param data
   * @returns {ol.layer.Vector}
   */
  multi (name, source) {
    let src = _source.multi(source)
    let layer = _layer._vector(name, src)
    if (source.style) {
      if(source.style.method) {
        layer.setStyle(source.style.method)
      } else {
        layer.setStyle(_style(source.style))
      }
    } else {
      layer.setStyle(_style({type: 'Polygon'}))
    }
    return layer
  },
  /**
   * group
   * Draw a group of layers based on an array of layer data objects
   *
   * @param data
   * @returns {module.Group|ol.layer.Group}
   */
  group (name, source) {
    let layers = []
    for (let s in source) {
      let func = _layer[source[s].type]
      layers.push(func(source[s].name, source[s].src))
    }
    return new openlayers.layer.Group({name: name, layers: layers})
  },
  /**
   * empty
   * Draw a layer with a pre-defined source
   *
   * @param data
   * @returns {ol.layer.*}
   */
  empty () {
    return new openlayers.layer.Vector()
  }
}
