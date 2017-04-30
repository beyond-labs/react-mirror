module.exports = {
  extends: 'react-app',
  env: {
    browser: true,
    node: true,
    jest: true
  },
  rules: {
    indent: ['warn', 2],
    'max-len': ['warn', 90],
    semi: ['warn', 'always'],
    quotes: ['warn', 'single'],
    'comma-dangle': ['warn', 'never'],
    'object-curly-spacing': ['warn', 'never']
  }
};
