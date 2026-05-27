import * as THREE from 'three'
import { $ } from './state'
import { scene } from './scene'
import { guiAdd } from './gui'
import { requestRender } from './loop'
import { sections } from './content-config'

export const debugFlags = {
  keyLightCastShadow: true,
  plateCastShadow: true,
  keyLightShadowBias: -0.0013,
  showSpawnRange: false,
}

export const spawnRangeSettings = {
  heightAbove: 11,
  jitterX: 0.7,
  jitterY: 2,
  jitterZ: 2.1,
}

const SECTION_COLORS: Record<string, number> = {
  fullstack: 0x61dafb,
  'ai-engineering': 0xa259ff,
  gamedev: 0xff9933,
}

let rangeMarkers: THREE.Line[] = []

function drawSpawnRange() {
  removeSpawnRange()

  if (!debugFlags.showSpawnRange) return

  const { jitterX, jitterZ } = spawnRangeSettings

  for (const section of sections) {
    if (section.contentObjects.length === 0) continue
    const color = SECTION_COLORS[section.id] ?? 0xffffff

    for (const obj of section.contentObjects) {
      const cx = obj.position.x
      const cz = obj.position.z
      const halfW = jitterX
      const halfD = jitterZ

      const points = [
        new THREE.Vector3(cx - halfW, 0.03, cz - halfD),
        new THREE.Vector3(cx + halfW, 0.03, cz - halfD),
        new THREE.Vector3(cx + halfW, 0.03, cz + halfD),
        new THREE.Vector3(cx - halfW, 0.03, cz + halfD),
        new THREE.Vector3(cx - halfW, 0.03, cz - halfD),
      ]
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
        depthTest: true,
      })
      const line = new THREE.Line(geo, mat)
      scene.add(line)
      rangeMarkers.push(line)
    }
  }

  requestRender()
}

function removeSpawnRange() {
  for (const marker of rangeMarkers) {
    marker.geometry.dispose()
    ;(marker.material as THREE.Material).dispose()
    scene.remove(marker)
  }
  rangeMarkers = []
}

export function applyDebugShadowBias() {
  if ($.keyLight) {
    $.keyLight.shadow.bias = debugFlags.keyLightShadowBias
    requestRender()
  }
}

export function applyDebugKeyLightShadow() {
  if ($.keyLight) {
    $.keyLight.castShadow = debugFlags.keyLightCastShadow
    requestRender()
  }
}

export function addDebugGuiControls() {
  const folder = $.gui.addFolder('Debug panel')
  guiAdd(folder, debugFlags, 'keyLightCastShadow')
    .name('Key light casts shadow')
    .onChange(applyDebugKeyLightShadow)
  guiAdd(folder, debugFlags, 'plateCastShadow')
    .name('Plates cast shadow')
    .onChange(() => requestRender())
  guiAdd(folder, debugFlags, 'keyLightShadowBias', -0.01, 0.001, 0.0001)
    .name('Key shadow bias')
    .onChange(applyDebugShadowBias)

  const spawnFolder = $.gui.addFolder('Spawn Range')
  guiAdd(spawnFolder, debugFlags, 'showSpawnRange')
    .name('Show range')
    .onChange(drawSpawnRange)
  guiAdd(spawnFolder, spawnRangeSettings, 'heightAbove', 2, 30, 0.5)
    .name('Height above')
    .onChange(drawSpawnRange)
  guiAdd(spawnFolder, spawnRangeSettings, 'jitterX', 0, 8, 0.1)
    .name('Jitter X')
    .onChange(drawSpawnRange)
  guiAdd(spawnFolder, spawnRangeSettings, 'jitterY', 0, 8, 0.1)
    .name('Jitter Y')
    .onChange(drawSpawnRange)
  guiAdd(spawnFolder, spawnRangeSettings, 'jitterZ', 0, 8, 0.1)
    .name('Jitter Z')
    .onChange(drawSpawnRange)
}
