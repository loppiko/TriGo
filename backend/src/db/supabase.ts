import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@fleetgo/shared/types/database/database.types";
import { AppConfig, AppConfigSchema } from "src/env";
import { HTTPException } from "hono/http-exception";
import { Result } from "#shared/types/core";


let supabaseClient: SupabaseClient<Database> | undefined


export function initSupabaseClient(config: AppConfig): Result<void> {
    const validatedConfig = AppConfigSchema.safeParse(config)

    if (!validatedConfig.success) {
        return { success: false, error: validatedConfig.error.message }
    }

    supabaseClient = createClient<Database>(config.supabase.url, config.supabase.serviceKey);
    return { success: true, data: undefined }
}


export function getSupabaseClient(): SupabaseClient<Database>  {
    if (!supabaseClient) {
        console.error("[getSupabaseClient] Supabase client not initialized")
        throw new HTTPException(500, { message: "Internal Error. Config has not been initialized." })
    }

    return supabaseClient
}