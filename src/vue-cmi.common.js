var openlayers = window.ol;

var _defaults = {
  duration: 500,
  styles: {
    stroke: {
      color: 'rgba(0,0,0,1.0)',
      width: 1
    },
    fill: {
      color: 'rgba(0,80,180,1.0)'
    },
    text: {
      character: '\uF041',
      style: 'normal',
      size: '18px',
      family: 'FontAwesome',
      baseline: 'Bottom'
    },
    image: null
  }
};

var _stroke = function _stroke(stroke) {
  var params = {};
  if (stroke.color) {
    params.color = stroke.color;
  } else {
    params.color = _defaults.styles.stroke.color;
  }
  if (stroke.width) {
    params.width = stroke.width;
  } else {
    params.width = _defaults.styles.stroke.width;
  }
  if (stroke.lineDash) {
    params.lineDash = stroke.lineDash;
  }
  return new openlayers.style.Stroke(params);
};

var _fill = function _fill(fill) {
  return new openlayers.style.Fill({
    color: fill.color
  });
};

var _text = function _text(text, fill) {
  return new openlayers.style.Text({
    text: text.character,
    font: text.style + ' ' + text.size + ' \'' + text.family + '\'',
    textBaseline: text.baseline,
    fill: _fill(fill)
  });
};

var _arrange = function _arrange(data) {
  var out = {};
  for (var v in _defaults.styles) {
    out[v] = _defaults.styles[v];
  }
  for (var d in data) {
    if (out[d]) {
      if (data[d] !== null) {
        for (var s in data[d]) {
          out[d][s] = data[d][s];
        }
      } else {
        out[d] = data[d];
      }
    }
  }
  return out;
};

var _style = function _style(data) {
  var out = void 0;
  var stl = _arrange(data);
  var source = {};
  var methods = {
    Point: function Point(styl) {
      if (styl.image) {
        source.image = styl.image;
      }
      if (styl.text) {
        source.text = _text(styl.text, styl.fill);
      }
      return new openlayers.style.Style(source);
    },
    LineString: function LineString(styl) {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke);
      }
      return new openlayers.style.Style(source);
    },
    MultiLineString: function MultiLineString(styl) {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke);
      }
      return new openlayers.style.Style(source);
    },
    MultiPoint: function MultiPoint(styl) {
      if (styl.image) {
        source.image = styl.image;
      }
      if (styl.font) {
        source.text = _text(styl.text, styl.fill);
      }
      return new openlayers.style.Style(source);
    },
    MultiPolygon: function MultiPolygon(styl) {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke);
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill);
      }
      return new openlayers.style.Style(source);
    },
    Polygon: function Polygon(styl) {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke);
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill);
      }
      return new openlayers.style.Style(source);
    },
    GeometryCollection: function GeometryCollection(styl) {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke);
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill);
      }
      return new openlayers.style.Style(source);
    },
    Circle: function Circle(styl) {
      if (styl.stroke) {
        source.stroke = _stroke(styl.stroke);
      }
      if (styl.fill) {
        source.fill = _fill(styl.fill);
      }
      return new openlayers.style.Style(source);
    }
  };
  out = methods[data.type](stl);
  return out;
};

var _view = function _view(center, zoom) {
  return new openlayers.View({
    center: openlayers.proj.fromLonLat(center),
    zoom: zoom
  });
};

var _extents = function _extents(coords) {
  var out = openlayers.extent.boundingExtent(coords);
  return openlayers.proj.transformExtent(out, openlayers.proj.get('EPSG:4326'), openlayers.proj.get('EPSG:3857'));
};

