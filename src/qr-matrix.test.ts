import { QRMatrix } from './qr-matrix';
import type { QArtOptions } from './types';

const createOptions = (overrides: Partial<QArtOptions> = {}): QArtOptions => ({
  data: 'https://example.com',
  width: 300,
  height: 300,
  ...overrides
});

describe('QRMatrix', () => {
  it('should create a matrix with correct size', () => {
    const matrix = new QRMatrix(createOptions());
    expect(matrix.size).toBeGreaterThan(0);
    expect(matrix.modules.length).toBe(matrix.size);
  });

  it('should have modules as boolean array', () => {
    const matrix = new QRMatrix(createOptions());
    for (const row of matrix.modules) {
      for (const cell of row) {
        expect(typeof cell).toBe('boolean');
      }
    }
  });

  it('should detect finder patterns', () => {
    const matrix = new QRMatrix(createOptions());
    const elements = matrix.getElements();
    const finderElements = elements.filter(e => e.isFinder);
    expect(finderElements.length).toBeGreaterThan(0);
  });

  it('should detect timing patterns', () => {
    const matrix = new QRMatrix(createOptions());
    const elements = matrix.getElements();
    const timingElements = elements.filter(e => e.isTiming);
    expect(timingElements.length).toBeGreaterThan(0);
  });

  it('should encode data correctly', () => {
    const matrix = new QRMatrix(createOptions({ data: 'test data' }));
    const elements = matrix.getElements();
    expect(elements.some(e => e.isDark)).toBe(true);
  });

  it('should handle different error correction levels', () => {
    const levels = ['L', 'M', 'Q', 'H'] as const;
    for (const level of levels) {
      const matrix = new QRMatrix(createOptions({ qrOptions: { errorCorrectionLevel: level } }));
      expect(matrix.size).toBeGreaterThan(0);
    }
  });
});