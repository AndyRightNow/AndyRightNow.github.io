import * as THREE from 'three'
import { $ } from './state'
import { scene, camera, renderer } from './scene'
import { updateStartupAnimation } from './loading'
import { updateLighting } from './updaters'
import { syncCustomPhysicsBodies } from './physics'
import { debugLog } from '../debug'

export function requestRender() {
  $.needsRender = true
  if ($.renderLoopId === null) {
    $.renderLoopId = window.requestAnimationFrame(animate)
  }
}

export function animate() {
  const now = performance.now()

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

  if ($.needsRender) {
    renderer.render(scene, camera)
  }

  if ($.statsPanel) $.statsPanel.end()

  $.needsRender = false
  $.renderLoopId = window.requestAnimationFrame(animate)
}
