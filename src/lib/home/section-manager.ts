import * as THREE from 'three'
import { sections } from './content-config'
import { sceneSettings } from './settings'
import { $ } from './state'
import { createContentObject, addPhysicsToContentObject } from './content-objects'
import { requestRender } from './loop'
import { debugLog } from '../debug'

const activatedSections = new Set<string>()
const spawnedMeshes: THREE.Mesh[] = []

export function checkAndSpawnContentObjects() {
  if (!$.physics) return

  const offset = sceneSettings.scrollForwardOffset

  for (const section of sections) {
    if (activatedSections.has(section.id)) continue
    if (section.contentObjects.length === 0) continue

    if (offset >= section.activateAtOffset) {
      activatedSections.add(section.id)

      debugLog('[section-manager] activating section', () => ({
        sectionId: section.id,
        title: section.title,
        offset,
        activateAt: section.activateAtOffset,
        objectCount: section.contentObjects.length,
      }))

      for (const objConfig of section.contentObjects) {
        const group = createContentObject(objConfig)
        group.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            addPhysicsToContentObject(child as THREE.Mesh)
            spawnedMeshes.push(child as THREE.Mesh)
          }
        })
      }

      debugLog('[section-manager] spawned', () => ({
        sectionId: section.id,
        totalSpawned: spawnedMeshes.length,
      }))

      requestRender()
    }
  }
}

export function resetContentObjects() {
  activatedSections.clear()

  for (const mesh of spawnedMeshes) {
    const idx = $.physicsMeshes.indexOf(mesh)
    if (idx !== -1) $.physicsMeshes.splice(idx, 1)

    if (mesh.parent) mesh.parent.remove(mesh)
    mesh.geometry?.dispose()
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m: THREE.Material) => m.dispose())
    } else {
      mesh.material?.dispose()
    }
  }
  spawnedMeshes.length = 0
}
