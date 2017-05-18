const openlayers = require('../../../node_modules/openlayers/dist/ol-debug.js')
import { defaults } from '../defaults'


let _stroke = (stroke) => {
  return new openlayers.style.Stroke({
    color: stroke.color,
    width: stroke.width
  })
}

let _fill = (fill) => {
  return new openlayers.style.Fill({
    color: fill.color
  })
}

let _text = (text, fill) => {
  return new openlayers.style.Text({
    text: text.character,
    font: text.style + ' ' + text.size + ' \'' + text.family + '\'',
    textBaseline: text.baseline,
    fill: _fill(fill)
  })
}

let _arrange = (data) => {
  var out = {}
  for(var v in defaults.styles) {
    out[v] = defaults.styles[v]
  }
  for (var d in data) {
    if(out[d]) {
      if(data[d] !== null) {
        for (var s in data[d]) {
          out[d][s] = data[d][s]
        }
      } else {
        out[d] = data[d]
      }
    }
  }
  return out
}

export default (data) => {
  let source = {}
  let stl = _arrange(data)

  switch(data.type) {
    case 'Point':
      if (stl.image) {
        source.image = stl.image
      }
      if (stl.text) {
        source.text = _text(stl.text, stl.fill)
      }
      break;
    case 'LineString':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke)
      }
      break;
    case 'MultiLineString':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke)
      }
      break;
    case 'MultiPoint':
      if (stl.image) {
        source.image = stl.image
      }
      if (stl.font) {
        source.text = _text(stl.text, stl.fill)
      }
      break;
    case 'MultiPolygon':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke)
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill)
      }
      break;
    case 'Polygon':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke)
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill)
      }
      break;
    case 'GeometryCollection':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke)
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill)
      }
      break;
    case 'Circle':
      if (stl.stroke) {
        source.stroke = _stroke(stl.stroke)
      }
      if (stl.fill) {
        source.fill = _fill(stl.fill)
      }
      break;
  }
  return new openlayers.style.Style(source)
}
