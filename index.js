var webRTCFlock = require('@flockcore/wrtc')
var dWebTower = require('dweb-tower')
var events = require('events')
var flockRevelation = require('@flockcore/revelation')
var flockDefaults = require('@flockcore/presets')

var DEFAULT_DWEBTOWER = 'https://tower1.dwebs.io'

module.exports = function (vault, opts) {
  var emitter = new events.EventEmitter()
  if (!opts) opts = {}
  var flockKey = (opts.FLOCK_KEY || 'dpack-') + (vault.revelationKey || vault.key).toString('hex')

  if (process.browser) {
    var ws = webRTCFlock(dWebTower(flockKey, opts.DWEBTOWER_URL || DEFAULT_DWEBTOWER))
    ws.on('peer', peer => {
      emitter.emit('peer', peer)
      peer.pipe(vault.replicate()).pipe(peer)
    })
  }

  if (process.versions.node) {
    var ds = flockRevelation(flockDefaults({
      stream: peer => {
        emitter.emit('peer', peer)
        return vault.replicate()
      }
    }, opts))
    ds.once('listening', () => ds.join(flockKey))
    ds.listen(0)
  }
  return emitter
}