var _source = {
  __feature: function __feature(data, style, state, meta) {
    var feature = new openlayers.Feature();
    feature.setGeometry(data);
    if (style) {
      feature.setStyle(style);
    }
    if (state) {
      feature.set('state', state);
    }
    if (meta) {
      feature.set('meta', meta);
    }
    return feature;
  },

  __attributions: function __attributions(data) {
    var attributions = [];
    if (data) {
      if (Array.isArray(data)) {
        for (var d in data) {
          attributions.push(new openlayers.Attribution({ html: data[d] }));
        }
      } else {
        var attribution = new openlayers.Attribution({
          html: data
        });
        attributions.push(attribution);
      }
    }
    return attributions;
  },

  __normalize: function __normalize(coordinates) {
    return openlayers.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');
  },

  __stylize: function __stylize(data) {
    var styl = void 0;
    if (data.method) {
      styl = data.method;
    } else {
      styl = _style(data);
    }
    return styl;
  },

  _point: function _point(data) {
    var feature = void 0,
      coords = void 0,
      styl = void 0,
      state = void 0,
      meta = void 0;
    if (Array.isArray(data)) {
      coords = data;
    } else {
      coords = data.coordinates;
      if (data.state) {
        state = data.state;
      }
      if (data.meta) {
        meta = data.meta;
      }
    }
    if (typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style);
    }
    feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), styl, state, meta);
    return feature;
  },

  _shape: function _shape(data) {
    var feature = void 0,
      styl = void 0,
      state = void 0,
      meta = void 0;
    var vertices = [];
    for (var d = 0; d < data.coordinates.length; d++) {
      vertices.push(_source.__normalize(data.coordinates[d]));
    }
    if (data.state) {
      state = data.state;
    }
    if (data.meta) {
      meta = data.meta;
    }
    if (typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style);
    }
    feature = _source.__feature(new openlayers.geom.Polygon([vertices]), styl, state, meta);
    return feature;
  },

  _xyz: function _xyz(data) {
    var attributions = void 0,
      url = void 0;
    if (data.attributions) {
      attributions = _source.__attributions(data.attributions);
    }
    if (data.url) {
      url = data.url;
    } else {
      return false;
    }
    return {
      attributions: attributions,
      url: url
    };
  },

  _image: function _image(data) {
    var fake = _source.shape(data.coordinates);
    var extent = fake.getExtent();
    var attributions = void 0,
      url = void 0;
    if (data.attributions) {
      attributions = _source.__attributions(data.attributions);
    }
    if (data.url) {
      url = data.url;
    } else {
      return false;
    }
    return {
      attributions: attributions,
      url: url,
      imageExtent: extent
    };
  },

  _radius: function _radius(data) {
    var feature = void 0,
      styl = void 0,
      state = void 0,
      meta = void 0;
    var radiusMiles = data.radius;
    var arrConversion = [];
    arrConversion['degrees'] = 1 / (60 * 1.1508);
    arrConversion['dd'] = arrConversion['degrees'];
    arrConversion['m'] = 1609.344;
    arrConversion['ft'] = 5280;
    arrConversion['km'] = 1.609344;
    arrConversion['mi'] = 1;
    arrConversion['inches'] = 63360;

    var r = radiusMiles * arrConversion[data.units] * (1.41421356 / 2);
    var c = _source.__normalize(data.coordinates);
    if (data.state) {
      state = data.state;
    }
    if (data.meta) {
      meta = data.meta;
    }
    if (typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style);
    }
    feature = _source.__feature(new openlayers.geom.Circle(c, r), styl, state, meta);
    return feature;
  },

  _circle: function _circle(data) {
    var sides = void 0,
      angle = void 0,
      styl = void 0,
      state = void 0,
      meta = void 0;
    var radius = _source._radius(data).getGeometry();
    if (data.sides) {
      sides = data.sides;
    } else {
      sides = 32;
    }
    if (data.angle) {
      angle = data.angle;
    } else {
      angle = 0;
    }
    if (data.state) {
      state = data.state;
    }
    if (data.meta) {
      meta = data.meta;
    }
    if (typeof data.style !== 'undefined') {
      styl = _source.__stylize(data.style);
    }
    var circle = openlayers.geom.Polygon.fromCircle(radius, sides, angle);
    var feature = _source.__feature(circle, styl, state, meta);
    return feature;
  },

  default: function _default() {
    return new openlayers.source.OSM();
  },

  xyz: function xyz(data) {
    return new openlayers.source.XYZ(_source._xyz(data));
  },

  image: function image(data) {
    if (data.type && data.type === 'arcgis') {
      return new openlayers.source.ImageArcGISRest({
        ratio: 1,
        params: {},
        url: data.url
      });
    } else {
      return new openlayers.source.ImageStatic(_source._image(data));
    }
  },

  point: function point(data) {
    var features = [_source._point(data)];
    var source = new openlayers.source.Vector();
    source.addFeatures(features);
    return source;
  },

  shape: function shape(data) {
    var features = [_source._shape(data)];
    var source = new openlayers.source.Vector();
    source.addFeatures(features);
    return source;
  },

  radius: function radius(data) {
    var features = [_source._radius(data)];
    var source = new openlayers.source.Vector();
    source.addFeatures(features);
    return source;
  },

  circle: function circle(data) {
    var features = [_source._circle(data)];
    return new openlayers.source.Vector(features);
  },

  multi: function multi(data) {
    var source = new openlayers.source.Vector();
    for (var d = 0; d < data.length; d++) {
      var method = _source['_' + data[d].type];
      source.addFeature(method(data[d]));
    }
    return source;
  },

  geojson: function geojson(data) {
    var out = void 0;
    if (data !== null && (typeof data === 'undefined' ? 'undefined' : typeof data === 'object')) {
      out = new openlayers.source.Vector({
        features: new openlayers.format.GeoJSON().readFeatures(data),
        format: new ol.format.GeoJSON()
      });
    } else if (typeof data === 'string') {
      out = new openlayers.source.Vector({
        url: data,
        format: new ol.format.GeoJSON()
      });
    }
    return out;
  },

  wms: function wms(data) {
    var out = void 0;
    var params = {
      LAYERS: data.coordinates,
      TILED: true
    };
    if (data.time) {
      params.TIME = data.time;
    }
    out = new openlayers.source.TileWMS({
      url: data.url,
      params: params,
      serverType: 'geoserver'
    });
    return out;
  },

  compound: function compound(data) {
    var coords = [];
    var source = new openlayers.source.Vector();
    for (var d in data) {
      var method = _source['_' + data[d].type];
      var shape = method(data[d]);
      var geom = shape.getGeometry().getCoordinates()[0].slice();
      if (geom.length % 2 === 0) {
        var newGeom = geom.slice();
        geom.push(newGeom[0]);
      }
      coords.push(geom);
    }
    var feature = _source.__feature(new openlayers.geom.Polygon(coords));
    source.addFeature(feature);
    return source;
  }
};

