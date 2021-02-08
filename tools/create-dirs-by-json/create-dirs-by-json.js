/**
 * 根据 json 文件自动创建文件夹及子文件夹
 * @author delbury
 * @version 1.0
 */

const fs = require('fs').promises;
const path = require('path');

const jsonPath = path.resolve(__dirname, './dir-tree.json');
const outputPath = path.resolve(__dirname, './_outputDir');

main();

async function main() {
  try {
    console.log('start creating...');

    const root = await readJson(jsonPath);

    const args = process.argv.slice(2);
    if (args.includes('-f')) {
      await fs.rmdir(path.resolve(outputPath, dirNameFormat(root.dirName)), { recursive: true }); // 强制删除旧文件夹
    }

    createDirs(root, outputPath); // 创建

    console.log('created successfully');
  } catch (err) {
    throw err;
  }
}

/**
 * 过滤文件夹名非法字符
 * @param {String} name 
 */
function dirNameFormat(name) {
  const fname = name.replace(/(\/|\\)/g, '&');
  return fname;
}

/**
 * 读取要生成的文件夹结构的配置json文件
 * @param {string} path json文件路径
 */
async function readJson(path) {
  try {
    const jsonText = await fs.readFile(path, 'utf-8');
    const json = JSON.parse(jsonText);

    return json;
  } catch (err) {
    throw (err);
  }
}

/**
 * 根据文件夹树生成实际的文件夹目录
 * @param {Object} dirTree 
 */
async function createDirs(dirTree, outputPath) {
  if (!dirTree || !dirTree.dirName) return;

  const currentPath = path.resolve(outputPath, dirNameFormat(dirTree.dirName));
  await fs.mkdir(currentPath);

  // 递归
  if (dirTree.subDirs && dirTree.subDirs.length) {
    dirTree.subDirs.forEach(item => {
      if (typeof item === 'string') {
        fs.mkdir(path.resolve(currentPath, item));
      } else {
        createDirs(item, currentPath);
      }
    });
  }
}
