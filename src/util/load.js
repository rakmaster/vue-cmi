/**
 * load
 * wait for the DOM to load and become interactive
 *
 * @param cb
 */
function load (cb) {
  if (document.readyState === 'complete') {
    return setTimeout(cb, 0)
  }

  if (document.readyState === 'interactive') {
    return setTimeout(() => load(cb), 150)
  }

  document.addEventListener('DOMContentLoaded', cb)
}

export default load
