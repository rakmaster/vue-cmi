import _map from './map'
import Components from './components'
import Load from './util/load'

/**
 * Vue.js default settings for component rendering
 *
 * @type {{componentPrefix: string, directivePrefix: string}}
 */
const vDefaults = {
  componentPrefix: 'V',
  directivePrefix: ''
}

/**
 * CMI
 *
 * @param Vue (object) the current Vue.js instance
 * @param options (object) pass additional options to the plugin to over-ride the CMI defaults
 */
function plugin (Vue, options) {
  /**
   * TBD - create the method to import and overwrite CMI defaults using the "options" object
  */
  options = Object.assign(vDefaults, (options || {}))
  // Instantiate the components
  Object.keys(Components).forEach(key => {
    Vue.component(`${options.componentPrefix}${key}`, Components[key])
  })
  // Create the map instance
  Vue.map = new _map()
  // Create the $cmi namespace
  Vue.prototype.$cmi = {
    load: Load,
    /**
     * map
     * The base method for instantiating a new openlayers map
     *
     * @param target (string) the id of the DOM element to use for the map
     * @param data (object) passes a JSON object of initial map settings / options
     * @returns ol.Map
     */
    map: (target, data) => {
      return Vue.map.draw(target, data)
    },
    layer: { // layer namespace contains all layer rendering methods
      /**
       * getLayers
       * retrieve all layers for the current map instance
       *
       * @param deep (boolean) flag to exclude recursive layer searching
       * @returns ol.Collection
       */
      getLayers: (deep) => {
        return Vue.map.getLayers(deep)
      },
      /**
       * getLayer
       * retrieve a single layer by the layer property "name"
       *
       * @param name (string) the layer name to retrieve
       * @returns ol.Layer
       */
      getLayer: (name) => {
        return Vue.map.getLayer(name)
      },
      /**
       * getFeatures
       * retrive all features on the layer passed to the method
       *
       * @param layer (object) the layer instance to search
       * @returns ol.FeatureCollection
       */
      getFeatures: (layer) => {
        return Vue.map.getFeatures(layer)
      },
      /**
       * getFeature
       * retrieve a single feature within a layer by coordinates
       *
       * @param layer (object) the layer instance to search
       * @param ref (array) [longitude, latitude]
       * @returns ol.Feature
       */
      getFeature: (layer, coordinates) => {
        return Vue.map.getFeature(layer, coordinates)
      },
      /**
       * draw
       * draw a new layer
       *
       * @param data (object) a JSON object of parameters for the new layer
       * @returns ol.layer.*
       */
      draw: (data) => {
        return Vue.map.layer(data)
      }
    },
    control: { // control namespace contains all map control methods
      /**
       * animate
       * animate layers within a group layer
       *
       * @param data (object) a JSON object of parameters for the animation
       */
      animate: (data) => {
        /** TBD get a better method for passing animation information to the method */
        return Vue.map.animate(data)
      },
      /**
       * panto
       * pan to a position on the map by extents, or by center and zoom
       *
       * @param data (object) a JSON object of parameters for the pan
       */
      panto: (data) => {
        return Vue.map.panto(data)
      }
    },
    functions: { // functions namespace contains additional functional methods
      /**
       * normalize
       * change projection of coordinates passed
       *
       * @param data (object) a JSON object of parameters for the normalization
       * @returns (array) array of coordinates
       */
      normalize: (data) => {
        return Vue.map.normalize(data)
      },
      /**
       * style
       * renders a style object in openlayers format
       *
       * @param data (object) a JSON object of style information to render
       * @returns ol.Style
       */
      style: (data) => {
        return Vue.map.style(data)
      }
    }
  }
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin
