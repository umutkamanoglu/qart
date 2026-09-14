import type { 
  QArtOptions, 
  DotOptions, 
  CornerSquareOptions, 
  CornerDotOptions,
  BackgroundOptions,
  ImageOptions,
  FrameOptions,
  EyeOptions,
  GradientOptions,
  QRElement
} from './types';
import { QRMatrix } from './qr-matrix';

export class QRRenderer {
  private options: QArtOptions;
  private matrix: QRMatrix;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private svgElement: SVGElement | null = null;
  private moduleSize: number = 0;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private gradients: Map<string, CanvasGradient> = new Map();

  constructor(options: QArtOptions) {
    this.options = this.normalizeOptions(options);
    this.matrix = new QRMatrix(this.options);
  }

  private normalizeOptions(options: QArtOptions): QArtOptions {
    return {
      width: 300,
      height: 300,
      type: 'canvas',
      margin: 10,
      qrOptions: { errorCorrectionLevel: 'M' },
      dotsOptions: { type: 'square', color: '#000000' },
      cornersSquareOptions: { type: 'square', color: '#000000' },
      cornersDotOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#ffffff' },
      imageOptions: { margin: 10 },
      frameOptions: {},
      eyeOptions: {},
      ...options
    };
  }

  private calculateLayout() {
    const { width, height, margin } = this.options;
    const qrSize = Math.min(width, height) - margin * 2;
    this.moduleSize = qrSize / this.matrix.size;
    this.offsetX = (width - qrSize) / 2;
    this.offsetY = (height - qrSize) / 2;
  }

  private getGradient(ctx: CanvasRenderingContext2D, gradient: GradientOptions, bounds: { x: number, y: number, width: number, height: number }): CanvasGradient {
    const key = JSON.stringify({ ...gradient, bounds });
    if (this.gradients.has(key)) {
      return this.gradients.get(key)!;
    }

    let canvasGradient: CanvasGradient;
    const { x, y, width, height } = bounds;
    const centerX = gradient.centerX !== undefined ? x + gradient.centerX * width : x + width / 2;
    const centerY = gradient.centerY !== undefined ? y + gradient.centerY * height : y + height / 2;
    const radius = gradient.radius !== undefined ? gradient.radius * Math.min(width, height) : Math.min(width, height) / 2;

    switch (gradient.type) {
      case 'linear': {
        const rotation = gradient.rotation || 0;
        const x1 = centerX + Math.cos(rotation) * width / 2;
        const y1 = centerY + Math.sin(rotation) * height / 2;
        const x2 = centerX - Math.cos(rotation) * width / 2;
        const y2 = centerY - Math.sin(rotation) * height / 2;
        canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
        break;
      }
      case 'radial': {
        canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        break;
      }
      case 'conic': {
        canvasGradient = ctx.createConicGradient(gradient.rotation || 0, centerX, centerY);
        break;
      }
      default:
        canvasGradient = ctx.createLinearGradient(x, y, x + width, y + height);
    }

    gradient.colorStops.forEach(stop => {
      canvasGradient.addColorStop(stop.offset, stop.color);
    });

    this.gradients.set(key, canvasGradient);
    return canvasGradient;
  }

