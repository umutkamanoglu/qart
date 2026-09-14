# QArt - Modern QR Code Generator

Highly customizable, modern QR code generator with advanced styling capabilities.

## Features

- 🎨 **Advanced Styling** - Gradients, patterns, custom shapes
- 🔧 **Highly Configurable** - Every aspect customizable
- 📱 **Multiple Outputs** - SVG, Canvas, PNG, JPEG, WebP
- ⚡ **Lightweight** - Zero dependencies (except QR core)
- 📦 **Tree-shakable** - ESM + UMD builds
- 🏷️ **TypeScript** - Full type definitions included

## Installation

```bash
npm install qart
```

## Quick Start

```typescript
import { QArt } from 'qart';

const qr = new QArt({
  data: 'https://example.com',
  width: 300,
  height: 300,
  dotsOptions: {
    type: 'rounded',
    color: '#1a1a2e',
    gradient: {
      type: 'linear',
      rotation: Math.PI / 4,
      colorStops: [
        { offset: 0, color: '#667eea' },
        { offset: 1, color: '#764ba2' }
      ]
    }
  },
  backgroundOptions: {
    color: '#ffffff',
    gradient: {
      type: 'radial',
      colorStops: [
        { offset: 0, color: '#f8f9fa' },
        { offset: 1, color: '#e9ecef' }
      ]
    }
  },
  cornersSquareOptions: {
    type: 'rounded',
    color: '#1a1a2e'
  },
  cornersDotOptions: {
    type: 'circle',
    color: '#667eea'
  },
  imageOptions: {
    src: 'logo.png',
    margin: 20,
    crossOrigin: 'anonymous'
  }
});

// Append to DOM
qr.append(document.getElementById('container'));

// Or get raw data
const svg = await qr.getRawData('svg');
const png = await qr.getRawData('png');
```

## API

### Constructor

```typescript
new QArt(options: QArtOptions)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `string` | - | Data to encode (required) |
| `width` | `number` | `300` | Width in pixels |
| `height` | `number` | `300` | Height in pixels |
| `type` | `'canvas' \| 'svg'` | `'canvas'` | Render type |
| `margin` | `number` | `10` | Quiet zone margin |
| `qrOptions` | `QROptions` | `{}` | QR code generation options |
| `dotsOptions` | `DotOptions` | `{}` | Data dot styling |
| `cornersSquareOptions` | `CornerOptions` | `{}` | Finder pattern styling |
| `cornersDotOptions` | `CornerDotOptions` | `{}` | Finder pattern dot styling |
| `backgroundOptions` | `BackgroundOptions` | `{}` | Background styling |
| `imageOptions` | `ImageOptions` | `{}` | Center image/logo options |
| `frameOptions` | `FrameOptions` | `{}` | Frame/border options |
| `eyeOptions` | `EyeOptions` | `{}` | Eye/frame styling |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `append(element: HTMLElement)` | `void` | Append QR code to DOM element |
| `getRawData(type: 'svg' \| 'png' \| 'jpeg' \| 'webp')` | `Promise<string \| Blob>` | Get raw image data |
| `download(options: DownloadOptions)` | `Promise<void>` | Download QR code |
| `toDataURL(type: string, quality?: number)` | `Promise<string>` | Get data URL |
| `update(options: Partial<QArtOptions>)` | `void` | Update options and re-render |

## Styling Options

### Dot Types
- `'square'` - Classic square dots
- `'rounded'` - Rounded rectangles
- `'dots'` - Circular dots
- `'classy'` - Classy rounded shape
- `'classy-rounded'` - Extra rounded classy
- `'extra-rounded'` - Very rounded
- `'custom'` - Custom path function

### Gradient Types
- `'linear'` - Linear gradient
- `'radial'` - Radial gradient
- `'conic'` - Conic gradient

### Corner Types
- `'square'` - Square corners
- `'rounded'` - Rounded corners
- `'circle'` - Circular corners
- `'dot'` - Dot style
- `'custom'` - Custom path function

## License

MIT