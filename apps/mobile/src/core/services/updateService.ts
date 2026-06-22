
const GITHUB_API_URL = "https://api.github.com/repos/riteshpal2005/LedgerLite/releases/latest";

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string | null;
}

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

const isVersionGreater = (v1: string, v2: string): boolean => {
  const v1Parts = v1.replace(/^v/, '').split('.').map(Number);
  const v2Parts = v2.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const p1 = v1Parts[i] || 0;
    const p2 = v2Parts[i] || 0;
    if (p1 > p2) return true;
    if (p1 < p2) return false;
  }
  return false;
};
export const checkForUpdates = async (currentVersion: string): Promise<UpdateInfo> => {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status}`);
    }
    const data = await response.json();
    const latestVersion = data.tag_name; 
    const releaseNotes = data.body;
    const apkAsset = data.assets?.find((asset: GitHubAsset) => asset.name.endsWith('.apk'));
    const downloadUrl = apkAsset ? apkAsset.browser_download_url : null;
    const isUpdateAvailable = isVersionGreater(latestVersion, currentVersion);

    return {
      isUpdateAvailable,
      latestVersion: latestVersion.replace(/^v/, ''),
      releaseNotes,
      downloadUrl,
    };
  } catch (error) {
    console.error("Failed to check for updates:", error);
    return {
      isUpdateAvailable: false,
      latestVersion: currentVersion,
      releaseNotes: "",
      downloadUrl: null,
    };
  }
};