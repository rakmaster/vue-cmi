import _layer from './layer'
import _style from './layer/style'
import { defaults } from './defaults'
// Import openlayers for use by the CMI
const openlayers = require('../../node_modules/openlayers/dist/ol-debug.js')
/**
 * _view
 * helper method for creating a new ol.View
 *
 * @param center (array) [longitude, latitude]
 * @param zoom (number) the zoom level for the map
 * @returns ol.View
 * @private
 */
let _view = (center, zoom) => {
  return new openlayers
    .View({
      center: openlayers.proj.fromLonLat(center),
      zoom: zoom
    })
}
/**
 * _extents
 * helper method for getting and standardizing extents
 *
 * @param coords (array) [longitude, latitude, longitude, latitude]
 * @returns ol.Extent
 * @private
 */
let _extents = (coords) => {
  let out = openlayers.extent.boundingExtent(coords)
  return openlayers.proj.transformExtent(out, openlayers.proj.get('EPSG:4326'), openlayers.proj.get('EPSG:3857'))
}
/**
 * map
 * the main instance of the map object
 */
class map {
  constructor () {
    this.ol = {}
    this.target = ''
    this.center = [0, 0]
    this.zoom = 4
    this.extents = []
    this.defaults = defaults
  }
  /**
   * draw
   *
   * @param target (string) the id of the map element used for rendering by ol
   * @param data (object) an optional object of optional parameters for initial map settings
   *  {
   *    center: [longitude, latitude], // the center of the map
   *    controls: true / false // show / hide controls
   *    zoom: number ( 1 - 10), // initial zoom of the map
   *    extents: [long, lat, long, lat], // the extents of the map
   *    styles: {object of style data}, // initial rendering styles
   *    base: {object of base layer to render} // the initial base map
   *  }
   * @returns ol.Map
   */
  draw (target, data) {
    let layers = []
    if (!target) {
      return false
    } else {
      this.target = target
    }
    if (data) {
      if (data.center) {
        this.center = data.center
      }
      if (data.zoom) {
        this.zoom = data.zoom
      }
      if (data.extents) {
        this.extents = _extents(data.extents)
      }
      if (data.styles) {
        for (var s in data.styles) {
          if (defaults.styles[s]) {
            let style = data.styles[s]
            for (var t in style) {
              defaults.styles[s][t] = style[t]
            }
          }
        }
      }
      if (data.base) {
        layers.push(_layer.draw(data.base))
      } else {
        layers.push(_layer.draw())
      }
    } else {
      layers.push(_layer.draw())
    }
    let mapdata = {
      target: this.target,
      layers: layers,
      view: _view(this.center, this.zoom)
    }
    if (data && data.controls === false) {
      mapdata.controls = openlayers.control.defaults({
        zoom: false,
        attribution: false,
        rotate: false
      })
    }
    this.ol = new openlayers.Map(mapdata)
    if (data.extents) {
      this.ol.getView().fit(this.extents, this.ol.getSize())
    }
    return this.ol
  }
  /**
   * getLayers
   * retrieve all layers from the current map instance.
   * This method requires the openlayers instance.
   *
   * @param deep (boolean) toggles recursive searching through layers
   * @returns ol.Collection
   */
  getLayers (deep) {
    let out = []
    if (deep) {
      this.ol.getLayers().forEach((lyr) => {
        if (!(lyr instanceof openlayers.layer.Group)) {
          out.push(lyr)
        }
      })
    } else {
      this.ol.getLayers().forEach((lyr) => {
        if (lyr instanceof openlayers.layer.Group) {
          lyr.getLayers().forEach((sublyr) => {
            out.push(sublyr)
          })
        } else {
          out.push(lyr)
        }
      })
    }
    return out
  }
  /**
   * getLayer
   * retrieve a single layer from the current map instance.
   * This method requires the openlayers instance.
   *
   * @param name (string) the name of the layer to retrieve
   * @returns ol.Layer
   */
  getLayer (name) {
    let out = []
    this.getLayers().forEach((lyr) => {
      if (name === lyr.get('name')) {
        out = lyr
      }
    })
    return out
  }
  /**
   * getFeatures
   * retrieve all features on the given layer
   *
   * @param layer ol.Layer
   * @returns ol.FeatureCollection
   */
  getFeatures (layer) {
    return this.getLayer(layer).getSource().getFeatures()
  }
  /**
   * getFeature
   * retrieve a single feature nearest the given coordinates
   *
   * @param layer ol.Layer
   * @param coordinates (array) [longitude, latitude]
   * @returns ol.Feature
   */
  getFeature (layer, coordinates) {
    return this.getLayer(layer).getSource().getClosestFeatureToCoordinate(coordinates)
  }
  /**
   * layer
   * render a layer based on the privided data
   *
   * @param data (object) an object of layer parameters
   * @returns ol.layer.*
   */
  layer (data) {
    return _layer.draw(data)
  }
  /**
   * animate
   * animate all layers within the given ol.layer.Group
   * TBD: clean up this method !!!!
   *
   * @param data
   * @param interval
   */
  animate (data) {
    let interval
    let set = []
    data.src.getLayers().forEach((layer) => {
      set.push(layer)
    })
    let iterant = 0
    for (var s = 1; s < set.length; s++) {
      set[s].setVisible(false)
    }
    if (!data.interval) {
      interval = defaults.interval
    } else {
      interval = data.interval
    }
    setInterval(() => {
      set[iterant].setVisible(!set[iterant].getVisible())
      iterant++
      if (iterant === set.length) {
        iterant = 0
      }
      set[iterant].setVisible(!set[iterant].getVisible())
    }, interval)
  }
  /**
   * panto
   * pan to a location on a map using extents OR coordinates
   *
   * @param data
   *  {
   *    extents: [lat, lon, lat, lon],
   *    center: [lat, lon],
   *    zoom: (number) 1 - 10
   *  }
   *  NOTE: requires extents OR center and zoom, not both
   */
  panto (data) {
    if (data.extents) {
      let params
      if (data.params) {
        params = data.params
      } else {
        if (data.duration) {
          params = {duration: data.duration}
        }
      }
      this.ol.getView().fit(data.extents, params)
    }
    if (data.zoom) {
      this.ol.getView().animate({
        center: openlayers.proj.fromLonLat(data.center),
        duration: data.duration,
        zoom: data.zoom
      })
    }
  }
  /**
   * style
   * render an ol.Style object from the provided JSON object of parameters
   *
   * @param data
   * @returns ol.Style
   */
  style (data) {
    return _style(data)
  }
  /**
   * normalize
   * transform the provided array of longitude / latitude coordinates to a different projection
   *
   * @param data
   * @returns array
   */
  normalize (data) {
    if (data.coordinates.length > 2) {
      return openlayers.proj.transformExtent(data.coordinates, openlayers.proj.get(data.from), openlayers.proj.get(data.to))
    } else {
      return openlayers.proj.transform(data.coordinates, data.from, data.to)
    }
  }
}

export default map
