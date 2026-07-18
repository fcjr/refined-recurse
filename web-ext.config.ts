import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { defineWebExtConfig } from 'wxt';

// Launch `wxt dev` in the OS default browser, opened to recurse.com.
//
// SAFETY: this never reads, copies, or launches against your real browser
// profile. It uses a dedicated, throwaway dev profile inside this project
// (.wxt/dev-profile), so it can never disable or corrupt your everyday
// extensions/settings. Sign in to recurse.com once in the dev window; that
// login persists in the dev profile across runs.
//
// We only auto-detect the default browser's *binary* (never its profile). If
// the default isn't a usable Chromium browser (Safari/Firefox, or not found),
// WXT falls back to its own bundled Chrome.

function defaultChromiumBinary(): string | undefined {
  try {
    if (process.platform === 'darwin') return macDefaultChromiumBinary();
    return undefined;
  } catch {
    return undefined;
  }
}

function macDefaultChromiumBinary(): string | undefined {
  const plist = `${process.env.HOME}/Library/Preferences/com.apple.LaunchServices/com.apple.launchservices.secure.plist`;
  const json = execSync(`plutil -convert json -o - "${plist}"`, { encoding: 'utf8' });
  const handlers: Array<Record<string, string>> = JSON.parse(json).LSHandlers ?? [];
  const bundleId = handlers.find((h) => h.LSHandlerURLScheme === 'https')?.LSHandlerRoleAll;
  if (!bundleId) return undefined;

  // Non-Chromium browsers can't be driven as a Chromium binary.
  if (/apple\.Safari|mozilla\.firefox/i.test(bundleId)) return undefined;

  const appPath = execSync(`mdfind "kMDItemCFBundleIdentifier == '${bundleId}'" | head -1`, {
    encoding: 'utf8',
  }).trim();
  if (!appPath || !existsSync(appPath)) return undefined;

  const exec = execSync(
    `/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "${appPath}/Contents/Info.plist"`,
    { encoding: 'utf8' },
  ).trim();
  const binary = `${appPath}/Contents/MacOS/${exec}`;
  return existsSync(binary) ? binary : undefined;
}

const binary = defaultChromiumBinary();

export default defineWebExtConfig({
  binaries: binary ? { chrome: binary } : {},
  // A dedicated dev profile inside the project — never the user's real profile.
  chromiumProfile: `${process.cwd()}/.wxt/dev-profile`,
  keepProfileChanges: true,
  startUrls: ['https://recurse.com/'],
});
