import PocketBase from 'pocketbase';

// Default PocketBase URL from environment variable or local development default
const defaultUrl = (import.meta as any).env?.VITE_POCKETBASE_URL || localStorage.getItem('pb_url') || 'http://127.0.0.1:8090';

export const pb = new PocketBase(defaultUrl);

// Helper to update PB URL dynamically if user configures it in Settings
export function setPocketBaseUrl(url: string) {
  localStorage.setItem('pb_url', url);
  pb.baseUrl = url;
}

export function getPocketBaseUrl(): string {
  return pb.baseUrl;
}

// Check server health
export async function checkPocketBaseHealth(): Promise<{ status: boolean; message: string }> {
  try {
    const result = await pb.health.check();
    if (result && result.code === 200) {
      return { status: true, message: 'PocketBase Server Online' };
    }
    return { status: false, message: 'Server responded with non-200 status' };
  } catch (err: any) {
    return { 
      status: false, 
      message: err?.message || 'PocketBase server unreachable. Please verify URL or start PocketBase server.' 
    };
  }
}