var _layer = {
  _vector: function _vector(name, source) {
    var layer = new openlayers.layer.Vector();
    layer.set('name', name);
    layer.setSource(source);
    return layer;
  },
  draw: function draw(data) {
    var layer = void 0;
    if (!data) {
      layer = new openlayers.layer.Tile({ name: 'base', source: _source.default() });
    } else {
      var func = this[data.type];
      layer = func(data.name, data.src);
    }
    return layer;
  },
  tile: function tile(name, source) {
    var layer = new openlayers.layer.Tile();
    layer.set('name', name);
    layer.setSource(_source.xyz(source));
    return layer;
  },
  image: function image(name, source) {
    var layer = new openlayers.layer.Image();
    layer.set('name', name);
    layer.setSource(_source.image(source));
    return layer;
  },
  point: function point(name, source) {
    var src = _source.point(source);
    var layer = _layer._vector(name, src);
    if (source.style) {
      layer.setStyle(_style(source.style));
    } else {
      layer.setStyle(_style)({ type: 'Point' });
    }
    return layer;
  },
  shape: function shape(name, source) {
    var src = _source.shape(source);
    var layer = _layer._vector(name, src);
    if (source.style) {
      layer.setStyle(_style)(source.style);
    } else {
      layer.setStyle(_style)({ type: 'Polygon' });
    }
    return layer;
  },
  radius: function radius(name, source) {
    var src = _source.radius(source);
    var layer = _layer._vector(name, src);
    if (source.style) {
      layer.setStyle(_style(source.style));
    } else {
      layer.setStyle(_style({ type: 'Polygon' }));
    }
    return layer;
  },
  circle: function circle(name, source) {
    var src = _source.circle(source);
    var layer = _layer._vector(name, src);
    if (source.style) {
      layer.setStyle(_style(source.style));
    } else {
      layer.setStyle(_style({ type: 'Polygon' }));
    }
    return layer;
  },
  geojson: function geojson(name, source) {
    var src = _source.geojson(source.coordinates);
    var layer = _layer._vector(name, src);
    if (source.style) {
      layer.setStyle(_style(source.style));
    } else {
      layer.setStyle(_style({ type: 'MultiPolygon' }));
    }
    return layer;
  },
  wms: function wms(name, source) {
    var src = _source.wms(source);
    var layer = new openlayers.layer.Tile();
    layer.set('name', name);
    layer.setSource(src);
    return layer;
  },
  compound: function compound(name, source) {
    var src = _source.compound(source.shapes);
    var layer = _layer._vector(name, src);
    if (source.style) {
      layer.setStyle(_style(source.style));
    } else {
      layer.setStyle(_style({ type: 'MultiPolygon' }));
    }
    return layer;
  },
  multi: function multi(name, source) {
    var src = _source.multi(source);
    var layer = _layer._vector(name, src);
    if (source.style) {
      if (source.style.method) {
        layer.setStyle(source.style.method);
      } else {
        layer.setStyle(_style(source.style));
      }
    } else {
      layer.setStyle(_style({ type: 'Polygon' }));
    }
    return layer;
  },
  group: function group(name, source) {
    var layers = [];
    for (var s in source) {
      var func = _layer[source[s].type];
      layers.push(func(source[s].name, source[s].src));
    }
    return new openlayers.layer.Group({ name: name, layers: layers });
  },
  empty: function empty() {
    return new openlayers.layer.Vector();
  }
};

class _map {
  constructor() {
    this.ol = {};
    this.target = '';
    this.center = [0, 0];
    this.zoom = 4;
    this.extents = [];
    this.defaults = _defaults;
  }

