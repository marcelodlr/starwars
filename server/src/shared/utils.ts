export const getEntityId = (url: string): string => {
    return url.split('/').pop() ?? '';
}