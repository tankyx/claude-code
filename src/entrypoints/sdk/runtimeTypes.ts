// Stub - external build
import type { z } from 'zod'

export type EffortLevel = 'low' | 'medium' | 'high'
export type AnyZodRawShape = Record<string, z.ZodTypeAny>
export type InferShape<T extends AnyZodRawShape> = { [K in keyof T]: z.infer<T[K]> }
export type ForkSessionOptions = Record<string, unknown>
export type ForkSessionResult = Record<string, unknown>
export type GetSessionInfoOptions = Record<string, unknown>
export type GetSessionMessagesOptions = Record<string, unknown>
export type InternalOptions = Record<string, unknown>
export type InternalQuery = AsyncIterable<unknown>
export type ListSessionsOptions = Record<string, unknown>
export type McpSdkServerConfigWithInstance = Record<string, unknown>
export type Options = Record<string, unknown>
export type Query = AsyncIterable<unknown>
export type SDKSession = Record<string, unknown>
export type SDKSessionOptions = Record<string, unknown>
export type SdkMcpToolDefinition<T = unknown> = Record<string, unknown> & { _schema?: T }
export type SessionMessage = Record<string, unknown>
export type SessionMutationOptions = Record<string, unknown>
