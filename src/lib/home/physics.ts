import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { $ } from './state'
import { scene, loadingManager } from './scene'
import { debugLog } from '../debug'

const DEV = import.meta.env.DEV

interface DebugBox {
  mesh: THREE.Mesh
  body: any
}

const debugBoxes: DebugBox[] = []
const debugBoxByHandle = new Map<number, THREE.Mesh>()

export function addColliderDebugBox(
  body: any,
  halfExtents: { x: number; y: number; z: number },
  worldCenter: THREE.Vector3,
) {
  const boxGeo = new THREE.BoxGeometry(
    halfExtents.x * 2,
    halfExtents.y * 2,
    halfExtents.z * 2,
  )
  const boxMat = new THREE.MeshBasicMaterial({
    color: 0xff4444,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  })
  const box = new THREE.Mesh(boxGeo, boxMat)
  box.position.copy(worldCenter)
  box.renderOrder = 999
  box.material.depthTest = false
  box.visible = false
  scene.add(box)
  debugBoxes.push({ mesh: box, body })
  debugBoxByHandle.set(body.handle, box)
  return box
}

export function setColliderDebugVisible(visible: boolean) {
  for (const entry of debugBoxes) {
    entry.mesh.visible = visible
  }
}

export function addCustomPhysicsBody(
  mesh: THREE.Mesh,
  mass: number,
  restitution: number,
) {
  mesh.geometry.computeBoundingBox()
  const bbox = mesh.geometry.boundingBox!
  const cx = (bbox.min.x + bbox.max.x) / 2
  const cy = (bbox.min.y + bbox.max.y) / 2
  const cz = (bbox.min.z + bbox.max.z) / 2
  const sx = Math.max((bbox.max.x - bbox.min.x) / 2, 0.03)
  const sy = Math.max((bbox.max.y - bbox.min.y) / 2, 0.03)
  const sz = Math.max((bbox.max.z - bbox.min.z) / 2, 0.03)

  const worldPos = new THREE.Vector3()
  mesh.getWorldPosition(worldPos)

  const worldQuat = new THREE.Quaternion()
  mesh.getWorldQuaternion(worldQuat)

  debugLog('[physics] addCustomPhysicsBody', () => ({
    meshPos: {
      x: +mesh.position.x.toFixed(4),
      y: +mesh.position.y.toFixed(4),
      z: +mesh.position.z.toFixed(4),
    },
    worldPos: {
      x: +worldPos.x.toFixed(4),
      y: +worldPos.y.toFixed(4),
      z: +worldPos.z.toFixed(4),
    },
    worldQuat: {
      x: +worldQuat.x.toFixed(4),
      y: +worldQuat.y.toFixed(4),
      z: +worldQuat.z.toFixed(4),
      w: +worldQuat.w.toFixed(4),
    },
    bboxMin: {
      x: +bbox.min.x.toFixed(4),
      y: +bbox.min.y.toFixed(4),
      z: +bbox.min.z.toFixed(4),
    },
    bboxMax: {
      x: +bbox.max.x.toFixed(4),
      y: +bbox.max.y.toFixed(4),
      z: +bbox.max.z.toFixed(4),
    },
    bboxSize: {
      x: +(bbox.max.x - bbox.min.x).toFixed(4),
      y: +(bbox.max.y - bbox.min.y).toFixed(4),
      z: +(bbox.max.z - bbox.min.z).toFixed(4),
    },
    colliderHalfExtents: {
      sx: +sx.toFixed(4),
      sy: +sy.toFixed(4),
      sz: +sz.toFixed(4),
    },
    colliderCenter: {
      cx: +cx.toFixed(4),
      cy: +cy.toFixed(4),
      cz: +cz.toFixed(4),
    },
    mass,
    restitution,
  }))

  const shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz)
  shape.setMass(mass)
  shape.setRestitution(restitution)

  const localCenter = new THREE.Vector3(cx, cy, cz)
  const worldCenter = localCenter.clone()
  mesh.localToWorld(worldCenter)

  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
  bodyDesc.setTranslation(worldCenter.x, worldCenter.y, worldCenter.z)
  bodyDesc.setLinearDamping(0.35)
  bodyDesc.setAngularDamping(0.6)
  const body = $.physics.world.createRigidBody(bodyDesc)
  body.setRotation(
    { x: worldQuat.x, y: worldQuat.y, z: worldQuat.z, w: worldQuat.w },
    true,
  )
  $.physics.world.createCollider(shape, body)

  mesh.userData.physics = { mass, restitution, body }
  $.customPhysicsMap.set(mesh, { body, centerOffset: localCenter })

  if (DEV) {
    addColliderDebugBox(body, { x: sx, y: sy, z: sz }, worldCenter)
  }

  debugLog('[physics] body created', () => ({
    body: !!body,
    customMapSize: $.customPhysicsMap.size,
  }))
}

