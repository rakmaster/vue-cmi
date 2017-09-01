import _layer from './layer'
import _style from './layer/style'
import { defaults } from './defaults'

const openlayers = require('../../node_modules/openlayers/dist/ol-debug.js')

let _view = (center, zoom) => {
  return new openlayers
    .View({
      center: openlayers.proj.fromLonLat(center),
      zoom: zoom
    })
}

let _extents = (coords) => {
  let out = openlayers.extent.boundingExtent(coords)
  return openlayers.proj.transformExtent(out, openlayers.proj.get('EPSG:4326'), openlayers.proj.get('EPSG:3857'))
}

class map {
  constructor () {
    this.ol = {}
    this.target = ''
    this.center = [0, 0]
    this.zoom = 4
    this.extents = []
    this.defaults = defaults
  }

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

  getLayers (exclude) {
    let out = []
    if (exclude) {
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

  getLayer (name) {
    let out = []
    this.getLayers().forEach((lyr) => {
      if (name === lyr.get('name')) {
        out = lyr
      }
    })
    return out
  }

  getFeatures (layer) {
    return this.getLayer(layer).getSource().getFeatures()
  }

  getFeature (layer, reference) {
    return this.getLayer(layer).getSource().getClosestFeatureToCoordinate(reference)
  }

  layer (data) {
    let out = _layer.draw(data)
    this.ol.addLayer(out)
    return out
  }

  animate (data, interval) {
    var set = []
    data.getLayers().forEach((layer) => {
      set.push(layer)
    })
    var iterant = 0
    for (var s = 1; s < set.length; s++) {
      set[s].setVisible(false)
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

  panto (data) {
    if (data.extents) {
      this.ol.getView().fit(data.extents, {duration: this.duration})
    }
    if (data.zoom) {
      this.ol.getView().animate({
        center: openlayers.proj.fromLonLat(data.center),
        duration: data.duration,
        zoom: data.zoom
      })
    }
  }

  style (data) {
    return _style(data)
  }

  normalize (data) {
    if (data.coordinates.length > 2) {
      return openlayers.proj.transformExtent(out, openlayers.proj.get(data.from), openlayers.proj.get(data.to))
    } else {
      return openlayers.proj.transform(data.coordinates, data.from, data.to)
    }
  }
}

export default map