  draw(target, data) {
    var layers = [];
    if (!target) {
      return false;
    } else {
      this.target = target;
    }
    if (data) {
      if (data.center) {
        this.center = data.center;
      }
      if (data.zoom) {
        this.zoom = data.zoom;
      }
      if (data.extents) {
        this.extents = _extents(data.extents);
      }
      if (data.styles) {
        for (var s in data.styles) {
          if (_defaults.styles[s]) {
            var style = data.styles[s];
            for (var t in style) {
              _defaults.styles[s][t] = style[t];
            }
          }
        }
      }
      if (data.base) {
        layers.push(_layer.draw(data.base));
      } else {
        layers.push(_layer.draw());
      }
    } else {
      layers.push(_layer.draw());
    }
    var mapdata = {
      target: this.target,
      layers: layers,
      view: _view(this.center, this.zoom)
    };
    if (data && data.controls === false) {
      mapdata.controls = openlayers.control.defaults({
        zoom: false,
        attribution: false,
        rotate: false
      });
    }
    this.ol = new openlayers.Map(mapdata);
    if (data.extents) {
      this.ol.getView().fit(this.extents, this.ol.getSize());
    }
    return this.ol;
  }
  getLayers(exclude) {
    var out = [];
    if (exclude) {
      this.ol.getLayers().forEach(function (lyr) {
        if (!(lyr instanceof openlayers.layer.Group)) {
          out.push(lyr);
        }
      });
    } else {
      this.ol.getLayers().forEach(function (lyr) {
        if (lyr instanceof openlayers.layer.Group) {
          lyr.getLayers().forEach(function (sublyr) {
            out.push(sublyr);
          });
        } else {
          out.push(lyr);
        }
      });
    }
    return out;
  }
  getLayer(name) {
    var out = [];
    this.getLayers().forEach(function (lyr) {
      if (name === lyr.get('name')) {
        out = lyr;
      }
    });
    return out;
  }
  getFeatures(layer) {
    return this.getLayer(layer).getSource().getFeatures();
  }
  getFeature(layer, reference) {
    return this.getLayer(layer).getSource().getClosestFeatureToCoordinate(reference);
  }
  layer(data) {
    var out = _layer.draw(data);
    return out;
  }
  animate(data, interval) {
    var set = [];
    data.getLayers().forEach(function (layer) {
      set.push(layer);
    });
    var iterant = 0;
    for (var s = 1; s < set.length; s++) {
      set[s].setVisible(false);
    }
    setInterval(function () {
      set[iterant].setVisible(!set[iterant].getVisible());
      iterant++;
      if (iterant === set.length) {
        iterant = 0;
      }
      set[iterant].setVisible(!set[iterant].getVisible());
    }, interval);
  }
  panto(data) {
    if (data.extents) {
      this.ol.getView().fit(data.extents, { duration: this.duration });
    }
    if (data.zoom) {
      this.ol.getView().animate({
        center: openlayers.proj.fromLonLat(data.center),
        duration: data.duration,
        zoom: data.zoom
      });
    }
  }
  style(data) {
    return _style(data);
  }
  normalize(data) {
    if (data.coordinates.length > 2) {
      return openlayers.proj.transformExtent(out, openlayers.proj.get(data.from), openlayers.proj.get(data.to));
    } else {
      return openlayers.proj.transform(data.coordinates, data.from, data.to);
    }
  }
}

function cmi(Vue, options) {

  var VMap = Vue.extend({
    template: '<div></div>',
    props: {
      mapdata: {}
    },
    data: function() {
      return this.mapdata;
    }
  })
  Vue.component('v-map', VMap);

  Vue.map = new _map();

  Vue.prototype.$cmi = {
    map: function map(target, data) {
      return Vue.map.draw(target, data);
    },
    layer: {
      getLayers: function getLayers(exclude) {
        return Vue.map.getLayers(exclude);
      },
      getLayer: function getLayer(name) {
        return Vue.map.getLayer(name);
      },
      getFeatures: function getFeatures(layer) {
        return Vue.map.getFeatures(layer);
      },
      getFeature: function getFeature(layer, ref) {
        return Vue.map.getFeature(layer, ref);
      },
      draw: function draw(data) {
        return Vue.map.layer(data);
      }
    },
    control: {
      animate: function animate(data) {
        return Vue.map.animate(data);
      },
      panto: function panto(data) {
        return Vue.map.panto(data);
      }
    },
    functions: {
      normalize: function normalize(data) {
        return Vue.map.normalize(data);
      },
      style: function style(data) {
        return Vue.map.style(data);
      }
    }
  };
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(cmi)
}
