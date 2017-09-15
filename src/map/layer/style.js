const openlayers = require('../../../node_modules/openlayers/dist/ol-debug.js')
import { defaults } from '../defaults'


let _stroke = (stroke) => {
  let params = {}
  if (stroke.color) {
    params.color = stroke.color
  } else {
    params.color = defaults.styles.stroke.color
  }
  if (stroke.width) {
    params.width = stroke.width
  } else {
    params.width = defaults.styles.stroke.width
  }
  if (stroke.lineDash) {
    params.lineDash = stroke.lineDash
  }
  return new openlayers.style.Stroke(params)
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

let _style = (data) => {
  let out, stl
  let source = {}
  let methods = {
    Point: (styl) => {
      if (styl.image) {
        source.image = styl.image
      }
      if (styl.text) {
        source.text = _text(styl.text, styl.fill)
      }
      return new openlayers.style.Style(source)
    },
    LineString: (styl) => {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke)
      }
      return new openlayers.style.Style(source)
    },
    MultiLineString: (styl) => {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke)
      }
      return new openlayers.style.Style(source)
    },
    MultiPoint: (styl) => {
      if (styl.image) {
        source.image = styl.image
      }
      if (styl.font) {
        source.text = _text(styl.text, styl.fill)
      }
      return new openlayers.style.Style(source)
    },
    MultiPolygon: (styl) => {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke)
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill)
      }
      return new openlayers.style.Style(source)
    },
    Polygon: (styl) => {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke)
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill)
      }
      return new openlayers.style.Style(source)
    },
    GeometryCollection: (styl) => {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke)
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill)
      }
      return new openlayers.style.Style(source)
    },
    Circle: (styl) => {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke)
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill)
      }
      return new openlayers.style.Style(source)
    }
  }
  if (Array.isArray(data)) {
    out = []
    for (var d in data) {
      stl = _arrange(data[d])
      out.push(methods[data[d].type](stl))
    }
  } else {
    stl = _arrange(data)
    out = methods[data.type](stl)
  }
  return out
}

export default _style
