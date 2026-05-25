import * as THREE from 'three'
import { sceneSettings } from './settings'
import { $ } from './state'
import { scene } from './scene'
import { debugLog } from '../debug'

export function createHemisphereLight() {
  const light = new THREE.HemisphereLight(
    sceneSettings.hemisphereSkyColor,
    sceneSettings.hemisphereGroundColor,
    sceneSettings.hemisphereIntensity,
  )
  scene.add(light)
  $.hemisphereLight = light
}

export function createKeyLight() {
  const target = new THREE.Object3D()
    target.position.set(0, 0, 0)
  scene.add(target)

  const light = new THREE.DirectionalLight(
    sceneSettings.keyColor,
    sceneSettings.keyIntensity,
  )
  light.position.set(-5, 9, 6)
  light.target = target
  light.castShadow = true
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048
  light.shadow.camera.left = -9
  light.shadow.camera.right = 9
  light.shadow.camera.top = 9
  light.shadow.camera.bottom = -9
  light.shadow.camera.near = 1
  light.shadow.camera.far = 24
  light.shadow.bias = -0.0013
  light.shadow.normalBias = 0.002
  scene.add(light)
  $.keyLight = light
  $.keyLightTarget = target

  debugLog('[lights] key light created', () => ({
    position: { x: -5, y: 9, z: 6 },
    target: { x: 0, y: 0, z: 0 },
    direction: { x: 5, y: -9, z: -6 },
    shadow: {
      mapSize: '2048x2048',
      camera: { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 24 },
      bias: -0.00012,
      normalBias: 0.002,
    },
  }))
}

export function createFillLight() {
  const light = new THREE.DirectionalLight(
    sceneSettings.fillColor,
    sceneSettings.fillIntensity,
  )
  light.position.set(7, 5, -4)
  scene.add(light)
  $.fillLight = light
}

export function createAccentLight() {
  const light = new THREE.PointLight(
    sceneSettings.accentColor,
    sceneSettings.accentIntensity,
    sceneSettings.accentDistance,
  )
  light.position.set(2.5, 4.6, 2.5)
  scene.add(light)
  $.accentLight = light
}

export function createSpotLight() {
  const target = new THREE.Object3D()
  target.position.set(0, 0, -0.35)
  scene.add(target)

  const light = new THREE.SpotLight(
    sceneSettings.spotColor,
    sceneSettings.spotIntensity,
    sceneSettings.spotDistance,
    sceneSettings.spotAngle,
    sceneSettings.spotPenumbra,
    sceneSettings.spotDecay,
  )
  light.position.set(0, 9, -0.35)
  light.target = target
  light.castShadow = true
  light.shadow.mapSize.width = 512
  light.shadow.mapSize.height = 512
  light.shadow.bias = -0.00012
  light.shadow.normalBias = 0.002
  scene.add(light)
  $.overheadSpotLight = light
  $.overheadSpotTarget = target
}
