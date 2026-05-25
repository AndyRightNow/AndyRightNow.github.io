# Build

Always use `yarn build` instead of `npx`.

# GUI controls

When adding a new control to the lil-gui panel, always use the `guiAdd` or `guiAddColor` wrappers instead of calling `folder.add` or `folder.addColor` directly. These wrappers automatically call `requestRender()` on every value change, so the scene re-renders without each handler needing to remember.

```ts
import { guiAdd, guiAddColor } from './gui'

// Number slider
guiAdd(folder, obj, 'prop', min, max, step)
  .name('Label')
  .onChange(myHandler)

// Boolean checkbox
guiAdd(folder, obj, 'prop')
  .name('Label')
  .onChange(myHandler)

// Dropdown
guiAdd(folder, obj, 'prop', ['a', 'b', 'c'])
  .name('Label')
  .onChange(myHandler)

// Color picker
guiAddColor(folder, obj, 'prop')
  .name('Label')
  .onChange(myHandler)

// Button (function call)
guiAdd(folder, { myFn }, 'myFn').name('Do thing')
```
