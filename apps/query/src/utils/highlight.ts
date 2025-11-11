export function highlight(text: string, search: string): string {
    if (!search || !text) {
        return text;
    }

    const regex = new RegExp(`(${search})`, 'gi');
    return text.replace(regex, '<mark class="mark-text">$1</mark>');
}
