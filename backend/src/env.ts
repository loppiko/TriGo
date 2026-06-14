import type { Result } from "#shared/types/core"
import { z } from "zod"


const EnvSchema = z.object({
    FIREBASE_API_KEY: z.string().min(1),
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_APP_ID: z.string().min(1),
    SUPABASE_URL: z.url().min(1),
    SUPABASE_SERVICE_KEY: z.string().min(1),
})


export const AppConfigSchema = EnvSchema.transform((env) => {
    return {
        firebase: {
            apiKey: env.FIREBASE_API_KEY,
            projectId: env.FIREBASE_PROJECT_ID,
            appId: env.FIREBASE_APP_ID,
        },
        supabase: {
            url: env.SUPABASE_URL,
            serviceKey: env.SUPABASE_SERVICE_KEY
        }
    }
})


export type RawEnv = z.infer<typeof EnvSchema>
export type AppConfig = z.infer<typeof AppConfigSchema>


let appConfigInstance: AppConfig | undefined


/**
 * This hook should be used only by middlewares functions.
 */
export function useAppConfig() {
    return {
        init: initAppConfig,
    }
}


function initAppConfig(env: RawEnv): Result<AppConfig> {
    const result = AppConfigSchema.safeParse(env)
    
    if (!result.success) {
        console.error("[initAppConfig] Failed to initialize app config:", result.error.message)
        return { success: false, error: result.error.message }
    }

    appConfigInstance = result.data
    return { success: true, data: appConfigInstance }
}
