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
    let out = {}
    out.name = name
    out.source = _source.xyz(source)
    return new openlayers.layer.Tile(out)
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
    let out = {}
    out.name = name
    out.source = _source.image(source)
    return new openlayers.layer.Image(out)
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
    // should be an object of coordinates (array), style (optional)
    let out = {}
    let style = null
    out.name = name
    out.source = _source.shape(source)
    if (source.style) {
      out.style = _style(source.style)
    } else {
      out.style = _style({type: 'Polygon'})
    }
    return new openlayers.layer.Vector(out)
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
    let out = {}
    let style = null
    out.name = name
    out.source = _source.radius(source)
    if (source.style) {
      out.style = _style(source.style)
    } else {
      out.style = _style({type: 'Polygon'})
    }
    return new openlayers.layer.Vector(out)
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
    let out = {}
    let style = null
    out.name = name
    out.source = _source.geojson(source.coordinates)
    if (source.style) {
      out.style = _style(source.style)
    } else {
      out.style = _style({type: 'MultiPolygon'})
    }
    return new ol.layer.Vector(out)
  },
  /**
   * multi
   * Draw multiple features in one layer from an array of feature data objects
   *
   * @param data
   * @returns {ol.layer.Vector}
   */
  multi (name, source) {
    let out = {}
    let style = null
    out.name = name
    out.source = _source.multi(source)
    if (source.style) {
      if(source.style.method) {
        out.style = source.style.method
      } else {
        out.style = _style(source.style)
      }
    } else {
      out.style = _style({type: 'Polygon'})
    }
    return new openlayers.layer.Vector(out)
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
  empty (name, source) {
    let out = {}
    out.name = name
    if(source) {
      out.source = source
    }
    return new openlayers.layer.Vector(out)
  }
}
