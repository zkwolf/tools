module.exports = {
  extends: ['airbnb', 'prettier'],
  parser: 'babel-eslint',
  rules: {
    strict: 0,
    'no-param-reassign': 0,
    'arrow-body-style': 0,
    'id-length': 0,
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'no-underscore-dangle': 0,
    'no-plusplus': 0,
    'no-bitwise': [2, { allow: ['~'] }],
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-has-content': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/label-has-for': 0,
    'prefer-destructuring': 0,
    'no-class-assign': 0,
  },
  globals: {
    expect: true,
    document: true,
    window: true,
  },
  env: {
    jest: true,
    node: true,
    mocha: true,
  },
};
