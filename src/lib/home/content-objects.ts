import * as THREE from 'three'
import { $ } from './state'
import { scene } from './scene'
import { addCustomPhysicsBody } from './physics'
import { debugLog } from '../debug'
import { debugFlags } from './debug-panel'
import { PLATE_DEFAULTS } from './content-config'
import type { ContentObjectConfig } from './content-config'

function rand(amplitude: number): number {
  return (Math.random() - 0.5) * 2 * amplitude
}

function createRoundedRectShape(
  width: number,
  height: number,
  cornerRadius: number,
): THREE.Shape {
  const hw = width / 2
  const hh = height / 2
  const r = cornerRadius

  const shape = new THREE.Shape()
  shape.moveTo(-hw + r, hh)
  shape.lineTo(hw - r, hh)
  shape.quadraticCurveTo(hw, hh, hw, hh - r)
  shape.lineTo(hw, -hh + r)
  shape.quadraticCurveTo(hw, -hh, hw - r, -hh)
  shape.lineTo(-hw + r, -hh)
  shape.quadraticCurveTo(-hw, -hh, -hw, -hh + r)
  shape.lineTo(-hw, hh - r)
  shape.quadraticCurveTo(-hw, hh, -hw + r, hh)
  return shape
}

export function createPlateMesh(config: ContentObjectConfig): THREE.Group {
  const pConfig = config.plate!
  const width = pConfig.width ?? PLATE_DEFAULTS.width
  const height = pConfig.height ?? PLATE_DEFAULTS.height
  const cornerRadius = pConfig.cornerRadius ?? PLATE_DEFAULTS.cornerRadius
  const thickness = pConfig.thickness ?? PLATE_DEFAULTS.thickness
  const { color } = pConfig

  const group = new THREE.Group()
  group.name = config.id

  const shape = createRoundedRectShape(width, height, cornerRadius)
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  }
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geometry.center()
  geometry.computeBoundingBox()

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = debugFlags.plateCastShadow
  mesh.receiveShadow = true
  mesh.userData.physics = { mass: 0.3, restitution: 0.3 }
  mesh.position.copy(group.position)
  group.add(mesh)

  const p = config.position
  const spawn = config.spawn ?? {
    heightAbove: 11,
    jitterX: 2,
    jitterY: 2,
    jitterZ: 2,
  }
  group.position.set(
    p.x + rand(spawn.jitterX),
    p.y + spawn.heightAbove + rand(spawn.jitterY),
    p.z + rand(spawn.jitterZ),
  )

  scene.add(group)
  $.physicsMeshes.push(mesh)

  debugLog('[content-objects] created plate', () => ({
    id: config.id,
    target: { x: p.x, y: p.y, z: p.z },
    spawn: {
      x: +group.position.x.toFixed(2),
      y: +group.position.y.toFixed(2),
      z: +group.position.z.toFixed(2),
    },
    dims: { width, height, thickness },
    color,
    shadow: {
      cast: mesh.castShadow,
      receive: mesh.receiveShadow,
    },
    material: {
      side: 'DoubleSide',
      roughness: 0.4,
      metalness: 0.1,
      shadowSide: material.shadowSide,
    },
  }))

  return group
}

const objectFactories: Record<
  string,
  (config: ContentObjectConfig) => THREE.Group
> = {
  plate: createPlateMesh,
}

export function createContentObject(config: ContentObjectConfig): THREE.Group {
  const factory = objectFactories[config.type]
  if (!factory) {
    throw new Error(`Unknown content object type: ${config.type}`)
  }
  return factory(config)
}

export function addPhysicsToContentObject(mesh: THREE.Mesh) {
  if (!$.physics) return
  if (mesh.userData.physics?.body) return

  const phys = mesh.userData.physics
  if (!phys) return

  addCustomPhysicsBody(mesh, phys.mass, phys.restitution)
}

export function addPhysicsToAllContentObjects() {
  for (const mesh of $.physicsMeshes) {
    addPhysicsToContentObject(mesh)
  }
}