  private drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, options: DotOptions, isDark: boolean) {
    if (!isDark) return;
    
    const { type = 'square', color = '#000000', gradient, customPath, scale = 1 } = options;
    const scaledSize = size * scale;
    const offset = (size - scaledSize) / 2;
    const drawX = x + offset;
    const drawY = y + offset;

    ctx.save();
    ctx.translate(drawX + scaledSize / 2, drawY + scaledSize / 2);

    if (gradient) {
      const grad = this.getGradient(ctx, gradient, { x: drawX, y: drawY, width: scaledSize, height: scaledSize });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = color;
    }

    switch (type) {
      case 'square':
        ctx.fillRect(-scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize);
        break;
      case 'rounded':
        this.roundedRect(ctx, -scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize, scaledSize * 0.2);
        ctx.fill();
        break;
      case 'dots':
        ctx.beginPath();
        ctx.arc(0, 0, scaledSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'classy':
        this.classyShape(ctx, scaledSize);
        ctx.fill();
        break;
      case 'classy-rounded':
        this.classyRoundedShape(ctx, scaledSize);
        ctx.fill();
        break;
      case 'extra-rounded':
        this.roundedRect(ctx, -scaledSize / 2, -scaledSize / 2, scaledSize, scaledSize, scaledSize * 0.4);
        ctx.fill();
        break;
      case 'custom':
        if (customPath) {
          ctx.beginPath();
          customPath(ctx, -scaledSize / 2, -scaledSize / 2, scaledSize);
          ctx.fill();
        }
        break;
    }
    ctx.restore();
  }

  private drawCornerSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, options: CornerSquareOptions) {
    const { type = 'square', color = '#000000', gradient, customPath } = options;
    
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    if (gradient) {
      const grad = this.getGradient(ctx, gradient, { x, y, width: size, height: size });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = color;
    }

    switch (type) {
      case 'square':
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case 'rounded':
        this.roundedRect(ctx, -size / 2, -size / 2, size, size, size * 0.3);
        ctx.fill();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'dot':
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'custom':
        if (customPath) {
          ctx.beginPath();
          customPath(ctx, -size / 2, -size / 2, size);
          ctx.fill();
        }
        break;
    }
    ctx.restore();
  }

  private drawCornerDot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, options: CornerDotOptions) {
    const { type = 'square', color = '#000000', gradient, customPath } = options;
    
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    if (gradient) {
      const grad = this.getGradient(ctx, gradient, { x, y, width: size, height: size });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = color;
    }

    switch (type) {
      case 'square':
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case 'rounded':
        this.roundedRect(ctx, -size / 2, -size / 2, size, size, size * 0.3);
        ctx.fill();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'custom':
        if (customPath) {
          ctx.beginPath();
          customPath(ctx, -size / 2, -size / 2, size);
          ctx.fill();
        }
        break;
    }
    ctx.restore();
  }

  private drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, options: EyeOptions, isOuter: boolean) {
    const eyeOptions = isOuter ? options.outer : options.inner;
    if (!eyeOptions) return;
    
    const { type = 'square', color = '#000000', gradient, customPath } = eyeOptions;
    
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);

    if (gradient) {
      const grad = this.getGradient(ctx, gradient, { x, y, width: size, height: size });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = color;
    }

    switch (type) {
      case 'square':
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case 'rounded':
        this.roundedRect(ctx, -size / 2, -size / 2, size, size, size * 0.3);
        ctx.fill();
        break;
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'custom':
        if (customPath) {
          ctx.beginPath();
          customPath(ctx, -size / 2, -size / 2, size, isOuter);
          ctx.fill();
        }
        break    }
    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, options: BackgroundOptions) {
    const { color = '#ffffff', gradient, pattern, image } = options;
    
    // Base color/gradient
    if (gradient) {
      const grad = this.getGradient(ctx, gradient, { x: 0, y: 0, width, height });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = color;
    }
    ctx.fillRect(0, 0, width, height);

    // Pattern overlay
    if (pattern) {
      this.drawPattern(ctx, width, height, pattern);
    }

    // Background image
    if (image && image.src) {
      // Would need async image loading - skip for now
    }
  }

  private drawPattern(ctx: CanvasRenderingContext2D, width: number, height: number, pattern: BackgroundOptions['pattern']) {
    if (!pattern) return;
    
    const { type = 'dots', color = '#000000', size = 4, spacing = 20, rotation = 0, customDraw } = pattern;
    
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rotation);
    ctx.translate(-width / 2, -height / 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.1;

    if (customDraw) {
      customDraw(ctx, width, height);
    } else {
      switch (type) {
        case 'dots':
          for (let x = -width; x < width * 2; x += spacing) {
            for (let y = -height; y < height * 2; y += spacing) {
              ctx.beginPath();
              ctx.arc(x, y, size / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
        case 'lines':
          for (let x = -width; x < width * 2; x += spacing) {
            ctx.fillRect(x, -height, 1, height * 2);
          }
          break;
        case 'cross':
          for (let x = -width; x < width * 2; x += spacing) {
            for (let y = -height; y < height * 2; y += spacing) {
              ctx.fillRect(x - size/2, y - size/2, size, size);
              ctx.fillRect(x + spacing/2 - size/2, y + spacing/2 - size/2, size, size);
            }
          }
          break;
        case 'diagonal':
          for (let i = -width - height; i < width + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(i, -height);
            ctx.lineTo(i + height, height);
            ctx.lineTo(i + height + size, height);
            ctx.lineTo(i + size, -height);
            ctx.fill();
          }
          break;
        case 'grid':
          for (let x = -width; x < width * 2; x += spacing) {
            ctx.fillRect(x, -height, 1, height * 2);
          }
          for (let y = -height; y < height * 2; y += spacing) {
            ctx.fillRect(-width, y, width * 2, 1);
          }
          break;
      }
    }
    ctx.restore();
  }

  private drawImage(ctx: CanvasRenderingContext2D, options: ImageOptions) {
    // Image drawing would need async loading - placeholder for now
  }

  private drawFrame(ctx: CanvasRenderingContext2D, width: number, height: number, options: FrameOptions) {
    if (!options.text) return;
    
    const { 
      text, color = '#000000', fontSize = 16, fontFamily = 'system-ui', 
      fontWeight = 'normal', margin = 20, backgroundColor, borderRadius = 8, padding = 8 
    } = options;
    
    ctx.save();
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(text).width;
    const frameWidth = textWidth + padding * 2;
    const frameHeight = fontSize + padding * 2;
    const frameX = (width - frameWidth) / 2;
    const frameY = height - frameHeight - margin;
    
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      this.roundedRect(ctx, frameX, frameY, frameWidth, frameHeight, borderRadius);
      ctx.fill();
    }
    
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, frameY + frameHeight / 2);
    ctx.restore();
  }

  private roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private classyShape(ctx: CanvasRenderingContext2D, size: number) {
    const r = size * 0.25;
    const half = size / 2;
    ctx.beginPath();
    ctx.moveTo(-half + r, -half);
    ctx.lineTo(half - r, -half);
    ctx.quadraticCurveTo(half, -half, half, -half + r);
    ctx.lineTo(half, half - r);
    ctx.quadraticCurveTo(half, half, half - r, half);
    ctx.lineTo(-half + r, half);
    ctx.quadraticCurveTo(-half, half, -half, half - r);
    ctx.lineTo(-half, -half + r);
    ctx.quadraticCurveTo(-half, -half, -half + r, -half);
    ctx.closePath();
  }

  private classyRoundedShape(ctx: CanvasRenderingContext2D, size: number) {
    const r = size * 0.35;
    const half = size / 2;
    ctx.beginPath();
    ctx.moveTo(-half + r, -half);
    ctx.lineTo(half - r, -half);
    ctx.quadraticCurveTo(half, -half, half, -half + r);
    ctx.lineTo(half, half - r);
    ctx.quadraticCurveTo(half, half, half - r, half);
    ctx.lineTo(-half + r, half);
    ctx.quadraticCurveTo(-half, half, -half, half - r);
    ctx.lineTo(-half, -half + r);
    ctx.quadraticCurveTo(-half, -half, -half + r, -half);
    ctx.closePath();
  }

  // Public methods
  renderToCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    const { width, height } = this.options;
    canvas.width = width;
    canvas.height = height;
    this.ctx = canvas.getContext('2d')!;
    this.gradients.clear();
    this.calculateLayout();
    this.draw();
  }

  renderToSVG(): SVGElement {
    this.gradients.clear();
    this.calculateLayout();
    return this.drawSVG();
  }

  private draw(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const { width, height } = this.options;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Background
    this.drawBackground(ctx, width, height, this.options.backgroundOptions || {});
    
    // QR modules
    const elements = this.matrix.getElements();
    for (const el of elements) {
      const x = this.offsetX + el.x * this.moduleSize;
      const y = this.offsetY + el.y * this.moduleSize;
      
      if (el.isFinder) {
        // Finder pattern outer
        this.drawCornerSquare(ctx, x, y, this.moduleSize * 7, this.options.cornersSquareOptions || {});
        // Finder pattern inner
        if (el.x >= 2 && el.x <= 4 && el.y >= 2 && el.y <= 4) {
          this.drawCornerDot(ctx, x + this.moduleSize * 2, y + this.moduleSize * 2, this.moduleSize * 3, this.options.cornersDotOptions || {});
        }
      } else if (el.isTiming) {
        this.drawDot(ctx, x, y, this.moduleSize, this.options.dotsOptions || {}, true);
      } else if (el.isAlignment) {
        this.drawCornerSquare(ctx, x - this.moduleSize * 2, y - this.moduleSize * 2, this.moduleSize * 5, this.options.cornersSquareOptions || {});
        this.drawCornerDot(ctx, x - this.moduleSize, y - this.moduleSize, this.moduleSize * 3, this.options.cornersDotOptions || {});
      } else {
        this.drawDot(ctx, x, y, this.moduleSize, this.options.dotsOptions || {}, el.isDark);
      }
    }
    
    // Center image
    if (this.options.imageOptions?.src) {
      this.drawImage(ctx, this.options.imageOptions);
    }
    
    // Frame
    if (this.options.frameOptions?.text) {
      this.drawFrame(ctx, width, height, this.options.frameOptions);
    }
  }

  private drawSVG(): SVGElement {
    const { width, height } = this.options;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Background
    const bg = this.options.backgroundOptions || {};
    const bgRect = document.createElementNS(ns, 'rect');
    bgRect.setAttribute('width', width.toString());
    bgRect.setAttribute('height', height.toString());
    bgRect.setAttribute('fill', bg.color || '#ffffff');
    svg.appendChild(bgRect);
    
    // QR modules would need more complex SVG generation
    // For now, return basic structure
    return svg;
  }

  async getRawData(type: 'svg' | 'png' | 'jpeg' | 'webp', quality?: number): Promise<string | Blob> {
    if (this.options.type === 'svg' || type === 'svg') {
      const svg = this.renderToSVG();
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      return 'data:image/svg+xml;base64,' + btoa(svgString);
    }
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.renderToCanvas(this.canvas);
    }
    
    return new Promise((resolve) => {
      this.canvas!.toBlob((blob) => {
        resolve(blob!);
      }, `image/${type}`, quality);
    });
  }
}