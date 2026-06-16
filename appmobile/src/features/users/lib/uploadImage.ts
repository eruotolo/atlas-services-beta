const UPLOAD_URL = process.env.EXPO_PUBLIC_UPLOAD_URL ?? '';

interface UploadResponse {
    urls: string[];
}

export async function uploadImage(localUri: string, folder = 'avatars'): Promise<string> {
    if (!UPLOAD_URL) throw new Error('EXPO_PUBLIC_UPLOAD_URL is not configured');

    const filename = localUri.split('/').pop() ?? 'image.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const formData = new FormData();
    formData.append('files', {
        uri: localUri,
        name: filename,
        type: mimeType,
    } as unknown as Blob);
    formData.append('folder', folder);

    const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as UploadResponse;
    const url = data.urls[0];
    if (!url) throw new Error('No URL returned from upload service');
    return url;
}
