import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json'
import { sceneSettings } from './settings'
import { $ } from './state'
import { loadingManager, nameGroup, nameMaterial } from './scene'
import { addCustomPhysicsBody } from './physics'
import { debugLog } from '../debug'

export function loadNameText() {
  loadingManager.itemStart('name-text')
  debugLog('[text] loading started')

  window.requestAnimationFrame(() => {
    const font = new FontLoader(loadingManager).parse(helvetikerBold)
    const glyphMeshes: THREE.Mesh[] = []
    let cursorX = 0

    for (const glyph of 'ANDY ZHOU') {
      if (glyph === ' ') {
        cursorX += 0.52
        continue
      }

      const textGeometry = new TextGeometry(glyph, {
        font,
        size: 1.02,
        depth: 0.24,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: 0.018,
        bevelSize: 0.012,
        bevelSegments: 8,
      })
      textGeometry.computeVertexNormals()
      textGeometry.computeBoundingBox()

      if (!textGeometry.boundingBox) {
        throw new Error(`Glyph geometry bounds were not calculated: ${glyph}`)
      }

      const bounds = textGeometry.boundingBox
      textGeometry.translate(
        -bounds.min.x,
        -bounds.min.y,
        -(bounds.min.z + bounds.max.z) / 2,
      )
      textGeometry.computeBoundingBox()

      if (!textGeometry.boundingBox) {
        throw new Error(`Glyph geometry bounds were not recalculated: ${glyph}`)
      }

      const glyphMesh = new THREE.Mesh(textGeometry, nameMaterial)
      glyphMesh.castShadow = sceneSettings.textCastsShadow
      glyphMesh.receiveShadow = false
      glyphMesh.position.set(cursorX, -textGeometry.boundingBox.min.y, 0)
      glyphMesh.userData.physics = { mass: 0.8, restitution: 0.22 }
      nameGroup.add(glyphMesh)
      glyphMeshes.push(glyphMesh)
      $.physicsMeshes.push(glyphMesh)

      debugLog('[text] glyph', glyph, {
        cursorX: +cursorX.toFixed(4),
        pos: {
          x: +glyphMesh.position.x.toFixed(4),
          y: +glyphMesh.position.y.toFixed(4),
        },
        bboxMin: {
          x: +textGeometry.boundingBox.min.x.toFixed(4),
          y: +textGeometry.boundingBox.min.y.toFixed(4),
          z: +textGeometry.boundingBox.min.z.toFixed(4),
        },
        bboxMax: {
          x: +textGeometry.boundingBox.max.x.toFixed(4),
          y: +textGeometry.boundingBox.max.y.toFixed(4),
          z: +textGeometry.boundingBox.max.z.toFixed(4),
        },
      })

      cursorX += textGeometry.boundingBox.max.x + 0.08
    }

    debugLog(
      '[text]',
      glyphMeshes.length,
      'glyph meshes created, total physicsMeshes:',
      $.physicsMeshes.length,
    )

    const nameBounds = new THREE.Box3().setFromObject(nameGroup)
    const centerX = (nameBounds.min.x + nameBounds.max.x) / 2

    for (const glyphMesh of glyphMeshes) {
      glyphMesh.position.x -= centerX
    }

    if ($.physics) {
      debugLog('[text] physics ready, adding bodies to glyphs')
      for (const glyphMesh of glyphMeshes) {
        addCustomPhysicsBody(glyphMesh, 0.8, 0.22)
      }
    } else {
      debugLog(
        '[text] physics NOT ready yet, bodies will be added by setupPhysics',
      )
    }

    $.nameMesh = nameGroup
    loadingManager.itemEnd('name-text')
    debugLog('[text] loading complete')
  })
}
