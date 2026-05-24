import { sceneSettings, initialSceneSettings } from './settings'
import { $ } from './state'
import { updateSceneColors, updateMaterials, updateLighting, updateScrollMotion, updateBackground } from './updaters'
import { resize } from './events'

async function copySceneSettings() {
  const changedSettings = Object.fromEntries(
    Object.entries(sceneSettings)
      .filter(([key, value]) => (initialSceneSettings as any)[key] !== value)
      .map(([key, value]) => [
        key,
        typeof value === 'number' ? Number(value.toFixed(4)) : value,
      ]),
  )

  await navigator.clipboard.writeText(
    JSON.stringify(changedSettings, null, 2),
  )
}

const onLightChange = () =>
  updateLighting($.hemisphereLight!, $.keyLight!, $.fillLight!, $.accentLight!, $.overheadSpotLight!)

export async function setupGuiControls() {
  const { default: GUI } = await import('lil-gui')
  const { TransformControls } = await import('three/examples/jsm/controls/TransformControls.js')

  $.gui = new GUI({ title: 'Scene controls' })

  const sceneFolder = $.gui.addFolder('Scene')
  sceneFolder.addColor(sceneSettings, 'roomColor').name('Room').onChange(updateSceneColors)
  sceneFolder.add(sceneSettings, 'toneMappingExposure', 0.1, 2.5, 0.01).name('Exposure').onChange(onLightChange)

  addMaterialsGui()
  addBackgroundGui()
  addCameraGui()
  addPhysicsGui()
  addLightingGui()

  $.gui.add({ copy: copySceneSettings }, 'copy').name('Copy values')

  return { TransformControls }
}

function addMaterialsGui() {
  const folder = $.gui.addFolder('Materials')
  addPhysicalMaterialControls(folder, 'Floor', 'floor', updateSceneColors)
  folder.add(sceneSettings, 'floorReceivesShadow').name('Floor receives shadow').onChange(updateMaterials)
  addPhysicalMaterialControls(folder, 'Text', 'text', updateSceneColors)
  folder.add(sceneSettings, 'textCastsShadow').name('Text casts shadow').onChange(updateMaterials)
}

function addBackgroundGui() {
  const folder = $.gui.addFolder('CSS background')
  folder.addColor(sceneSettings, 'backgroundHighlightColor').name('Highlight').onChange(updateBackground)
  folder.addColor(sceneSettings, 'backgroundAccentColor').name('Accent').onChange(updateBackground)
  folder.addColor(sceneSettings, 'backgroundShadowColor').name('Shadow').onChange(updateBackground)
}

function addCameraGui() {
  const folder = $.gui.addFolder('Camera')
  folder.add(sceneSettings, 'cameraViewSizeDesktop', 5, 16, 0.1).name('Desktop size').onChange(resize)
  folder.add(sceneSettings, 'cameraViewSizeMobile', 5, 18, 0.1).name('Mobile size').onChange(resize)
  folder
    .add(sceneSettings, 'scrollForwardOffset', sceneSettings.scrollForwardMin, sceneSettings.scrollForwardMax, 0.01)
    .name('Scroll offset')
    .onChange(() => updateScrollMotion($.overheadSpotLight!, $.overheadSpotTarget!))
}

function addPhysicsGui() {
  const folder = $.gui.addFolder('Physics')
  folder.add(sceneSettings, 'clickImpulseStrength', 0, 8, 0.05).name('Click impulse')
}

function addLightingGui() {
  const ambient = $.gui.addFolder('Ambient')
  ambient.addColor(sceneSettings, 'hemisphereSkyColor').name('Sky').onChange(onLightChange)
  ambient.addColor(sceneSettings, 'hemisphereGroundColor').name('Ground').onChange(onLightChange)
  ambient.add(sceneSettings, 'hemisphereIntensity', 0, 4, 0.01).name('Intensity').onChange(onLightChange)

  const key = $.gui.addFolder('Key')
  key.addColor(sceneSettings, 'keyColor').name('Color').onChange(onLightChange)
  key.add(sceneSettings, 'keyIntensity', 0, 4, 0.01).name('Intensity').onChange(onLightChange)

  const fill = $.gui.addFolder('Fill')
  fill.addColor(sceneSettings, 'fillColor').name('Color').onChange(onLightChange)
  fill.add(sceneSettings, 'fillIntensity', 0, 4, 0.01).name('Intensity').onChange(onLightChange)

  const spot = $.gui.addFolder('Spot')
  spot.addColor(sceneSettings, 'spotColor').name('Color').onChange(onLightChange)
  spot.add(sceneSettings, 'spotIntensity', 0, 24, 0.1).name('Intensity').onChange(onLightChange)
  spot.add(sceneSettings, 'spotDistance', 1, 60, 0.5).name('Distance').onChange(onLightChange)
  spot.add(sceneSettings, 'spotAngle', 0.05, Math.PI / 2, 0.01).name('Angle').onChange(onLightChange)
  spot.add(sceneSettings, 'spotPenumbra', 0, 1, 0.01).name('Penumbra').onChange(onLightChange)
  spot.add(sceneSettings, 'spotDecay', 0, 3, 0.01).name('Decay').onChange(onLightChange)

  const accent = $.gui.addFolder('Accent')
  accent.addColor(sceneSettings, 'accentColor').name('Color').onChange(onLightChange)
  accent.add(sceneSettings, 'accentIntensity', 0, 20, 0.1).name('Intensity').onChange(onLightChange)
  accent.add(sceneSettings, 'accentDistance', 1, 60, 0.5).name('Distance').onChange(onLightChange)
}

function addPhysicalMaterialControls(
  folder: any,
  label: string,
  prefix: string,
  updateColor: () => void,
) {
  const f = folder.addFolder(label)
  f.addColor(sceneSettings, `${prefix}Color`).name('Color').onChange(updateColor)
  f.add(sceneSettings, `${prefix}Opacity`, 0, 1, 0.01).name('Opacity').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Roughness`, 0, 1, 0.01).name('Roughness').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Metalness`, 0, 1, 0.01).name('Metalness').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Clearcoat`, 0, 1, 0.01).name('Clearcoat').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}ClearcoatRoughness`, 0, 1, 0.01).name('Clearcoat roughness').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Reflectivity`, 0, 1, 0.01).name('Reflectivity').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Ior`, 1, 2.333, 0.001).name('IOR').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Transmission`, 0, 1, 0.01).name('Transmission').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Thickness`, 0, 5, 0.01).name('Thickness').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Sheen`, 0, 1, 0.01).name('Sheen').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}SheenRoughness`, 0, 1, 0.01).name('Sheen roughness').onChange(updateMaterials)
  f.addColor(sceneSettings, `${prefix}SheenColor`).name('Sheen color').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}SpecularIntensity`, 0, 2, 0.01).name('Specular intensity').onChange(updateMaterials)
  f.addColor(sceneSettings, `${prefix}SpecularColor`).name('Specular color').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Iridescence`, 0, 1, 0.01).name('Iridescence').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}IridescenceIOR`, 1, 2.333, 0.001).name('Iridescence IOR').onChange(updateMaterials)
  f.add(sceneSettings, `${prefix}Wireframe`).name('Wireframe').onChange(updateMaterials)
}
