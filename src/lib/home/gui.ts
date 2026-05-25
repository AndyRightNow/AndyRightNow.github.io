import { sceneSettings, initialSceneSettings } from './settings'
import { $ } from './state'
import {
  updateSceneColors,
  updateMaterials,
  updateLighting,
  updateScrollMotion,
  updateBackground,
} from './updaters'
import { resize } from './events'
import { setColliderDebugVisible } from './physics'
import { addDebugGuiControls } from './debug-panel'
import { requestRender } from './loop'

interface GuiApi {
  name(n: string): GuiApi
  onChange(fn: (v?: any) => void): GuiApi
}

function guiAdd(
  folder: any,
  obj: any,
  prop: string,
  ...args: any[]
): GuiApi {
  const c = folder.add(obj, prop, ...args)
  const api: GuiApi = {
    name(n: string) {
      c.name(n)
      return api
    },
    onChange(fn: (v?: any) => void) {
      c.onChange((v: any) => {
        requestRender()
        fn(v)
      })
      return api
    },
  }
  return api
}

function guiAddColor(folder: any, obj: any, prop: string): GuiApi {
  const c = folder.addColor(obj, prop)
  const api: GuiApi = {
    name(n: string) {
      c.name(n)
      return api
    },
    onChange(fn: (v?: any) => void) {
      c.onChange((v: any) => {
        requestRender()
        fn(v)
      })
      return api
    },
  }
  return api
}

export { guiAdd, guiAddColor }

async function copySceneSettings() {
  const changedSettings = Object.fromEntries(
    Object.entries(sceneSettings)
      .filter(([key, value]) => (initialSceneSettings as any)[key] !== value)
      .map(([key, value]) => [
        key,
        typeof value === 'number' ? Number(value.toFixed(4)) : value,
      ]),
  )

  await navigator.clipboard.writeText(JSON.stringify(changedSettings, null, 2))
}

const onLightChange = () =>
  updateLighting(
    $.hemisphereLight!,
    $.keyLight!,
    $.fillLight!,
    $.accentLight!,
    $.overheadSpotLight!,
  )

export async function setupGuiControls() {
  const { default: GUI } = await import('lil-gui')

  $.gui = new GUI({ title: 'Scene controls', closeFolders: true })
  $.gui.close()

  const sceneFolder = $.gui.addFolder('Scene')
  guiAddColor(sceneFolder, sceneSettings, 'roomColor')
    .name('Room')
    .onChange(updateSceneColors)
  guiAdd(sceneFolder, sceneSettings, 'toneMappingExposure', 0.1, 2.5, 0.01)
    .name('Exposure')
    .onChange(onLightChange)

  addMaterialsGui()
  addBackgroundGui()
  addCameraGui()
  addPhysicsGui()
  addLightingGui()

  addDebugGuiControls()

  guiAdd($.gui, { copy: copySceneSettings }, 'copy').name('Copy values')
}

function addMaterialsGui() {
  const folder = $.gui.addFolder('Materials')
  addPhysicalMaterialControls(folder, 'Floor', 'floor', updateSceneColors)
  guiAdd(folder, sceneSettings, 'floorReceivesShadow')
    .name('Floor receives shadow')
    .onChange(updateMaterials)
  addPhysicalMaterialControls(folder, 'Text', 'text', updateSceneColors)
  guiAdd(folder, sceneSettings, 'textCastsShadow')
    .name('Text casts shadow')
    .onChange(updateMaterials)
}

function addBackgroundGui() {
  const folder = $.gui.addFolder('CSS background')
  guiAddColor(folder, sceneSettings, 'backgroundHighlightColor')
    .name('Highlight')
    .onChange(updateBackground)
  guiAddColor(folder, sceneSettings, 'backgroundAccentColor')
    .name('Accent')
    .onChange(updateBackground)
  guiAddColor(folder, sceneSettings, 'backgroundShadowColor')
    .name('Shadow')
    .onChange(updateBackground)
}

function addCameraGui() {
  const folder = $.gui.addFolder('Camera')
  guiAdd(folder, sceneSettings, 'cameraViewSizeDesktop', 5, 16, 0.1)
    .name('Desktop size')
    .onChange(resize)
  guiAdd(folder, sceneSettings, 'cameraViewSizeMobile', 5, 18, 0.1)
    .name('Mobile size')
    .onChange(resize)
  guiAdd(
    folder,
    sceneSettings,
    'scrollForwardOffset',
    sceneSettings.scrollForwardMin,
    sceneSettings.scrollForwardMax,
    0.01,
  )
    .name('Scroll offset')
    .onChange(() =>
      updateScrollMotion($.keyLight!, $.keyLightTarget!, $.overheadSpotLight!, $.overheadSpotTarget!),
    )
}

