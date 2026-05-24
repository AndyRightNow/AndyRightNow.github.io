import * as THREE from 'three'
import { sceneSettings } from './settings'

export const canvas = document.querySelector('#landing-canvas')

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Landing canvas was not found.')
}

export const loadingScreen = document.querySelector('#loading-screen')

if (!(loadingScreen instanceof HTMLDivElement)) {
  throw new Error('Loading screen was not found.')
}

export const loadingProgress = document.querySelector('#loading-progress')

if (!(loadingProgress instanceof HTMLDivElement)) {
  throw new Error('Loading progress bar was not found.')
}

export const loadingManager = new THREE.LoadingManager()

export const roomColor = new THREE.Color(sceneSettings.roomColor)
const floorColor = new THREE.Color(sceneSettings.floorColor)
const white = new THREE.Color(sceneSettings.textColor)

export const scene = new THREE.Scene()
scene.background = roomColor
scene.fog = new THREE.Fog(roomColor, 18, 42)

export const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
camera.position.set(8.5, 8.5, 8.5)
camera.lookAt(0, 0.65, 0)

export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  powerPreference: 'high-performance',
})
renderer.setClearColor(roomColor, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = sceneSettings.toneMappingExposure

export const stage = new THREE.Group()
scene.add(stage)

export const floorMaterial = new THREE.MeshStandardMaterial({
  color: floorColor,
  roughness: sceneSettings.floorRoughness,
  metalness: sceneSettings.floorMetalness,
})

export const floor = new THREE.Mesh(new THREE.BoxGeometry(72, 2, 72), floorMaterial)
floor.position.y = -1
floor.receiveShadow = true
stage.add(floor)

export const nameGroup = new THREE.Group()
nameGroup.position.set(
  sceneSettings.textPositionX,
  sceneSettings.textPositionY,
  sceneSettings.textPositionZ,
)
scene.add(nameGroup)

export const nameMaterial = new THREE.MeshStandardMaterial({
  color: white,
  roughness: sceneSettings.textRoughness,
  metalness: sceneSettings.textMetalness,
})

export const cameraBasePosition = new THREE.Vector3(8.5, 8.5, 8.5)
export const cameraBaseLookAt = new THREE.Vector3(0, 0.65, 0)
export const spotlightBasePosition = new THREE.Vector3(0, 9, -0.35)
export const spotlightTargetBasePosition = new THREE.Vector3(0, 0, -0.35)
export const textForward = new THREE.Vector3(0, 0, 1)
export const raycaster = new THREE.Raycaster()
export const pointer = new THREE.Vector2()
