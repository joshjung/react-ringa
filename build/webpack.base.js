module.exports = {
  name: 'react-ringa',
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
      umd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
      umd: 'react-dom',
    },
    'ringa': {
      root: 'Ringa',
      commonjs2: 'ringa',
      commonjs: 'ringa',
      amd: 'ringa',
      umd: 'ringa',
    },
  }
};
