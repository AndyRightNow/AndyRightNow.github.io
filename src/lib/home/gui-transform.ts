import Stats from 'stats.js'
import { sceneSettings } from './settings'
import { $ } from './state'
import { scene, camera, renderer, nameGroup } from './scene'
import {
  syncTransformSettingsFromObject,
  updateTextTransform,
  updateTransformControls,
} from './updaters'
import { guiAdd } from './gui'

export function setupFpsCounter() {
  $.statsPanel = new Stats()
  $.statsPanel.showPanel(0)
  document.body.appendChild($.statsPanel.dom)
}

export async function setupTransformControls(TransformControls: any) {
  setupFpsCounter()

  $.transformControls = new TransformControls(camera, renderer.domElement)
  $.transformControls.attach(nameGroup)
  scene.add($.transformControls.getHelper())
  $.transformControls.addEventListener(
    'objectChange',
    syncTransformSettingsFromObject,
  )
  updateTransformControls()

  const transformFolder = $.gui.addFolder('Text transform')
  guiAdd(transformFolder, sceneSettings, 'transformControlsEnabled')
    .name('Enabled')
    .onChange(updateTransformControls)
  guiAdd(transformFolder, sceneSettings, 'transformControlsMode', [
    'translate',
    'rotate',
    'scale',
  ])
    .name('Mode')
    .onChange(updateTransformControls)
  guiAdd(transformFolder, sceneSettings, 'transformControlsSpace', [
    'world',
    'local',
  ])
    .name('Space')
    .onChange(updateTransformControls)
  guiAdd(
    transformFolder,
    sceneSettings,
    'transformControlsSize',
    0.25,
    2,
    0.01,
  )
    .name('Gizmo size')
    .onChange(updateTransformControls)
  guiAdd(transformFolder, sceneSettings, 'transformControlsShowX')
    .name('Show X')
    .onChange(updateTransformControls)
  guiAdd(transformFolder, sceneSettings, 'transformControlsShowY')
    .name('Show Y')
    .onChange(updateTransformControls)
  guiAdd(transformFolder, sceneSettings, 'transformControlsShowZ')
    .name('Show Z')
    .onChange(updateTransformControls)

  $.transformGuiControllers.push(
    guiAdd(transformFolder, sceneSettings, 'textPositionX', -8, 8, 0.01)
      .name('Position X')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    guiAdd(transformFolder, sceneSettings, 'textPositionY', -2, 4, 0.01)
      .name('Position Y')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    guiAdd(transformFolder, sceneSettings, 'textPositionZ', -8, 8, 0.01)
      .name('Position Z')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    guiAdd(
      transformFolder,
      sceneSettings,
      'textRotationX',
      -Math.PI,
      Math.PI,
      0.01,
    )
      .name('Rotation X')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    guiAdd(
      transformFolder,
      sceneSettings,
      'textRotationY',
      -Math.PI,
      Math.PI,
      0.01,
    )
      .name('Rotation Y')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    guiAdd(
      transformFolder,
      sceneSettings,
      'textRotationZ',
      -Math.PI,
      Math.PI,
      0.01,
    )
      .name('Rotation Z')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    guiAdd(transformFolder, sceneSettings, 'textScale', 0.2, 3, 0.01)
      .name('Scale')
      .onChange(updateTextTransform),
  )
}
