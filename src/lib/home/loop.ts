import { $ } from './state'
import { scene, camera, renderer } from './scene'
import { updateStartupAnimation } from './loading'
import { updateLighting } from './updaters'
import { syncCustomPhysicsBodies } from './physics'
import { updateScrollHint } from './scroll-hint'
import { debugLog } from '../debug'

export function requestRender() {
  $.needsRender = true
  if ($.renderLoopId === null) {
    $.renderLoopId = window.requestAnimationFrame(animate)
  }
}

let lastFrameTs = 0

export function animate(timestamp?: number) {
  const now = timestamp ?? performance.now()
  const dt = lastFrameTs ? (now - lastFrameTs) / 1000 : 0.016
  lastFrameTs = now
  const renderThisFrame = $.needsRender
  $.needsRender = false

  if (!$.startupAnimationDone) {
    updateStartupAnimation(now)
    updateLighting(
      $.hemisphereLight!,
      $.keyLight!,
      $.fillLight!,
      $.accentLight!,
      $.overheadSpotLight!,
    )
    $.needsRender = true
  }

  camera.lookAt($.cameraCurrentLookAt)

  if ($.physics) {
    try {
      $.physics.world.step()
      const bodiesInMotion = syncCustomPhysicsBodies()
      if (bodiesInMotion) {
        $.needsRender = true
        debugLog('[loop] physics step - bodies in motion')
      }
    } catch (_) {
      debugLog('[loop] physics sync error', _)
    }
  }

  if ($.statsPanel) $.statsPanel.begin()

  if (renderThisFrame || !$.startupAnimationDone) {
    renderer.render(scene, camera)
  }

  if ($.statsPanel) $.statsPanel.end()

  updateScrollHint(dt)

  $.renderLoopId = window.requestAnimationFrame(animate)
}
