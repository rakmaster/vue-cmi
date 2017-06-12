var openlayers;
if(! window.ol) {
  console.log('NOAA CMI Requires Openlayers 4.0.1');
} else {
  openlayers = window.ol;
  var defaults = {
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
        character: '\uf041',
        style: 'normal',
        size: '18px',
        family: 'FontAwesome',
        baseline: 'Bottom',
      },
      image: null
    }
  };

  var _stroke = function (stroke) {
    return new openlayers.style.Stroke({
      color: stroke.color,
      width: stroke.width
    })
  };

  var _fill = function (fill) {
    return new openlayers.style.Fill({
      color: fill.color
    });
  };

  var _text = function (text, fill) {
    return new openlayers.style.Text({
      text: text.character,
      font: text.style + ' ' + text.size + ' \'' + text.family + '\'',
      textBaseline: text.baseline,
      fill: _fill(fill)
    });
  };

  var _arrange = function (data) {
    var out = {};
    for (var v in __WEBPACK_IMPORTED_MODULE_0__defaults__["a" /* defaults */].styles) {
      out[v] = __WEBPACK_IMPORTED_MODULE_0__defaults__["a" /* defaults */].styles[v];
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
  }

  var _style = function (data) {
    var out;
    var stl = _arrange(data);
    var source = {};
    var methods = {
      Point: function (styl) {
        if (styl.image) {
          source.image = styl.image;
        }
        if (styl.text) {
          source.text = _text(styl.text, styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      LineString: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        return new openlayers.style.Style(source);
      },
      MultiLineString: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        return new openlayers.style.Style(source);
      },
      MultiPoint: function (styl) {
        if (styl.image) {
          source.image = styl.image;
        }
        if (styl.font) {
          source.text = _text(styl.text, styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      MultiPolygon: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      Polygon: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      GeometryCollection: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      },
      Circle: function (styl) {
        if (styl.stroke) {
          source.stroke = _stroke(styl.stroke);
        }
        if (styl.fill) {
          source.fill = _fill(styl.fill);
        }
        return new openlayers.style.Style(source);
      }
    }
    out = methods[data.type](stl);
    return out;
  };

  var _view = function (center, zoom) {
    return new openlayers
      .View({
        center: openlayers.proj.fromLonLat(center),
        zoom: zoom
      });
  };

  var _extents = function (coords) {
    var out = openlayers.extent.boundingExtent(coords);
    return openlayers.proj.transformExtent(out, openlayers.proj.get('EPSG:4326'), openlayers.proj.get('EPSG:3857'));
  };

  var _source = {
    /**
     * __feature
     * Utility method for creating a source feature
     *
     * @param data ol.geom.*
     * @returns {ol.Feature}
     * @private
     */
    __feature: function (data, style, state) {
      var source = {};
      source.geometry = data;
      if (style) {
        source.style = style;
      }
      if (state) {
        source.state = state;
      }
      return new openlayers.Feature(source);
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
    __attributions: function (data) {
      var attributions = [];
      if (data) {
        if (Array.isArray(data)) {
          for (var d in data) {
            attributions.push(new openlayers.Attribution({html: data[d]}));
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
    /**
     * __normalize
     * Utility method for standardizing all point projections
     *
     * @param coordinates
     * @returns Array(transformedCoordinates)
     * @private
     */
    __normalize: function (coordinates) {
      return openlayers.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');
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
    _point: function (data) {
      var coords, styl, feature, state;
      if (Array.isArray(data)) {
        coords = data;
      } else {
        coords = data.coordinates;
        if (data.state) {
          state = data.state;
        }
      }
      if (typeof data.style !== 'undefined') {
        if (data.style.method) {
          var styleFunc = data.style.method;
          feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), styleFunc, 'inactive');
        } else {
          styl = data.style;
          styl.type = 'Point';
          styl = _style(styl);
          feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), styl, state);
        }
      } else {
        feature = _source.__feature(new openlayers.geom.Point(_source.__normalize(coords)), null, state);
      }
      return feature;
    },
    /**
     * _shape
     * Create a single Polygon feature
     *
     * @param data Object
     * @returns {ol.Feature}
     */
    _shape: function (data) {
      var vertices = [];
      for (var d = 0; d < data.coordinates.length; d++) {
        vertices.push(_source._normalize(data.coordinates[d]));
      }
      return _source._feature(new openlayers.geom.Polygon([vertices]));
    },
    /**
     * _xyz
     * Create a single tile source
     *
     * @param data Object
     * @returns {}
     */
    _xyz: function (data) {
      var attributions, url;
      if (data.attributions) {
        attributions = _source.__attributions(data.attributions);
      }
      if (data.url) {
        url = data.url;
      } else { // If there's no tiles url, we don't have a layer
        return false;
      }
      return {
        attributions: attributions,
        url: url
      };
    },
    /**
     * _image
     * Create a single image source
     *
     * @param data Object
     * @returns {}
     */
    _image: function (data) {
      // Create a "fake" layer so we can get the extents
      // where the image should place itself on our map
      var fake = _source.shape(data.coordinates);
      var extent = fake.getExtent();
      var attributions, url;
      if (data.attributions) {
        attributions = _source.__attributions(data.attributions);
      }
      if (data.url) {
        url = data.url;
      } else { // If there's no image url, we don't have a layer
        return false;
      }
      return {
        attributions: attributions,
        url: url,
        imageExtent: extent
      };
    },
    /**
     * _radius
     * Create one circle feature
     *
     * @param data Object
     * @returns {ol.Feature}
     */
    _radius: function (data) {
      var radiusMiles = data.radius;
      var arrConversion = [];
      arrConversion['degrees'] = (1 / (60 * 1.1508));
      arrConversion['dd'] = arrConversion['degrees'];
      arrConversion['m'] = (1609.344);
      arrConversion['ft'] = (5280);
      arrConversion['km'] = (1.609344);
      arrConversion['mi'] = (1);
      arrConversion['inches'] = (63360);
      // need to multiply by sqrt(2)/2 or 1.41421356/2  because
      // were passing in RADIUS and that's a diagonal when drawing the square.  so we have to
      // adjust by root 2 so we get the actual sides in length that we want
      var r = radiusMiles * arrConversion[data.units] * (1.41421356 / 2);
      var c = _source._normalize(data.coordinates);
      return _source._feature(new openlayers.geom.Circle(c, r));
    },
    /**
     * default
     * Create the default map base source
     *
     * @returns {ol.source.OSM}
     */
    default: function () {
      return new openlayers.source.OSM();
    },
    /**
     * xyz
     * Create one xyz source object
     *
     * @param data Object
     * @returns {ol.source.XYZ}
     */
    xyz: function (data) {
      return new openlayers.source.XYZ(_source._xyz(data));
    },
    /**
     * image
     * Create one image source object
     *
     * @param data
     * @returns {ol.source.ImageStatic}
     */
    image: function (data) {
      return new openlayers.source.ImageStatic(_source._image(data));
    },
    /**
     * point
     * Create one vector source with one point feature
     *
     * @param data Object
     * @returns {ol.source.Vector}
     */
    point: function (data) {
      var features = [_source._point(data)];
      return new openlayers.source.Vector(features);
    },
    /**
     * shape
     * Create one vector source with one polygon shape feature
     *
     * @param data Object
     * @returns {ol.source.Vector}
     */
    shape: function (data) {
      var features = [_source._shape(data)];
      return new openlayers.source.Vector(features);
    },
    /**
     * radius
     * Create one vector source with one circle shape feature
     *
     * @param data Object
     * @return {ol.source.Vector}
     */
    radius: function (data) {
      var features = [_source._radius(data)];
      return new openlayers.source.Vector(features);
    },
    /**
     * multi
     * Create a vector source with many features
     *
     * @param data Object
     * @return {ol.source.Vector}
     */
    multi: function (data) {
      var out = {};
      var features = [];
      for (var d = 0; d < data.length; d++) {
        var met = _source['_' + data[d].type];
        features.push(met(data[d]));
      }
      out.features = features;
      return new openlayers.source.Vector(out);
    },
    /**
     * geojson
     * Create one vector source with a shape based on a GeoJSON string
     *
     * @param data Object
     * @return {ol.source.Vector}
     */
    geojson: function (data) {
      var out;
      if (data !== null && typeof data === 'object') {
        out = new openlayers.source.Vector({
          features: (new openlayers.format.GeoJSON()).readFeatures(data),
          format: new ol.format.GeoJSON()
        });
      } else if (typeof data === 'string') {
        out = new openlayers.source.Vector({
          url: data,
          format: new ol.format.GeoJSON()
        });
      }
      return out;
    }
  };

  var _layer = {
    /**
     * draw
     * Master controller for drawing a layer
     *
     * @param data Object
     * @returns ol.layer.*
     */
    draw: function draw (data) {
      var layer
      if (!data) { // If no data, return the default OSM base layer. All maps have at least 1 layer
        layer = new openlayers.layer.Tile({name: 'base', source: _source.default()});
      } else { // Since we only ever draw one layer at a time, draw the layer passed to us
        // data.src possible values:
        // attributions : proper attribution for the source of the map data
        // url : url to the remote source for the layer
        // coordinates : array of long, lat pairs or array of array of long, lat pairs
        // style : object containing image, font, fill and stroke style assignments
        var func = this[data.type];
        layer = func(data.name, data.src);
      }
      return layer;
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
    tile: function tile (name, source) {
      // source should be an object of attributions, url
      var out = {};
      out.name = name;
      out.source = _source.xyz(source);
      return new openlayers.layer.Tile(out);
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
    image: function image (name, source) {
      // source should be an object of coordinates, attributions, url
      var out = {};
      out.name = name;
      out.source = _source.image(source);
      return new openlayers.layer.Image(out);
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
    shape: function shape (name, source) {
      // should be an object of coordinates (array), style (optional)
      var out = {};
      var style = null;
      out.name = name;
      out.source = _source.shape(source);
      if (source.style) {
        out.style = _style(source.style);
      } else {
        out.style = _style({type: 'Polygon'});
      }
      return new openlayers.layer.Vector(out);
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
    radius: function radius (name, source) {
      // should be an object of coordinates (object), style (optional)
      var out = {};
      var style = null;
      out.name = name;
      out.source = _source.radius(source);
      if (source.style) {
        out.style = _style(source.style);
      } else {
        out.style = _style({type: 'Polygon'});
      }
      return new openlayers.layer.Vector(out);
    },
    /**
     * geojson
     * Draw a layer based on a GeoJSON string
     *
     * @apram name String
     * @param source Object
     * @returns {ol.layer.Vector}
     */
    geojson: function geojson (name, source) {
      var out = {};
      var style = null;
      out.name = name;
      out.source = _source.geojson(source.coordinates);
      if (source.style) {
        out.style = _style(source.style);
      } else {
        out.style = _style({type: 'MultiPolygon'});
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
    multi: function multi (name, source) {
      var out = {};
      var style = null;
      out.name = name;
      out.source = _source.multi(source);
      if (source.style) {
        if (source.style.method) {
          out.style = source.style.method;
        } else {
          out.style = _style(source.style);
        }
      } else {
        out.style = _style({type: 'Polygon'});
      }
      return new openlayers.layer.Vector(out);
    },
    /**
     * group
     * Draw a group of layers based on an array of layer data objects
     *
     * @param data
     * @returns {module.Group|ol.layer.Group}
     */
    group: function group (name, source) {
      var layers = [];
      for (var s in source) {
        var func = _layer[source[s].type];
        layers.push(func(source[s].name, source[s].src));
      }
      return new openlayers.layer.Group({name: name, layers: layers});
    },
    /**
     * empty
     * Draw a layer with a pre-defined source
     *
     * @param data
     * @returns {ol.layer.*}
     */
    empty: function empty (name, source) {
      var out = {};
      out.name = name;
      if (source) {
        out.source = source;
      }
      return new openlayers.layer.Vector(out);
    }
  };

  var map = function () {
    this.ol = {};
    this.target = '';
    this.center = [0, 0];
    this.zoom = 4;
    this.extents = [];
    this.layers = [];
    this.defaults = defaults;
  }

  map.prototype.draw = function (target, data) {
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
          if (this.defaults.styles[s]) {
            var style = data.styles[s];
            for (var t in style) {
              this.defaults.styles[s][t] = style[t];
            }
          }
        }
      }
      if (data.base) {
        this.layers.push(_layer.draw(data.base));
      } else {
        this.layers.push(_layer.draw());
      }
    } else {
      this.layers.push(_layer.draw());
    }
    var mapdata = {
      target: this.target,
      layers: this.layers,
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

  map.prototype.getLayers = function (exclude) {
    var out = [];
    if (exclude) {
      this.layers.forEach(function (lyr) {
        if (!(lyr instanceof openlayers.layer.Group)) {
          out.push(lyr);
        }
      })
    } else {
      this.layers.forEach(function (lyr) {
        if (lyr instanceof openlayers.layer.Group) {
          lyr.getLayers().forEach(function (sublyr) {
            out.push(sublyr);
          })
        } else {
          out.push(lyr);
        }
      })
    }
    return out;
  }

  map.prototype.getLayer = function (name) {
    var out = [];
    var _this = this;
    var all = _this.getLayers();
    all.forEach(function (lyr) {
      if (name === lyr.get('name')) {
        out = lyr;
      }
    })
    return out;
  }

  map.prototype.getFeatures = function (layer) {
    return this.getLayer(layer).getSource().getFeatures(extent);
  }

  map.prototype.getFeature = function (layer, reference) {
    return this.getLayer(layer).getSource().getClosestFeatureToCoordinate(reference);
  }

  map.prototype.layer = function (data) {
    // Inject the global styles...
    data.defaultStyle = this.defaults.styles.pointStyle;
    var out = _layer.draw(data);
    this.layers.push(out);
    this.ol.addLayer(out);
    return out;
  }

  map.prototype.animate = function (data, interval) {
    var set = [];
    data.getLayers().forEach(function (layer) {
      set.push(layer);
    })
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

  map.prototype.panto = function (data) {
    if (data.extents) {
      var extent = _extents(data.extents);
      this.ol.getView().fit(extent, {duration: this.duration});
    }
    if (data.zoom) {
      this.ol.getView().animate({
        center: openlayers.proj.fromLonLat(data.center),
        duration: data.duration,
        zoom: data.zoom
      });
    }
  }

  function plugin (Vue, options) {

    var OLMap = Vue.extend({
      template: '<div></div>',
      props: {
        mapdata: Object
      },
      data: function data () {
        return this.mapdata;
      }
    });
    Vue.component('v-map', OLMap);

    Vue.map = new map();

    Vue.prototype.$cmi = {
      load: function load (cb) {
        if (document.readyState === 'complete') {
          return setTimeout(cb, 0);
        }
        if (document.readyState === 'interactive') {
          return setTimeout(function () { load(cb); }, 150) ;
        }
        document.addEventListener('DOMContentLoaded', cb);
      },
      map: function (target, data) {
        return Vue.map.draw(target, data);
      },
      layer: {
        getLayers: function (exclude) {
          return Vue.map.getLayers(exclude);
        },
        getLayer: function (name) {
          return Vue.map.getLayer(name);
        },
        getFeatures: function (layer) {
          return Vue.map.getFeatures(layer);
        },
        getFeature: function (layer, ref) {
          return Vue.map.getFeature(layer, ref);
        },
        draw: function (data) {
          return Vue.map.layer(data);
        }
      },
      control: {
        animate: function (data) {
          return Vue.map.animate(data);
        },
        panto: function (data) {
          return Vue.map.panto(data);
        }
      }
    }
  }

  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
  }
}
