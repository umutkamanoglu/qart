const typescript = require('@rollup/plugin-typescript').default;
const dts = require('rollup-plugin-dts').default;
const packageJson = require('./package.json');

module.exports = [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'umd',
        name: 'QArt',
        sourcemap: true,
        globals: {
          'qrcode-generator': 'QRCodeGenerator'
        }
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    external: ['qrcode-generator'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist'
      })
    ]
  },
  {
    input: 'dist/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [dts()]
  }
];