function addPhysicsGui() {
  const folder = $.gui.addFolder('Physics')
  guiAdd(folder, sceneSettings, 'clickImpulseStrength', 0, 8, 0.05)
    .name('Click impulse')
  guiAdd(folder, sceneSettings, 'showColliderDebug')
    .name('Collider debug')
    .onChange((value: boolean) => setColliderDebugVisible(value))
}

function addLightingGui() {
  const ambient = $.gui.addFolder('Ambient')
  guiAddColor(ambient, sceneSettings, 'hemisphereSkyColor')
    .name('Sky')
    .onChange(onLightChange)
  guiAddColor(ambient, sceneSettings, 'hemisphereGroundColor')
    .name('Ground')
    .onChange(onLightChange)
  guiAdd(ambient, sceneSettings, 'hemisphereIntensity', 0, 4, 0.01)
    .name('Intensity')
    .onChange(onLightChange)

  const key = $.gui.addFolder('Key')
  guiAddColor(key, sceneSettings, 'keyColor').name('Color').onChange(onLightChange)
  guiAdd(key, sceneSettings, 'keyIntensity', 0, 4, 0.01)
    .name('Intensity')
    .onChange(onLightChange)

  const fill = $.gui.addFolder('Fill')
  guiAddColor(fill, sceneSettings, 'fillColor')
    .name('Color')
    .onChange(onLightChange)
  guiAdd(fill, sceneSettings, 'fillIntensity', 0, 4, 0.01)
    .name('Intensity')
    .onChange(onLightChange)

  const spot = $.gui.addFolder('Spot')
  guiAddColor(spot, sceneSettings, 'spotColor')
    .name('Color')
    .onChange(onLightChange)
  guiAdd(spot, sceneSettings, 'spotIntensity', 0, 24, 0.1)
    .name('Intensity')
    .onChange(onLightChange)
  guiAdd(spot, sceneSettings, 'spotDistance', 1, 60, 0.5)
    .name('Distance')
    .onChange(onLightChange)
  guiAdd(spot, sceneSettings, 'spotAngle', 0.05, Math.PI / 2, 0.01)
    .name('Angle')
    .onChange(onLightChange)
  guiAdd(spot, sceneSettings, 'spotPenumbra', 0, 1, 0.01)
    .name('Penumbra')
    .onChange(onLightChange)
  guiAdd(spot, sceneSettings, 'spotDecay', 0, 3, 0.01)
    .name('Decay')
    .onChange(onLightChange)

  const accent = $.gui.addFolder('Accent')
  guiAddColor(accent, sceneSettings, 'accentColor')
    .name('Color')
    .onChange(onLightChange)
  guiAdd(accent, sceneSettings, 'accentIntensity', 0, 20, 0.1)
    .name('Intensity')
    .onChange(onLightChange)
  guiAdd(accent, sceneSettings, 'accentDistance', 1, 60, 0.5)
    .name('Distance')
    .onChange(onLightChange)
}

function addPhysicalMaterialControls(
  folder: any,
  label: string,
  prefix: string,
  updateColor: () => void,
) {
  const f = folder.addFolder(label)
  guiAddColor(f, sceneSettings, `${prefix}Color`)
    .name('Color')
    .onChange(updateColor)
  guiAdd(f, sceneSettings, `${prefix}Opacity`, 0, 1, 0.01)
    .name('Opacity')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Roughness`, 0, 1, 0.01)
    .name('Roughness')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Metalness`, 0, 1, 0.01)
    .name('Metalness')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Clearcoat`, 0, 1, 0.01)
    .name('Clearcoat')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}ClearcoatRoughness`, 0, 1, 0.01)
    .name('Clearcoat roughness')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Reflectivity`, 0, 1, 0.01)
    .name('Reflectivity')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Ior`, 1, 2.333, 0.001)
    .name('IOR')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Transmission`, 0, 1, 0.01)
    .name('Transmission')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Thickness`, 0, 5, 0.01)
    .name('Thickness')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Sheen`, 0, 1, 0.01)
    .name('Sheen')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}SheenRoughness`, 0, 1, 0.01)
    .name('Sheen roughness')
    .onChange(updateMaterials)
  guiAddColor(f, sceneSettings, `${prefix}SheenColor`)
    .name('Sheen color')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}SpecularIntensity`, 0, 2, 0.01)
    .name('Specular intensity')
    .onChange(updateMaterials)
  guiAddColor(f, sceneSettings, `${prefix}SpecularColor`)
    .name('Specular color')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Iridescence`, 0, 1, 0.01)
    .name('Iridescence')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}IridescenceIOR`, 1, 2.333, 0.001)
    .name('Iridescence IOR')
    .onChange(updateMaterials)
  guiAdd(f, sceneSettings, `${prefix}Wireframe`)
    .name('Wireframe')
    .onChange(updateMaterials)
}
