import * as THREE from 'three'
import { sceneSettings } from './settings'
import { $ } from './state'
import {
  scene,
  camera,
  renderer,
  roomColor,
  floorMaterial,
  floor,
  nameGroup,
  nameMaterial,
  cameraBasePosition,
  cameraBaseLookAt,
  spotlightBasePosition,
  spotlightTargetBasePosition,
  textForward,
} from './scene'

export function updateBackground() {
  document.documentElement.style.background = '#000000'
  document.body.style.background = '#000000'
}

export function updateSceneColors() {
  roomColor.set(sceneSettings.roomColor)
  floorMaterial.color.set(sceneSettings.floorColor)
  nameMaterial.color.set(sceneSettings.textColor)
  scene.background = roomColor
  scene.fog?.color.set(roomColor)
  renderer.setClearColor(roomColor, 1)
  updateBackground()
}

export function updateMaterials() {
  floorMaterial.color.set(sceneSettings.floorColor)
  floorMaterial.roughness = sceneSettings.floorRoughness
  floorMaterial.metalness = sceneSettings.floorMetalness
  floorMaterial.needsUpdate = true
  floor.receiveShadow = sceneSettings.floorReceivesShadow

  nameMaterial.color.set(sceneSettings.textColor)
  nameMaterial.roughness = sceneSettings.textRoughness
  nameMaterial.metalness = sceneSettings.textMetalness
  nameMaterial.needsUpdate = true

  if ($.nameMesh) {
    $.nameMesh.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = sceneSettings.textCastsShadow
      }
    })
  }
}

export function updateLighting(
  hemisphereLight: THREE.HemisphereLight,
  keyLight: THREE.DirectionalLight,
  fillLight: THREE.DirectionalLight,
  accentLight: THREE.PointLight,
  overheadSpotLight: THREE.SpotLight,
) {
  hemisphereLight.color.set(sceneSettings.hemisphereSkyColor)
  hemisphereLight.groundColor.set(sceneSettings.hemisphereGroundColor)
  hemisphereLight.intensity = sceneSettings.hemisphereIntensity * $.roomLightScale
  keyLight.color.set(sceneSettings.keyColor)
  keyLight.intensity = sceneSettings.keyIntensity * $.roomLightScale
  fillLight.color.set(sceneSettings.fillColor)
  fillLight.intensity = sceneSettings.fillIntensity * $.roomLightScale
  accentLight.color.set(sceneSettings.accentColor)
  accentLight.intensity = sceneSettings.accentIntensity * $.roomLightScale
  accentLight.distance = sceneSettings.accentDistance
  overheadSpotLight.color.set(sceneSettings.spotColor)
  overheadSpotLight.intensity = sceneSettings.spotIntensity * $.spotLightScale
  overheadSpotLight.distance = sceneSettings.spotDistance
  overheadSpotLight.angle = sceneSettings.spotAngle
  overheadSpotLight.penumbra = sceneSettings.spotPenumbra
  overheadSpotLight.decay = sceneSettings.spotDecay
  renderer.toneMappingExposure = sceneSettings.toneMappingExposure
}

export function updateScrollMotion(
  overheadSpotLight: THREE.SpotLight,
  overheadSpotTarget: THREE.Object3D,
) {
  const offset = textForward.clone().multiplyScalar(sceneSettings.scrollForwardOffset)

  camera.position.copy(cameraBasePosition).add(offset)
  $.cameraCurrentLookAt.copy(cameraBaseLookAt).add(offset)
  overheadSpotLight.position.copy(spotlightBasePosition).add(offset)
  overheadSpotTarget.position.copy(spotlightTargetBasePosition).add(offset)
}

export function resetPhysicsBodyFromMesh(mesh: THREE.Mesh) {
  const body = mesh.userData.physics?.body
  if (!body) return

  const entry = $.customPhysicsMap.get(mesh)
  const centerOffset = entry?.centerOffset

  const worldPos = new THREE.Vector3()
  mesh.getWorldPosition(worldPos)

  if (centerOffset) {
    worldPos.add(centerOffset)
  }

  body.setTranslation({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, true)
  body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
  body.setLinvel({ x: 0, y: 0, z: 0 }, true)
  body.setAngvel({ x: 0, y: 0, z: 0 }, true)
}

export function syncPhysicsFromTransform() {
  for (const mesh of $.physicsMeshes) {
    resetPhysicsBodyFromMesh(mesh)
  }
}

export function syncTransformSettingsFromObject() {
  sceneSettings.textPositionX = Number(nameGroup.position.x.toFixed(4))
  sceneSettings.textPositionY = Number(nameGroup.position.y.toFixed(4))
  sceneSettings.textPositionZ = Number(nameGroup.position.z.toFixed(4))
  sceneSettings.textRotationX = Number(nameGroup.rotation.x.toFixed(4))
  sceneSettings.textRotationY = Number(nameGroup.rotation.y.toFixed(4))
  sceneSettings.textRotationZ = Number(nameGroup.rotation.z.toFixed(4))
  sceneSettings.textScale = Number(nameGroup.scale.x.toFixed(4))
  $.transformGuiControllers.forEach((controller) => controller.updateDisplay())
}

export function updateTextTransform() {
  nameGroup.position.set(
    sceneSettings.textPositionX,
    sceneSettings.textPositionY,
    sceneSettings.textPositionZ,
  )
  nameGroup.rotation.set(
    sceneSettings.textRotationX,
    sceneSettings.textRotationY,
    sceneSettings.textRotationZ,
  )
  nameGroup.scale.setScalar(sceneSettings.textScale)
  syncPhysicsFromTransform()
}

export function updateTransformControls() {
  if (!$.transformControls) return

  $.transformControls.enabled = sceneSettings.transformControlsEnabled
  $.transformControls.visible = sceneSettings.transformControlsEnabled
  $.transformControls.mode = sceneSettings.transformControlsMode
  $.transformControls.size = sceneSettings.transformControlsSize
  $.transformControls.space = sceneSettings.transformControlsSpace
  $.transformControls.showX = sceneSettings.transformControlsShowX
  $.transformControls.showY = sceneSettings.transformControlsShowY
  $.transformControls.showZ = sceneSettings.transformControlsShowZ
}

