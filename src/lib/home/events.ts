import * as THREE from 'three'
import { sceneSettings } from './settings'
import { $ } from './state'
import { camera, renderer, raycaster, pointer } from './scene'
import { updateScrollMotion } from './updaters'
import { requestRender } from './loop'
import { dismissScrollHint } from './scroll-hint'
import { checkAndSpawnContentObjects } from './section-manager'
import { debugLog } from '../debug'

function randomSphereDirection(): THREE.Vector3 {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.sin(phi) * Math.sin(theta),
    Math.cos(phi),
  )
}

export function resize() {
  const { innerWidth, innerHeight } = window
  const aspect = innerWidth / innerHeight
  $.viewSize =
    innerWidth < 720
      ? sceneSettings.cameraViewSizeMobile
      : sceneSettings.cameraViewSizeDesktop

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
  dismissScrollHint()
  const nextOffset = sceneSettings.scrollForwardOffset + event.deltaY * 0.003
  const clampedOffset = Math.min(
    Math.max(nextOffset, sceneSettings.scrollForwardMin),
    sceneSettings.scrollForwardMax,
  )

  debugLog('[events] handleWheel', () => ({
    deltaY: event.deltaY,
    multiplier: 0.003,
    rawNext: +nextOffset.toFixed(3),
    clamped: +clampedOffset.toFixed(3),
    prevOffset: +sceneSettings.scrollForwardOffset.toFixed(3),
  }))

  sceneSettings.scrollForwardOffset = clampedOffset
  updateScrollMotion($.keyLight!, $.keyLightTarget!, $.overheadSpotLight!, $.overheadSpotTarget!)
  checkAndSpawnContentObjects()
  requestRender()
}

