import _layer from './layer'
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

let map = () => {
  this.ol = {}
  this.target = ''
  this.center = [0, 0]
  this.zoom = 4
  this.extents = []
  this.layers = []
  this.defaults = defaults
}

map.prototype.draw = (target, data) => {
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
          for(var t in style) {
            defaults.styles[s][t] = style[t]
          }
        }
      }
    }
    if (data.base) {
      this.layers.push(_layer.draw(data.base))
    } else {
      this.layers.push(_layer.draw())
    }
  } else {
    this.layers.push(_layer.draw())
  }
  let mapdata = {
    target: this.target,
    layers: this.layers,
    view: _view(this.center, this.zoom)
  }
  if(data && data.controls === false) {
    mapdata.controls = openlayers.control.defaults({
      zoom: false,
      attribution: false,
      rotate: false
    })
  }
  this.ol = new openlayers.Map(mapdata)
  if(data.extents) {
    this.ol.getView().fit(this.extents, this.ol.getSize())
  }
  return this.ol
}

map.prototype.getLayers = (exclude) => {
  let out = []
  if (exclude) {
    this.layers.forEach((lyr) => {
      if (!(lyr instanceof openlayers.layer.Group)) {
        out.push(lyr)
      }
    })
  } else {
    this.layers.forEach((lyr) => {
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
map.prototype.getLayer = (name) => {
  let out
  this.getLayers().forEach((lyr) => {
    if (name === lyr.get('name')) {
      out = lyr
    }
  })
  return out
}
map.prototype.getFeatures = function (layer) {
  var extent = this$1.ol.getView().calculateExtent(this$1.ol.getSize())
  return this.getLayer(layer).getSource().getFeaturesInExtent(extent)
}
map.prototype.getFeature = function (layer, reference) {
  return this.getLayer(layer).getSource().getClosestFeatureToCoordinate(reference)
}
map.prototype.layer = (data) => {
  // Inject the global styles...
  data.defaultStyle = this.defaults.styles.pointStyle
  let out = _layer.draw(data)
  this.layers.push(out)
  this.ol.addLayer(out)
  return out
}
map.prototype.animate = (data, interval) => {
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
map.prototype.panto = (data) => {
  if(data.extents) {
    let extent = _extents(data.extents)
    this.ol.getView().fit(extent, {duration: this.duration})
  }
  if(data.zoom) {
    this.ol.getView().animate({
      center: openlayers.proj.fromLonLat(data.center),
      duration: data.duration,
      zoom: data.zoom
    })
  }
}

export default map
