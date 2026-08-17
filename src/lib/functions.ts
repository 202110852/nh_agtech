import { supabase } from './supabase'

export async function invokeFunction<T>(name: string, body?: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body: body ?? {} })
  if (error) {
    let message = error.message
    const context = (error as { context?: Response }).context
    if (context) {
      try {
        const payload = (await context.clone().json()) as { error?: string; message?: string }
        message = payload.error ?? payload.message ?? message
      } catch {
        // keep original
      }
    }
    throw new Error(message)
  }
  const payload = data as { error?: string } & T
  if (payload && typeof payload === 'object' && 'error' in payload && payload.error) {
    throw new Error(payload.error)
  }
  return data as T
}
