import QRCodeGenerator from 'qrcode-generator';
import type { QArtOptions, QRElement } from './types';

export class QRMatrix {
  public modules: boolean[][];
  public size: number;
  public version: number;

  constructor(options: QArtOptions) {
    const typeNumber = (options.qrOptions?.version as number) || 0;
    const errorCorrectionLevel = options.qrOptions?.errorCorrectionLevel || 'M';
    
    const qr = QRCodeGenerator(typeNumber, errorCorrectionLevel);
    qr.addData(options.data);
    qr.make();
    
    this.size = qr.getModuleCount();
    this.modules = this.extractModules(qr);
    this.version = typeNumber || this.calculateVersion(this.size);
  }

  private extractModules(qr: any): boolean[][] {
    const modules: boolean[][] = [];
    for (let y = 0; y < this.size; y++) {
      modules[y] = [];
      for (let x = 0; x < this.size; x++) {
        modules[y][x] = qr.isDark(y, x);
      }
    }
    return modules;
  }

  private calculateVersion(size: number): number {
    // Version 1 = 21 modules, each version adds 4 modules
    return Math.max(1, (size - 17) / 4);
  }

  getModule(x: number, y: number): boolean {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;
    return this.modules[y][x];
  }

  getElements(): QRElement[] {
    const elements: QRElement[] = [];
    const size = this.size;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isDark = this.modules[y][x];
        if (!isDark) continue;
        
        const isFinder = this.isFinderPattern(x, y);
        const isTiming = this.isTimingPattern(x, y);
        const isAlignment = this.isAlignmentPattern(x, y);
        const isFormat = this.isFormatInfo(x, y);
        const isVersion = this.isVersionInfo(x, y);
        
        elements.push({ x, y, isDark, isFinder, isTiming, isAlignment, isFormat, isVersion });
      }
    }
    
    return elements;
  }

  private isFinderPattern(x: number, y: number): boolean {
    const size = this.size;
    return (
      (x < 9 && y < 9) ||
      (x >= size - 8 && y < 9) ||
      (x < 9 && y >= size - 8)
    );
  }

  private isTimingPattern(x: number, y: number): boolean {
    return (x === 6 && y >= 8 && y < this.size - 8) ||
           (y === 6 && x >= 8 && x < this.size - 8);
  }

  private isAlignmentPattern(x: number, y: number): boolean {
    if (this.version < 2) return false;
    
    const positions = this.getAlignmentPositions();
    for (const pos of positions) {
      if (Math.abs(x - pos) <= 2 && Math.abs(y - pos) <= 2) {
        if (!(x < 9 && y < 9) &&
            !(x >= this.size - 8 && y < 9) &&
            !(x < 9 && y >= this.size - 8)) {
          return true;
        }
      }
    }
    return false;
  }

  private getAlignmentPositions(): number[] {
    if (this.version === 1) return [];
    
    const positions: number[] = [6, this.size - 7];
    const step = this.getAlignmentStep();
    
    for (let i = 6 + step; i < this.size - 7; i += step) {
      positions.push(i);
    }
    
    return positions;
  }

  private getAlignmentStep(): number {
    if (this.version <= 6) return 28;
    if (this.version <= 12) return 26;
    if (this.version <= 18) return 24;
    if (this.version <= 24) return 22;
    if (this.version <= 30) return 20;
    if (this.version <= 36) return 18;
    if (this.version <= 40) return 16;
    return 14;
  }

  private isFormatInfo(x: number, y: number): boolean {
    const size = this.size;
    return (
      (x === 8 && (y < 9 || y >= size - 8)) ||
      (y === 8 && (x < 9 || x >= size - 8))
    );
  }

  private isVersionInfo(x: number, y: number): boolean {
    if (this.version < 7) return false;
    const size = this.size;
    return (
      (x < 6 && y >= size - 11 && y < size - 8) ||
      (y < 6 && x >= size - 11 && x < size - 8)
    );
  }
}