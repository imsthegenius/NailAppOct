const fs = require('fs');
const path = require('path');

function patchFileSystemModule() {
  const target = path.join(__dirname, '..', 'node_modules', 'expo-file-system', 'ios', 'FileSystemModule.swift');
  if (!fs.existsSync(target)) {
    console.log('[patch-expo-file-system] Skipped: FileSystemModule.swift not found');
    return;
  }
  const before = fs.readFileSync(target, 'utf8');
  const search = 'ExpoAppDelegate.getSubscriberOfType(';
  const replace = 'ExpoAppDelegateSubscriberRepository.getSubscriberOfType(';
  if (before.includes(search)) {
    const after = before.replace(search, replace);
    if (after !== before) {
      fs.writeFileSync(target, after, 'utf8');
      console.log('[patch-expo-file-system] Patched FileSystemModule.swift');
    } else {
      console.log('[patch-expo-file-system] No changes required');
    }
  } else {
    console.log('[patch-expo-file-system] Pattern not found; nothing to patch');
  }
}

try {
  patchFileSystemModule();
} catch (e) {
  console.warn('[patch-expo-file-system] Failed to patch:', e?.message || e);
}

