import { $ } from './state'
import { setupLoadingCallbacks } from './loading'
import { loadNameText } from './text'
import { setupPhysics } from './physics'
import { createHemisphereLight, createKeyLight, createFillLight, createAccentLight, createSpotLight } from './lights'
import { updateSceneColors, updateLighting, updateMaterials, updateTextTransform } from './updaters'
import { resize, handleWheel, handlePointerDown } from './events'
import { requestRender } from './loop'
import { debugLog } from '../debug'

debugLog('[init] starting')

setupLoadingCallbacks()

createHemisphereLight()
createKeyLight()
createFillLight()
createAccentLight()
createSpotLight()
debugLog('[init] lights created')

updateSceneColors()
updateLighting($.hemisphereLight!, $.keyLight!, $.fillLight!, $.accentLight!, $.overheadSpotLight!)
updateMaterials()
updateTextTransform()
debugLog('[init] initial updates applied')

loadNameText()
setupPhysics()
debugLog('[init] async loading started (text + physics)')

if (import.meta.env.DEV) {
  Promise.all([
    import('./gui'),
    import('./gui-transform'),
  ]).then(([guiMod, transformMod]) => {
    guiMod.setupGuiControls().then(({ TransformControls }) => {
      transformMod.setupTransformControls(TransformControls)
    })
  })
}

resize()
requestRender()

window.addEventListener('resize', resize)
window.addEventListener('wheel', handleWheel, { passive: false })
window.addEventListener('pointerdown', handlePointerDown)
