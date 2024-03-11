const path = require('path');
const { readFile, writeFile, ensureFile } = require('fs-extra');
const resolveConfig = require('./resolve-config.js');

module.exports = async (pluginConfig, context) => {
  const { cwd, branch, nextRelease, logger } = context;
  const { notes } = nextRelease;
  const { changelogFile, changelogTitle, branches } = resolveConfig(pluginConfig);
  const changelogPath = path.resolve(cwd, changelogFile);

  if (notes && branches.includes(branch?.name)) {
    logger.log('Branch: %s', branch?.name);
    logger.log('Title: %s', changelogTitle);

    await ensureFile(changelogPath);
    const currentFile = (await readFile(changelogPath)).toString().trim();

    if (currentFile) {
      logger.log('Update %s', changelogPath);
    } else {
      logger.log('Create %s', changelogPath);
    }

    const currentContent =
      changelogTitle && currentFile.startsWith(changelogTitle)
        ? currentFile.slice(changelogTitle.length).trim()
        : currentFile;
    const content = `${notes.trim()}\n${currentContent ? `\n${currentContent}\n` : ''}`;

    await writeFile(changelogPath, changelogTitle ? `${changelogTitle}\n\n${content}` : content);
  }
};
