const rootPkg = require('../../package.json');

// Dynamically read all dependencies from the root package.json
// so autolinking discovers native modules without duplicating deps here.
const allDeps = Object.keys({
  ...rootPkg.dependencies,
  ...rootPkg.devDependencies,
});

const dependencies = {};
for (const dep of allDeps) {
  dependencies[dep] = {};
}

module.exports = {
  dependencies,
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
};
