import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json'
import { sections } from './content-config'
import { sceneSettings } from './settings'
import { $ } from './state'
import { loadingManager, scene, nameGroup, nameMaterial } from './scene'
import { addCustomPhysicsBody } from './physics'
import { debugLog } from '../debug'

interface GlyphConfig {
  char: string
  spaceWidth: number
  glyphGap: number
  size: number
  depth: number
  curveSegments: number
  bevelThickness: number
  bevelSize: number
  bevelSegments: number
  mass: number
  restitution: number
}

const GLYPH_DEFAULTS: GlyphConfig = {
  char: '?',
  spaceWidth: 0.52,
  glyphGap: 0.08,
  size: 1.02,
  depth: 0.24,
  curveSegments: 32,
  bevelThickness: 0.018,
  bevelSize: 0.012,
  bevelSegments: 8,
  mass: 0.8,
  restitution: 0.22,
}

function buildTextGroup(
  title: string,
  font: any,
  group: THREE.Group,
  material: THREE.Material,
  cfg: GlyphConfig = GLYPH_DEFAULTS,
): THREE.Mesh[] {
  const glyphMeshes: THREE.Mesh[] = []
  let cursorX = 0

  for (const glyph of title) {
    if (glyph === ' ') {
      cursorX += cfg.spaceWidth
      continue
    }

    const textGeometry = new TextGeometry(glyph, {
      font,
      size: cfg.size,
      depth: cfg.depth,
      curveSegments: cfg.curveSegments,
      bevelEnabled: true,
      bevelThickness: cfg.bevelThickness,
      bevelSize: cfg.bevelSize,
      bevelSegments: cfg.bevelSegments,
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

    const glyphMesh = new THREE.Mesh(textGeometry, material)
    glyphMesh.castShadow = sceneSettings.textCastsShadow
    glyphMesh.receiveShadow = false
    glyphMesh.position.set(cursorX, -textGeometry.boundingBox.min.y, 0)
    glyphMesh.userData.physics = { mass: cfg.mass, restitution: cfg.restitution }
    group.add(glyphMesh)
    glyphMeshes.push(glyphMesh)
    $.physicsMeshes.push(glyphMesh)

    cursorX += textGeometry.boundingBox.max.x + cfg.glyphGap
  }

  const groupBounds = new THREE.Box3().setFromObject(group)
  const centerX = (groupBounds.min.x + groupBounds.max.x) / 2
  for (const m of glyphMeshes) {
    m.position.x -= centerX
  }

  if ($.physics) {
    for (const m of glyphMeshes) {
      addCustomPhysicsBody(m, cfg.mass, cfg.restitution)
    }
  }

  debugLog('[text] built group', () => ({
    title,
    glyphCount: glyphMeshes.length,
    groupX: +group.position.x.toFixed(3),
    groupZ: +group.position.z.toFixed(3),
  }))

  return glyphMeshes
}

export function loadNameText() {
  loadingManager.itemStart('name-text')
  debugLog('[text] loading started')

  window.requestAnimationFrame(() => {
    const font = new FontLoader(loadingManager).parse(helvetikerBold)

    for (const section of sections) {
      const group = section.id === 'name' ? nameGroup : new THREE.Group()

      if (group !== nameGroup) {
        group.position.set(
          sceneSettings.textPositionX,
          sceneSettings.textPositionY,
          section.zPosition,
        )
        scene.add(group)
      }

      buildTextGroup(section.title, font, group, nameMaterial)
    }

    $.nameMesh = nameGroup
    loadingManager.itemEnd('name-text')
    debugLog('[text] loading complete')
  })
}
