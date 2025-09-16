export class EntityNotFoundException extends Error {
    constructor(entityType: string, entityId: string) {
        super(`${entityType} with id '${entityId}' not found`);
    }
}