export function syncCustomPhysicsBodies(): boolean {
  if ($.customPhysicsMap.size === 0) return false

  const worldPos = new THREE.Vector3()
  let anyMoving = false
  const velocityThreshold = 0.001

  for (const [mesh, { body, centerOffset }] of $.customPhysicsMap) {
    const linvel = body.linvel()
    const angvel = body.angvel()
    if (
      Math.abs(linvel.x) > velocityThreshold ||
      Math.abs(linvel.y) > velocityThreshold ||
      Math.abs(linvel.z) > velocityThreshold ||
      Math.abs(angvel.x) > velocityThreshold ||
      Math.abs(angvel.y) > velocityThreshold ||
      Math.abs(angvel.z) > velocityThreshold
    ) {
      anyMoving = true
    }

    const t = body.translation()
    const rot = body.rotation()
    const bodyQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    const offsetWorld = new THREE.Vector3(
      centerOffset.x,
      centerOffset.y,
      centerOffset.z,
    ).applyQuaternion(bodyQuat)
    worldPos.set(
      t.x - offsetWorld.x,
      t.y - offsetWorld.y,
      t.z - offsetWorld.z,
    )

    if (mesh.parent) {
      mesh.parent.worldToLocal(worldPos)
      const parentQuat = new THREE.Quaternion()
      mesh.parent.getWorldQuaternion(parentQuat)
      mesh.quaternion.copy(parentQuat.clone().invert().multiply(bodyQuat))
    } else {
      mesh.quaternion.copy(bodyQuat)
    }

    mesh.position.copy(worldPos)

    debugLog('[physics] sync body', () => ({
      meshName: mesh.name || mesh.uuid.slice(0, 8),
      hasParent: !!mesh.parent,
      body: {
        translation: { x: +t.x.toFixed(3), y: +t.y.toFixed(3), z: +t.z.toFixed(3) },
        quat: { x: +rot.x.toFixed(4), y: +rot.y.toFixed(4), z: +rot.z.toFixed(4), w: +rot.w.toFixed(4) },
      },
      centerOffset: { x: +centerOffset.x.toFixed(4), y: +centerOffset.y.toFixed(4), z: +centerOffset.z.toFixed(4) },
      offsetWorld: { x: +offsetWorld.x.toFixed(4), y: +offsetWorld.y.toFixed(4), z: +offsetWorld.z.toFixed(4) },
      meshLocalPos: { x: +mesh.position.x.toFixed(3), y: +mesh.position.y.toFixed(3), z: +mesh.position.z.toFixed(3) },
      meshLocalQuat: {
        x: +mesh.quaternion.x.toFixed(4),
        y: +mesh.quaternion.y.toFixed(4),
        z: +mesh.quaternion.z.toFixed(4),
        w: +mesh.quaternion.w.toFixed(4),
      },
    }))

    const box = debugBoxByHandle.get(body.handle)
    if (box) {
      box.position.set(t.x, t.y, t.z)
      box.quaternion.set(rot.x, rot.y, rot.z, rot.w)
    }
  }

  return anyMoving
}

export async function setupPhysics() {
  loadingManager.itemStart('rapier-physics')

  debugLog('[physics] initializing RAPIER...')
  await RAPIER.init()
  debugLog('[physics] RAPIER initialized, creating world')

  const gravity = { x: 0.0, y: -9.81, z: 0.0 }
  const world = new RAPIER.World(gravity)
  world.integrationParameters.dt = 1 / 60

  $.physics = { RAPIER, world }
  debugLog('[physics] $.physics set', () => ({
    hasRAPIER: !!$.physics.RAPIER,
    hasWorld: !!$.physics.world,
  }))

  const floorShape = RAPIER.ColliderDesc.cuboid(12, 1, 100)
  const floorBodyDesc = RAPIER.RigidBodyDesc.fixed()
  floorBodyDesc.setTranslation(0, -1, 60)
  const floorBody = world.createRigidBody(floorBodyDesc)
  world.createCollider(floorShape, floorBody)
  debugLog('[physics] floor physics body created')

  debugLog(
    '[physics] adding bodies for',
    $.physicsMeshes.length,
    'existing meshes',
  )
  for (const mesh of $.physicsMeshes) {
    addCustomPhysicsBody(mesh, 0.8, 0.22)
  }

  loadingManager.itemEnd('rapier-physics')
  debugLog('[physics] setup complete')
}
