// Stub types for filePersistence (external build)
export const DEFAULT_UPLOAD_CONCURRENCY = 5
export const FILE_COUNT_LIMIT = 100
export const OUTPUTS_SUBDIR = 'outputs'
export type FilePersistenceConfig = Record<string, unknown>
export type FilePersistenceEntry = Record<string, unknown>
export type FilesPersistedEventData = Record<string, unknown>
export type PersistedFile = { path: string; size: number }
export type TurnStartTime = number
