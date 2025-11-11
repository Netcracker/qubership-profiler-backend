export function downloadFile(blobOrUrl: Blob | string, filename: string): void {
    const url = typeof blobOrUrl === 'string' ? blobOrUrl : window.URL.createObjectURL(blobOrUrl);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof blobOrUrl !== 'string') {
        window.URL.revokeObjectURL(url);
    }
}
