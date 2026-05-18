import { Result } from "#shared/types/core"
import { z } from "zod"


const EnvSchema = z.object({
    FIREBASE_API_KEY: z.string().min(1),
    FIREBASE_AUTH_DOMAIN: z.string().min(1),
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_STORAGE_BUCKET: z.string().min(1),
    FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
    FIREBASE_APP_ID: z.string().min(1),
})


export const AppConfigSchema = EnvSchema.transform((env) => {
    return {
        firebase: {
            apiKey: env.FIREBASE_API_KEY,
            authDomain: env.FIREBASE_AUTH_DOMAIN,
            projectId: env.FIREBASE_PROJECT_ID,
            storageBucket: env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
            appId: env.FIREBASE_APP_ID,
        },
    }
})


export type RawEnv = z.infer<typeof EnvSchema>
export type AppConfig = z.infer<typeof AppConfigSchema>


let appConfig: AppConfig | undefined


export function getAppConfig(env: RawEnv): Result<AppConfig> {
    if (!appConfig) {
        const result = AppConfigSchema.safeParse(env)
        
        if (!result.success) {
            return { success: false, error: result.error.message }
        }

        appConfig = result.data
        return { success: true, data: appConfig }
    } else {
        return { success: true, data: appConfig }
    }
}

