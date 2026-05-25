import Stats from 'stats.js'
import { sceneSettings } from './settings'
import { $ } from './state'
import { scene, camera, renderer, nameGroup } from './scene'
import {
  syncTransformSettingsFromObject,
  updateTextTransform,
  updateTransformControls,
} from './updaters'

export async function setupTransformControls(TransformControls: any) {
  $.statsPanel = new Stats()
  $.statsPanel.showPanel(0)
  document.body.appendChild($.statsPanel.dom)

  $.transformControls = new TransformControls(camera, renderer.domElement)
  $.transformControls.attach(nameGroup)
  scene.add($.transformControls.getHelper())
  $.transformControls.addEventListener(
    'objectChange',
    syncTransformSettingsFromObject,
  )
  updateTransformControls()

  const transformFolder = $.gui.addFolder('Text transform')
  transformFolder
    .add(sceneSettings, 'transformControlsEnabled')
    .name('Enabled')
    .onChange(updateTransformControls)
  transformFolder
    .add(sceneSettings, 'transformControlsMode', [
      'translate',
      'rotate',
      'scale',
    ])
    .name('Mode')
    .onChange(updateTransformControls)
  transformFolder
    .add(sceneSettings, 'transformControlsSpace', ['world', 'local'])
    .name('Space')
    .onChange(updateTransformControls)
  transformFolder
    .add(sceneSettings, 'transformControlsSize', 0.25, 2, 0.01)
    .name('Gizmo size')
    .onChange(updateTransformControls)
  transformFolder
    .add(sceneSettings, 'transformControlsShowX')
    .name('Show X')
    .onChange(updateTransformControls)
  transformFolder
    .add(sceneSettings, 'transformControlsShowY')
    .name('Show Y')
    .onChange(updateTransformControls)
  transformFolder
    .add(sceneSettings, 'transformControlsShowZ')
    .name('Show Z')
    .onChange(updateTransformControls)

  $.transformGuiControllers.push(
    transformFolder
      .add(sceneSettings, 'textPositionX', -8, 8, 0.01)
      .name('Position X')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    transformFolder
      .add(sceneSettings, 'textPositionY', -2, 4, 0.01)
      .name('Position Y')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    transformFolder
      .add(sceneSettings, 'textPositionZ', -8, 8, 0.01)
      .name('Position Z')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    transformFolder
      .add(sceneSettings, 'textRotationX', -Math.PI, Math.PI, 0.01)
      .name('Rotation X')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    transformFolder
      .add(sceneSettings, 'textRotationY', -Math.PI, Math.PI, 0.01)
      .name('Rotation Y')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    transformFolder
      .add(sceneSettings, 'textRotationZ', -Math.PI, Math.PI, 0.01)
      .name('Rotation Z')
      .onChange(updateTextTransform),
  )
  $.transformGuiControllers.push(
    transformFolder
      .add(sceneSettings, 'textScale', 0.2, 3, 0.01)
      .name('Scale')
      .onChange(updateTextTransform),
  )
}
