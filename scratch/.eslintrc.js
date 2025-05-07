/* eslint-disable @typescript-eslint/naming-convention */

module.exports = {
  "root": true,
  "extends": [
    "../.eslintrc.js"
  ],
  "parserOptions": {
    "project": "./tsconfig.json",
    "sourceType": "module"
  },
  "ignorePatterns": ["dist/**/*", "node_modules/**/*"]
}; 