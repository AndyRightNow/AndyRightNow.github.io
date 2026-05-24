import * as THREE from 'three'
import { sceneSettings } from './settings'
import { $ } from './state'
import {
  scene,
  camera,
  renderer,
  raycaster,
  pointer,
} from './scene'
import { updateScrollMotion } from './updaters'
import { requestRender } from './loop'
import { debugLog } from '../debug'

export function resize() {
  const { innerWidth, innerHeight } = window
  const aspect = innerWidth / innerHeight
  $.viewSize =
    innerWidth < 720 ? sceneSettings.cameraViewSizeMobile : sceneSettings.cameraViewSizeDesktop

  camera.left = (-$.viewSize * aspect) / 2
  camera.right = ($.viewSize * aspect) / 2
  camera.top = $.viewSize / 2
  camera.bottom = -$.viewSize / 2
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight, false)
  requestRender()
}

export function handleWheel(event: WheelEvent) {
  event.preventDefault()
  const nextOffset = sceneSettings.scrollForwardOffset + event.deltaY * 0.003
  sceneSettings.scrollForwardOffset = Math.min(
    Math.max(nextOffset, sceneSettings.scrollForwardMin),
    sceneSettings.scrollForwardMax,
  )
  updateScrollMotion($.overheadSpotLight!, $.overheadSpotTarget!)
  requestRender()
}

export function handlePointerDown(event: PointerEvent) {
  debugLog('[impulse] pointerdown', { physics: !!$.physics, meshes: $.physicsMeshes.length, dragging: !!$.transformControls?.dragging })

  if ($.transformControls?.dragging) {
    debugLog('[impulse] skipping - transform controls dragging')
    return
  }
  if ($.physicsMeshes.length === 0) {
    debugLog('[impulse] skipping - no physics meshes')
    return
  }
  if (!$.physics) {
    debugLog('[impulse] skipping - physics not ready')
    return
  }

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  const hits = raycaster.intersectObjects($.physicsMeshes, true)
  debugLog('[impulse] raycaster hits', hits.length)

  const hit = hits.find((entry) => $.physicsMeshes.includes(entry.object as THREE.Mesh))

  if (!hit) {
    debugLog('[impulse] no hit on physics mesh')
    return
  }

  const body = (hit.object as THREE.Mesh).userData.physics?.body
  debugLog('[impulse] hit body', { hasBody: !!body, hasApplyImpulse: typeof body?.applyImpulseAtPoint === 'function' })

  if (!body || typeof body.applyImpulseAtPoint !== 'function') {
    debugLog('[impulse] ERROR - body missing or lacks applyImpulseAtPoint')
    throw new Error('Rapier body does not support applyImpulseAtPoint.')
  }

  const randomDirection = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() * 0.65 + 0.35,
    Math.random() - 0.5,
  ).normalize()
  const impulseVector = randomDirection.multiplyScalar(sceneSettings.clickImpulseStrength)
  const impulse = { x: impulseVector.x, y: impulseVector.y, z: impulseVector.z }
  const point = { x: hit.point.x, y: hit.point.y, z: hit.point.z }

  debugLog('[impulse] applying', { impulse, point })
  body.applyImpulseAtPoint(impulse, point, true)
  requestRender()
  debugLog('[impulse] done')
}
