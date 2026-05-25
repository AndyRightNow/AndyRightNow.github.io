import * as THREE from 'three'
import { scene } from './scene'
import { $ } from './state'
import { requestRender } from './loop'
import { debugLog } from '../debug'

const STORAGE_KEY = 'scroll-hint-dismissed'
const SHOW_DELAY_MS = 1000
const CANVAS_SIZE = 512

let hintMesh: THREE.Mesh | null = null
let hintTexture: THREE.CanvasTexture | null = null
let hintCanvas: HTMLCanvasElement | null = null
let showTimer: number | null = null
let visible = false
let opacity = 0
let arrowPhase = 0
let pollCount = 0

function createCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  hintCanvas = canvas
  debugLog('[scroll-hint] canvas created', () => ({
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  }))
  return canvas
}

function drawCanvas() {
  if (!hintCanvas) return
  const ctx = hintCanvas.getContext('2d')!
  const w = hintCanvas.width
  const h = hintCanvas.height

  ctx.clearRect(0, 0, w, h)

  ctx.font = '600 56px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.fillText('Scroll', w / 2, h * 0.32)

  const arrowBaseY = h * 0.32 + 60
  const arrowBounce = Math.sin(arrowPhase) * 8
  const arrowY = arrowBaseY + arrowBounce

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  drawArrow(ctx, w / 2, arrowY)
}

function drawArrow(ctx: CanvasRenderingContext2D, cx: number, arrowY: number) {
  ctx.beginPath()
  ctx.moveTo(cx, arrowY - 14)
  ctx.lineTo(cx, arrowY + 14)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx - 10, arrowY + 4)
  ctx.lineTo(cx, arrowY + 16)
  ctx.lineTo(cx + 10, arrowY + 4)
  ctx.stroke()
}

function createMesh() {
  debugLog('[scroll-hint] creating ground decal...')
  createCanvas()
  drawCanvas()

  hintTexture = new THREE.CanvasTexture(hintCanvas!)
  hintTexture.minFilter = THREE.LinearFilter
  hintTexture.magFilter = THREE.LinearFilter
  hintTexture.colorSpace = THREE.SRGBColorSpace

  debugLog(
    '[scroll-hint] texture created',
    hintCanvas!.width,
    'x',
    hintCanvas!.height,
  )

  const material = new THREE.MeshBasicMaterial({
    map: hintTexture,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
  })

  const geo = new THREE.PlaneGeometry(3.2, 3.2)
  hintMesh = new THREE.Mesh(geo, material)
  hintMesh.rotation.x = -Math.PI / 2
  hintMesh.position.set(0, 0.02, 2.5)
  hintMesh.renderOrder = 1

  scene.add(hintMesh)

  debugLog('[scroll-hint] mesh added to scene', () => ({
    position: {
      x: hintMesh!.position.x,
      y: hintMesh!.position.y,
      z: hintMesh!.position.z,
    },
    scale: {
      x: hintMesh!.scale.x,
      y: hintMesh!.scale.y,
    },
    renderOrder: hintMesh!.renderOrder,
    visible: hintMesh!.visible,
    sceneChildren: scene.children.length,
  }))
}

function show() {
  debugLog('[scroll-hint] show() called')
  if (!hintMesh) {
    debugLog('[scroll-hint] no mesh yet, creating')
    createMesh()
  }

  visible = true
  requestRender()
  debugLog('[scroll-hint] visible set to true, requesting render')
}

export function setupScrollHint() {
  debugLog('[scroll-hint] setupScrollHint called', () => ({
    storageDismissed: window.sessionStorage.getItem(STORAGE_KEY),
    startupDone: $.startupAnimationDone,
  }))

  if (window.sessionStorage.getItem(STORAGE_KEY)) {
    debugLog('[scroll-hint] user already scrolled this session, skipping')
    return
  }

  const checkAndSchedule = () => {
    pollCount++
    if (pollCount <= 5 || pollCount % 30 === 0) {
      debugLog('[scroll-hint] polling startup', () => ({
        pollCount,
        startupDone: $.startupAnimationDone,
      }))
    }

    if ($.startupAnimationDone) {
      debugLog('[scroll-hint] startup done, scheduling in', SHOW_DELAY_MS, 'ms')
      showTimer = window.setTimeout(() => {
        debugLog('[scroll-hint] timer fired, calling show()')
        show()
      }, SHOW_DELAY_MS)
    } else {
      window.requestAnimationFrame(checkAndSchedule)
    }
  }
  checkAndSchedule()
}

export function dismissScrollHint() {
  if (!visible) return

  debugLog('[scroll-hint] dismissScrollHint called', () => ({
    visible,
    hasMesh: !!hintMesh,
    hasTimer: showTimer !== null,
  }))

  visible = false
  window.sessionStorage.setItem(STORAGE_KEY, '1')
  if (showTimer) {
    window.clearTimeout(showTimer)
    showTimer = null
  }
  debugLog('[scroll-hint] dismissing, sessionStorage set')
  requestRender()
}

export function updateScrollHint(dt: number) {
  if (!hintMesh || !hintTexture) return

  const target = visible ? 1 : 0
  const speed = 3

  if (opacity < target) {
    opacity = Math.min(opacity + speed * dt, target)
  } else if (opacity > target) {
    opacity = Math.max(opacity - speed * dt, target)
  }

  const mat = hintMesh.material as THREE.MeshBasicMaterial
  mat.opacity = opacity

  if (opacity <= 0 && !visible) {
    debugLog('[scroll-hint] fully faded out, removing mesh')
    scene.remove(hintMesh)
    mat.dispose()
    hintTexture.dispose()
    hintMesh = null
    hintTexture = null
    hintCanvas = null
    return
  }

  if (opacity > 0) {
    arrowPhase += dt * 4
    drawCanvas()
    hintTexture.needsUpdate = true
    requestRender()
  }
}
