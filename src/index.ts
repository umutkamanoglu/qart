import { QRRenderer } from './renderer';
import type { QArtOptions, DownloadOptions, QRElement } from './types';

export class QArt {
  private renderer: QRRenderer;
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private svgElement: SVGElement | null = null;

  constructor(options: QArtOptions) {
    this.renderer = new QRRenderer(options);
  }

  append(element: HTMLElement | string): void {
    const target = typeof element === 'string' ? document.getElementById(element) : element;
    if (!target) {
      throw new Error('Target element not found');
    }
    
    this.container = target;
    const { type = 'canvas' } = this.renderer['options'];
    
    if (type === 'svg') {
      this.svgElement = this.renderer.renderToSVG();
      target.innerHTML = '';
      target.appendChild(this.svgElement);
    } else {
      this.canvas = document.createElement('canvas');
      this.renderer.renderToCanvas(this.canvas);
      target.innerHTML = '';
      target.appendChild(this.canvas);
    }
  }

  async getRawData(type: 'svg' | 'png' | 'jpeg' | 'webp', quality?: number): Promise<string | Blob> {
    return this.renderer.getRawData(type, quality);
  }

  async toDataURL(type: 'png' | 'jpeg' | 'webp' = 'png', quality?: number): Promise<string> {
    const blob = await this.getRawData(type, quality) as Blob;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  async download(options: DownloadOptions = {}): Promise<void> {
    const { name = 'qart', extension = 'png', quality } = options;
    const blob = await this.getRawData(extension, quality) as Blob;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  update(options: Partial<QArtOptions>): void {
    // Re-create renderer with new options
    const currentOptions = this.renderer['options'];
    const newOptions = { ...currentOptions, ...options };
    this.renderer = new QRRenderer(newOptions);
    
    if (this.container) {
      this.append(this.container);
    }
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  getSVG(): SVGElement | null {
    return this.svgElement;
  }

  getMatrix(): QRElement[] {
    return this.renderer['matrix'].getElements();
  }

  getSize(): number {
    return this.renderer['matrix'].size;
  }

  getVersion(): number {
    return this.renderer['matrix'].version;
  }
}

// Factory function
export function createQArt(options: QArtOptions): QArt {
  return new QArt(options);
}

// Export types
export type { 
  QArtOptions, 
  DownloadOptions, 
  QRElement,
  QRCodeOptions,
  DotOptions,
  CornerSquareOptions,
  CornerDotOptions,
  BackgroundOptions,
  ImageOptions,
  FrameOptions,
  EyeOptions,
  GradientOptions,
  GradientStop
} from './types';

export { QRRenderer } from './renderer';
export { QRMatrix } from './qr-matrix';