export function handlePointerDown(event: PointerEvent) {
  debugLog('[impulse] === pointerdown ===', () => ({
    clientX: event.clientX,
    clientY: event.clientY,
    windowW: window.innerWidth,
    windowH: window.innerHeight,
    physics: !!$.physics,
    world: !!$.physics?.world,
    meshes: $.physicsMeshes.length,
    customMapSize: $.customPhysicsMap.size,
    dragging: !!$.transformControls?.dragging,
    impulseStrength: sceneSettings.clickImpulseStrength,
  }))

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

  debugLog('[impulse] NDC pointer', () => ({
    x: +pointer.x.toFixed(4),
    y: +pointer.y.toFixed(4),
  }))

  raycaster.setFromCamera(pointer, camera)

  debugLog('[impulse] raycaster setup', () => ({
    rayOrigin: {
      x: +raycaster.ray.origin.x.toFixed(3),
      y: +raycaster.ray.origin.y.toFixed(3),
      z: +raycaster.ray.origin.z.toFixed(3),
    },
    rayDirection: {
      x: +raycaster.ray.direction.x.toFixed(4),
      y: +raycaster.ray.direction.y.toFixed(4),
      z: +raycaster.ray.direction.z.toFixed(4),
    },
    cameraPos: {
      x: +camera.position.x.toFixed(2),
      y: +camera.position.y.toFixed(2),
      z: +camera.position.z.toFixed(2),
    },
  }))

  const hits = raycaster.intersectObjects($.physicsMeshes, true)

  debugLog('[impulse] raycaster hits', () => ({
    count: hits.length,
    objects: hits.map((h) => ({
      uuid: h.object.uuid,
      name: h.object.name,
      distance: +h.distance.toFixed(4),
      point: {
        x: +h.point.x.toFixed(4),
        y: +h.point.y.toFixed(4),
        z: +h.point.z.toFixed(4),
      },
      faceNormal: h.face?.normal
        ? {
            x: +h.face.normal.x.toFixed(4),
            y: +h.face.normal.y.toFixed(4),
            z: +h.face.normal.z.toFixed(4),
          }
        : null,
    })),
  }))

  const hit = hits.find((entry) =>
    $.physicsMeshes.includes(entry.object as THREE.Mesh),
  )

  if (!hit) {
    debugLog('[impulse] no hit on physics mesh')
    return
  }

  const hitMesh = hit.object as THREE.Mesh
  const body = hitMesh.userData.physics?.body
  const bodyMass = hitMesh.userData.physics?.mass

  debugLog('[impulse] hit identified', () => ({
    meshUUID: hitMesh.uuid,
    meshName: hitMesh.name,
    distance: +hit.distance.toFixed(4),
    faceIndex: hit.faceIndex,
    hasBody: !!body,
    bodyMass,
    hasApplyImpulse: typeof body?.applyImpulseAtPoint === 'function',
  }))

  if (!body || typeof body.applyImpulseAtPoint !== 'function') {
    debugLog('[impulse] ERROR - body missing or lacks applyImpulseAtPoint')
    throw new Error('Rapier body does not support applyImpulseAtPoint.')
  }

  const preVel = body.linvel()
  const preAngVel = body.angvel()
  const prePos = body.translation()

  debugLog('[impulse] body state before impulse', () => ({
    position: {
      x: +prePos.x.toFixed(4),
      y: +prePos.y.toFixed(4),
      z: +prePos.z.toFixed(4),
    },
    velocity: {
      x: +preVel.x.toFixed(4),
      y: +preVel.y.toFixed(4),
      z: +preVel.z.toFixed(4),
    },
    speed: +Math.sqrt(
      preVel.x * preVel.x + preVel.y * preVel.y + preVel.z * preVel.z,
    ).toFixed(4),
    angularVelocity: {
      x: +preAngVel.x.toFixed(4),
      y: +preAngVel.y.toFixed(4),
      z: +preAngVel.z.toFixed(4),
    },
    mass: bodyMass,
  }))

  const spatialDirection = randomSphereDirection()

  debugLog('[impulse] random spatial direction (raw)', () => ({
    x: +spatialDirection.x.toFixed(4),
    y: +spatialDirection.y.toFixed(4),
    z: +spatialDirection.z.toFixed(4),
    length: +spatialDirection.length().toFixed(6),
    theta: +Math.atan2(
      Math.sqrt(
        spatialDirection.x * spatialDirection.x +
          spatialDirection.z * spatialDirection.z,
      ),
      spatialDirection.y,
    ).toFixed(3),
    phi: +Math.atan2(spatialDirection.z, spatialDirection.x).toFixed(3),
  }))

  const impulseVector = spatialDirection.multiplyScalar(
    sceneSettings.clickImpulseStrength,
  )
  const impulse = {
    x: impulseVector.x,
    y: impulseVector.y,
    z: impulseVector.z,
  }

  const hitWorldPoint = hit.point.clone()
  if (hitMesh.parent) {
    hitMesh.parent.localToWorld(hitWorldPoint)
  }

  debugLog('[impulse] hit point details', () => ({
    localPoint: {
      x: +hit.point.x.toFixed(4),
      y: +hit.point.y.toFixed(4),
      z: +hit.point.z.toFixed(4),
    },
    worldPoint: {
      x: +hitWorldPoint.x.toFixed(4),
      y: +hitWorldPoint.y.toFixed(4),
      z: +hitWorldPoint.z.toFixed(4),
    },
    faceNormal: hit.face?.normal
      ? {
          x: +hit.face.normal.x.toFixed(4),
          y: +hit.face.normal.y.toFixed(4),
          z: +hit.face.normal.z.toFixed(4),
        }
      : null,
  }))

  debugLog('[impulse] applying impulse', () => ({
    impulse: {
      x: +impulse.x.toFixed(4),
      y: +impulse.y.toFixed(4),
      z: +impulse.z.toFixed(4),
    },
    magnitude: +Math.sqrt(
      impulse.x * impulse.x + impulse.y * impulse.y + impulse.z * impulse.z,
    ).toFixed(4),
    applicationPoint: {
      x: +hit.point.x.toFixed(4),
      y: +hit.point.y.toFixed(4),
      z: +hit.point.z.toFixed(4),
    },
    wakeUp: true,
  }))

  const point = { x: hit.point.x, y: hit.point.y, z: hit.point.z }
  body.applyImpulseAtPoint(impulse, point, true)

  const postVel = body.linvel()
  const postAngVel = body.angvel()
  const postPos = body.translation()

  debugLog('[impulse] body state after impulse', () => ({
    position: {
      x: +postPos.x.toFixed(4),
      y: +postPos.y.toFixed(4),
      z: +postPos.z.toFixed(4),
    },
    velocity: {
      x: +postVel.x.toFixed(4),
      y: +postVel.y.toFixed(4),
      z: +postVel.z.toFixed(4),
    },
    speed: +Math.sqrt(
      postVel.x * postVel.x + postVel.y * postVel.y + postVel.z * postVel.z,
    ).toFixed(4),
    angularVelocity: {
      x: +postAngVel.x.toFixed(4),
      y: +postAngVel.y.toFixed(4),
      z: +postAngVel.z.toFixed(4),
    },
    deltaV: {
      x: +(postVel.x - preVel.x).toFixed(4),
      y: +(postVel.y - preVel.y).toFixed(4),
      z: +(postVel.z - preVel.z).toFixed(4),
    },
  }))

  requestRender()
  debugLog('[impulse] === done ===')
}
