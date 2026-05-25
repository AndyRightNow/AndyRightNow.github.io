export interface ContentObjectConfig {
  id: string
  type: 'plate'
  position: { x: number; y: number; z: number }
  spawn?: {
    heightAbove: number
    jitterX: number
    jitterY: number
    jitterZ: number
  }
  plate?: {
    width?: number
    height?: number
    cornerRadius?: number
    thickness?: number
    color: string
  }
}

export const PLATE_DEFAULTS = {
  width: 0.98,
  height: 0.98,
  cornerRadius: 0.14,
  thickness: 0.06,
}

export interface SectionConfig {
  id: string
  title: string
  zPosition: number
  activateAtOffset: number
  contentObjects: ContentObjectConfig[]
}

export const sections: SectionConfig[] = [
  {
    id: 'name',
    title: 'ANDY ZHOU',
    zPosition: 0,
    activateAtOffset: 2,
    contentObjects: [],
  },
  {
    id: 'fullstack',
    title: 'FULLSTACK',
    zPosition: 8,
    activateAtOffset: 4,
    contentObjects: [
      {
        id: 'fs-react',
        type: 'plate',
        position: { x: -1.4, y: 0.5, z: 12 },
        plate: { color: '#61dafb' },
      },
      {
        id: 'fs-node',
        type: 'plate',
        position: { x: 0, y: 0.5, z: 12 },
        plate: { color: '#68a063' },
      },
      {
        id: 'fs-three',
        type: 'plate',
        position: { x: 1.4, y: 0.5, z: 12 },
        plate: { color: '#ee6a2c' },
      },
    ],
  },
  {
    id: 'ai-engineering',
    title: 'AI ENGINEERING',
    zPosition: 16,
    activateAtOffset: 12,
    contentObjects: [
      {
        id: 'ai-agent',
        type: 'plate',
        position: { x: -1.2, y: 0.5, z: 20 },
        plate: { color: '#a259ff' },
      },
      {
        id: 'ai-model',
        type: 'plate',
        position: { x: 0, y: 0.5, z: 20 },
        plate: { color: '#ff6b6b' },
      },
      {
        id: 'ai-pipe',
        type: 'plate',
        position: { x: 1.2, y: 0.5, z: 20 },
        plate: { color: '#4ecdc4' },
      },
    ],
  },
  {
    id: 'gamedev',
    title: 'GAME DEV',
    zPosition: 24,
    activateAtOffset: 20,
    contentObjects: [
      {
        id: 'gd-unity',
        type: 'plate',
        position: { x: -1.2, y: 0.5, z: 28 },
        plate: { color: '#7f7f7f' },
      },
      {
        id: 'gd-shader',
        type: 'plate',
        position: { x: 0, y: 0.5, z: 28 },
        plate: { color: '#b84cff' },
      },
      {
        id: 'gd-three',
        type: 'plate',
        position: { x: 1.2, y: 0.5, z: 28 },
        plate: { color: '#ff9933' },
      },
    ],
  },
]
