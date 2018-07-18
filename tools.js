const { execSync } = require('child_process');
const fs = require('fs');

const localNpm = 'http://localhost:4873/'

if (String(execSync('npm get registry')).trim() !== localNpm) {
  console.error(`Expected npm registry to be set to ${localNpm} (you might need to install verdaccio)`);
  process.exit(1);
}

function _unpublish(names) {
  for (const name of Array.from(new Set(names))) {
    console.log(`Unpublishing package: ${name}`);
    execSync(`npm unpublish ${name} --force > /dev/null 2>&1`);
  }
}

function uploadPackages(packages, unpublish = true) {
  if (unpublish) {
    _unpublish(packages.map(package => package.name));
  }

  for (const package of packages) {
    console.log(`Creating and publishing package: ${package.name}@${package.version}`);
    const dir = String(execSync(`mktemp -d /tmp/mobile-crash-course-npm.XX`)).trim();

    fs.writeFileSync(`${dir}/package.json`, JSON.stringify(package, null, 2), 'utf8');
    execSync(`cd ${dir} && npm publish -s`);

    execSync(`rm -rf ${dir}`);
  }
}

function uploadPackagesFromLocations(packages, unpublish = true) {
  if (unpublish) {
    _unpublish(packages.map(package => require(package + '/package.json').name));
  }

  for (const package of packages) {
    console.log(`Publishing package located at: ${package}`);
    execSync(`cd ${package} && npm publish -s`);
  }
}

module.exports = {
  uploadPackages,
  uploadPackagesFromLocations
}
