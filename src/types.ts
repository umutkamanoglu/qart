export interface QRCodeOptions {
  version?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
  maskPattern?: number;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export interface GradientOptions {
  type: 'linear' | 'radial' | 'conic';
  rotation?: number;
  colorStops: GradientStop[];
  centerX?: number;
  centerY?: number;
  radius?: number;
}

export interface DotOptions {
  type?: 'square' | 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'extra-rounded' | 'custom';
  color?: string;
  gradient?: GradientOptions;
  customPath?: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
  scale?: number;
}

export interface CornerSquareOptions {
  type?: 'square' | 'rounded' | 'circle' | 'dot' | 'custom';
  color?: string;
  gradient?: GradientOptions;
  customPath?: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
}

export interface CornerDotOptions {
  type?: 'square' | 'rounded' | 'circle' | 'custom';
  color?: string;
  gradient?: GradientOptions;
  customPath?: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
}

export interface BackgroundOptions {
  color?: string;
  gradient?: GradientOptions;
  pattern?: {
    type: 'dots' | 'lines' | 'cross' | 'diagonal' | 'grid' | 'custom';
    color?: string;
    size?: number;
    spacing?: number;
    rotation?: number;
    customDraw?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  };
  image?: {
    src: string;
    opacity?: number;
    crossOrigin?: string;
  };
}

export interface ImageOptions {
  src?: string;
  margin?: number;
  crossOrigin?: string;
  hideBackgroundDots?: boolean;
  imageSize?: number;
  saveAsBlob?: boolean;
}

export interface FrameOptions {
  text?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export interface EyeOptions {
  outer?: {
    type?: 'square' | 'rounded' | 'circle' | 'custom';
    color?: string;
    gradient?: GradientOptions;
    customPath?: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isOuter: boolean) => void;
  };
  inner?: {
    type?: 'square' | 'rounded' | 'circle' | 'custom';
    color?: string;
    gradient?: GradientOptions;
    customPath?: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, isOuter: boolean) => void;
  };
}

export interface QArtOptions {
  data: string;
  width?: number;
  height?: number;
  type?: 'canvas' | 'svg';
  margin?: number;
  qrOptions?: QRCodeOptions;
  dotsOptions?: DotOptions;
  cornersSquareOptions?: CornerSquareOptions;
  cornersDotOptions?: CornerDotOptions;
  backgroundOptions?: BackgroundOptions;
  imageOptions?: ImageOptions;
  frameOptions?: FrameOptions;
  eyeOptions?: EyeOptions;
}

export interface DownloadOptions {
  name?: string;
  extension?: 'png' | 'jpeg' | 'webp' | 'svg';
  quality?: number;
}

export interface QRElement {
  x: number;
  y: number;
  isDark: boolean;
  isFinder?: boolean;
  isTiming?: boolean;
  isAlignment?: boolean;
  isFormat?: boolean;
  isVersion?: boolean;
}