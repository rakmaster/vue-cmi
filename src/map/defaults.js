/**
 * default settings used by CMI
 *
 * These settings are the basic settings used by CMI
 * throughout the application. This object can be
 * added to, or modified on a per-project basis
 */
export const defaults = {
  duration: 500, // default animation duration
  styles: { // default stroke, fill and text styles
    stroke: {
      color: 'rgba(0,0,0,1.0)',
      width: 1
    },
    fill: {
      color:  'rgba(0,80,180,1.0)'
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
}
