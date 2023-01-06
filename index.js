const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const path = require('path');

async function run() {
  try {
    // Change the three following constants when updating LLVM version
    const downloadUrl = 'https://github.com/llvm/llvm-project/releases/download/llvmorg-15.0.6/clang+llvm-15.0.6-x86_64-linux-gnu-ubuntu-18.04.tar.xz';
    const versionTag = '15.0.6'; // tool-cache expects this to follow semver.org
    // CAUTION: semver syntax is a *giant* pain in the butt. For example,
    // "2022.08.0" is not compliant because of a leading zero in "08". When
    // updating this value, you should check in a node shell with this command
    // > require("semver").valid("15.0.6")
    // and make sure it returns a non-null value

    const cacheKey = 'llvm';
    let cachedLLVMPath = tc.find(cacheKey, versionTag);
    if (cachedLLVMPath) {
      core.info(`Using cached version ${versionTag}`);
    } else {
      core.info(`Could not find cached version ${versionTag} in ${JSON.stringify(tc.findAllVersions(cacheKey))}`)
      core.info(`Downloading version ${versionTag} from ${downloadUrl}`);
      const downloadLLVMTarPath = await tc.downloadTool(downloadUrl);
      core.info(`Extracting version ${versionTag}`);
      const downloadLLVMPath = await tc.extractTar(downloadLLVMTarPath, null, ['-x', '--xz', '--strip-components=1']);
      core.info(`Caching version ${versionTag}`);
      cachedLLVMPath = await tc.cacheDir(downloadLLVMPath, cacheKey, versionTag);
    }
    core.exportVariable('LLVM_PATH', cachedLLVMPath)
    const addPath = core.getInput('add-path')
    if (addPath) {
      core.addPath(path.join(cachedLLVMPath, 'bin'));
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
