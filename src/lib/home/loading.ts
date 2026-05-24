import { INITIAL_ROOM_LIGHT_SCALE, DIM_ROOM_HOLD_SECONDS } from './settings'
import { $ } from './state'
import { loadingManager, loadingProgress, loadingScreen } from './scene'
import { debugLog } from '../debug'

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

export function setupLoadingCallbacks() {
  loadingManager.onProgress = (_url: string, loaded: number, total: number) => {
    const progress = total > 0 ? loaded / total : 1
    loadingProgress.style.transform = `scaleX(${progress})`
  }

  loadingManager.onLoad = () => {
    loadingProgress.style.transform = 'scaleX(1)'
    $.sceneReady = true
    $.startupStartedAt = performance.now()
    debugLog('[loading] all assets loaded, starting startup animation')
    window.setTimeout(() => {
      loadingScreen.classList.add('is-done')
    }, 220)
  }

  loadingManager.onError = (url: string) => {
    throw new Error(`Failed to load scene asset: ${url}`)
  }
}

export function updateStartupAnimation(elapsedMs: number): void {
  if (!$.sceneReady || $.startupStartedAt === null) {
    $.roomLightScale = INITIAL_ROOM_LIGHT_SCALE
    $.spotLightScale = 0
    return
  }

  const startupElapsed = (elapsedMs - $.startupStartedAt) / 1000
  const sequenceElapsed = Math.max(startupElapsed - DIM_ROOM_HOLD_SECONDS, 0)
  $.roomLightScale =
    INITIAL_ROOM_LIGHT_SCALE +
    easeOutCubic(clamp01(sequenceElapsed / 0.75)) * (1 - INITIAL_ROOM_LIGHT_SCALE)

  if (sequenceElapsed < 1.05) {
    $.spotLightScale = 0
  } else if (sequenceElapsed < 2.05) {
    const flickerElapsed = sequenceElapsed - 1.05
    const flickerPulses: [number, number, number][] = [
      [0.0, 0.16, 0.18],
      [0.28, 0.15, 0.62],
      [0.58, 0.2, 0.34],
      [0.86, 0.14, 0.78],
    ]
    $.spotLightScale = 0.08

    for (const [start, duration, intensity] of flickerPulses) {
      const progress = clamp01((flickerElapsed - start) / duration)

      if (progress > 0 && progress < 1) {
        $.spotLightScale = intensity * Math.sin(progress * Math.PI)
      }
    }
  } else {
    $.spotLightScale = 0.25 + easeOutCubic(clamp01((sequenceElapsed - 2.05) / 0.7)) * 0.75
  }

  if (!$.startupAnimationDone && sequenceElapsed >= 2.75) {
    $.startupAnimationDone = true
  }
}
