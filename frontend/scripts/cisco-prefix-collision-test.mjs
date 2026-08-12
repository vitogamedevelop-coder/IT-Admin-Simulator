import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createCiscoDevice, executeCommand, getCommandHelp, completeInput, CLI_ERROR } from '../src/lib/ciscoCliEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// localStorage/window stub so skillTree calls don't crash in Node
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.window = { dispatchEvent: () => {} };

const { BASE_COMMAND_TREE } = await import(pathToFileURL(join(__dirname, '../src/lib/ciscoCliEngine.js')).href);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isArgumentWildcard(keyword) {
  return keyword.startsWith('<') && keyword.endsWith('>');
}

function setCliContext(device, mode) {
  if (mode === 'INTERFACE_CONFIG') {
    device.cli.currentInterface = Object.keys(device.runningConfig.interfaces)[0];
    device.cli.currentLine = null;
  } else if (mode === 'LINE_CONSOLE_CONFIG') {
    device.cli.currentInterface = null;
    device.cli.currentLine = 'console';
  } else if (mode === 'LINE_VTY_CONFIG') {
    device.cli.currentInterface = null;
    device.cli.currentLine = 'vty';
  } else {
    device.cli.currentInterface = null;
    device.cli.currentLine = null;
  }
}

function collectKeywords(nodes) {
  return (nodes || [])
    .filter((n) => !isArgumentWildcard(n.keyword))
    .map((n) => n.keyword);
}

function allConcreteKeywords(nodes) {
  return (nodes || []).filter((n) => !isArgumentWildcard(n.keyword));
}

function testSiblings(device, mode, path, siblings) {
  const keywords = collectKeywords(siblings);
  for (const keyword of keywords) {
    const pathPrefix = path ? `${path} /` : 'root';
    for (let len = 1; len <= keyword.length; len += 1) {
      const prefix = keyword.slice(0, len);
      const exactMatches = keywords.filter((k) => k === prefix).length;
      const prefixMatches = keywords.filter((k) => k.startsWith(prefix) && k !== prefix).length;
      const expected = exactMatches >= 1 ? 'exact' : prefixMatches === 0 ? 'none' : prefixMatches === 1 ? 'unique' : 'ambiguous';

      device.cli.mode = mode;
      setCliContext(device, mode);

      const fullInput = path ? `${path} ${prefix}` : prefix;
      const result = executeCommand(device, fullInput);
      let actual;
      if (result.success) actual = 'exact';
      else if (result.errorType === CLI_ERROR.AMBIGUOUS_COMMAND) actual = 'ambiguous';
      else if (result.errorType === CLI_ERROR.UNKNOWN_COMMAND) actual = 'none';
      else if (result.errorType === CLI_ERROR.INCOMPLETE_COMMAND) actual = 'exact';
      else actual = `other(${result.errorType})`;

      const expectedDescription = `${pathPrefix} "${prefix}" (from ${keyword}) should be ${expected}`;
      if (expected === 'ambiguous') {
        assert(actual === 'ambiguous', `${expectedDescription}, got ${actual}`);
      } else if (expected === 'unique') {
        assert(actual === 'exact', `${expectedDescription}, got ${actual}`);
      } else if (expected === 'none') {
        assert(actual === 'none', `${expectedDescription}, got ${actual}`);
      } else if (expected === 'exact') {
        assert(actual === 'exact', `${expectedDescription}, got ${actual}`);
      }
    }
  }
}

function testHelpAndTab(device, mode, path, siblings) {
  const keywords = collectKeywords(siblings);

  for (const keyword of keywords) {
    // Pick the shortest ambiguous prefix if one exists.
    for (let len = 1; len <= keyword.length; len += 1) {
      const prefix = keyword.slice(0, len);
      const exactMatches = keywords.filter((k) => k === prefix).length;
      const prefixMatches = keywords.filter((k) => k.startsWith(prefix) && k !== prefix).length;
      if (exactMatches === 0 && prefixMatches > 1) {
        device.cli.mode = mode;
        setCliContext(device, mode);
        const fullHelp = path ? `${path} ${prefix}?` : `${prefix}?`;
        const help = getCommandHelp(device, fullHelp);
        assert(help.isHelp, `Partial word help for "${fullHelp}" should return help (path: ${path})`);
        const rendered = help.help.toLowerCase().split(/\s+/).filter(Boolean);
        const expectedMatches = keywords.filter((k) => k.startsWith(prefix));
        for (const match of expectedMatches) {
          assert(rendered.includes(match), `Partial help for "${fullHelp}" should contain ${match}`);
        }
        device.cli.mode = mode;
        setCliContext(device, mode);
        const fullTab = path ? `${path} ${prefix}` : prefix;
        const tab = completeInput(device, fullTab);
        assert(!tab.completion && tab.suggestions.length > 1, `Tab on ambiguous "${fullTab}" should not auto-complete (path: ${path})`);
      }
      if (exactMatches === 0 && prefixMatches === 1) {
        device.cli.mode = mode;
        setCliContext(device, mode);
        const fullTab = path ? `${path} ${prefix}` : prefix;
        const tab = completeInput(device, fullTab);
        assert(tab.completion, `Tab on unique "${fullTab}" should complete (path: ${path})`);
      }
    }

    // Syntax help after unique keyword.
    device.cli.mode = mode;
    setCliContext(device, mode);
    const fullSyntax = path ? `${path} ${keyword} ?` : `${keyword} ?`;
    const help = getCommandHelp(device, fullSyntax);
    assert(help.isHelp, `Syntax help for "${fullSyntax}" should return help (path: ${path})`);

    // Tab on exact keyword should complete and add a space.
    device.cli.mode = mode;
    setCliContext(device, mode);
    const fullTab = path ? `${path} ${keyword}` : keyword;
    const tab = completeInput(device, fullTab);
    assert(tab.completion, `Tab on exact "${fullTab}" should complete (path: ${path})`);
  }
}

function walkTree(device, mode, path, nodes) {
  const siblings = allConcreteKeywords(nodes);
  testSiblings(device, mode, path, siblings);
  testHelpAndTab(device, mode, path, siblings);

  for (const node of siblings) {
    if (node.children && node.children.length > 0) {
      walkTree(device, mode, `${path ? `${path} ` : ''}${node.keyword}`, node.children);
    }
  }
}

const device = createCiscoDevice({ type: 'switch', hostname: 'Sw1' });

for (const [mode, tree] of Object.entries(BASE_COMMAND_TREE)) {
  device.cli.mode = mode;
  setCliContext(device, mode);
  walkTree(device, mode, '', tree);
}

console.log('Prefix collision, help and tab tests passed across all CLI modes.');
