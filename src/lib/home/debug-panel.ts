import { $ } from './state'
import { guiAdd } from './gui'
import { requestRender } from './loop'

export const debugFlags = {
  keyLightCastShadow: true,
  plateCastShadow: true,
  keyLightShadowBias: -0.0013,
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
}
