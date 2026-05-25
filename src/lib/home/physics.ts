import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { $ } from './state'
import { scene, loadingManager } from './scene'
import { debugLog } from '../debug'

const DEV = import.meta.env.DEV

const debugBoxes = new Map<THREE.Mesh, THREE.Mesh>()

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

  debugLog('[physics] addCustomPhysicsBody', {
    meshPos: { x: +mesh.position.x.toFixed(4), y: +mesh.position.y.toFixed(4), z: +mesh.position.z.toFixed(4) },
    worldPos: { x: +worldPos.x.toFixed(4), y: +worldPos.y.toFixed(4), z: +worldPos.z.toFixed(4) },
    bboxMin: { x: +bbox.min.x.toFixed(4), y: +bbox.min.y.toFixed(4), z: +bbox.min.z.toFixed(4) },
    bboxMax: { x: +bbox.max.x.toFixed(4), y: +bbox.max.y.toFixed(4), z: +bbox.max.z.toFixed(4) },
    bboxSize: { x: +(bbox.max.x - bbox.min.x).toFixed(4), y: +(bbox.max.y - bbox.min.y).toFixed(4), z: +(bbox.max.z - bbox.min.z).toFixed(4) },
    colliderHalfExtents: { sx: +sx.toFixed(4), sy: +sy.toFixed(4), sz: +sz.toFixed(4) },
    colliderCenter: { cx: +cx.toFixed(4), cy: +cy.toFixed(4), cz: +cz.toFixed(4) },
    mass,
    restitution,
  })

  const shape = RAPIER.ColliderDesc.cuboid(sx, sy, sz)
  shape.setMass(mass)
  shape.setRestitution(restitution)

  const localCenter = new THREE.Vector3(cx, cy, cz)
  const worldCenter = localCenter.clone()
  mesh.localToWorld(worldCenter)

  const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
  bodyDesc.setTranslation(worldCenter.x, worldCenter.y, worldCenter.z)
  bodyDesc.setLinearDamping(0.35)
  bodyDesc.lockRotations()
  const body = $.physics.world.createRigidBody(bodyDesc)
  $.physics.world.createCollider(shape, body)

  mesh.userData.physics = { mass, restitution, body }
  $.customPhysicsMap.set(mesh, { body, centerOffset: localCenter })

  if (DEV) {
    const boxGeo = new THREE.BoxGeometry(sx * 2, sy * 2, sz * 2)
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xff4444, wireframe: true, transparent: true, opacity: 0.5 })
    const box = new THREE.Mesh(boxGeo, boxMat)
    box.position.copy(worldCenter)
    box.renderOrder = 999
    box.material.depthTest = false
    scene.add(box)
    debugBoxes.set(mesh, box)
  }

  debugLog('[physics] body created', { body: !!body, customMapSize: $.customPhysicsMap.size })
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
    worldPos.set(t.x - centerOffset.x, t.y - centerOffset.y, t.z - centerOffset.z)

    if (mesh.parent) {
      mesh.parent.worldToLocal(worldPos)
    }

    mesh.position.copy(worldPos)
    mesh.quaternion.set(0, 0, 0, 1)

    if (DEV) {
      const box = debugBoxes.get(mesh)
      if (box) {
        box.position.set(t.x, t.y, t.z)
      }
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
  debugLog('[physics] $.physics set', { hasRAPIER: !!$.physics.RAPIER, hasWorld: !!$.physics.world })

  const floorShape = RAPIER.ColliderDesc.cuboid(36, 1, 36)
  const floorBodyDesc = RAPIER.RigidBodyDesc.fixed()
  floorBodyDesc.setTranslation(0, -1, 0)
  const floorBody = world.createRigidBody(floorBodyDesc)
  world.createCollider(floorShape, floorBody)
  debugLog('[physics] floor physics body created')

  debugLog('[physics] adding bodies for', $.physicsMeshes.length, 'existing meshes')
  for (const mesh of $.physicsMeshes) {
    addCustomPhysicsBody(mesh, 0.8, 0.22)
  }

  loadingManager.itemEnd('rapier-physics')
  debugLog('[physics] setup complete')
}
