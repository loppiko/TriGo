import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@fleetgo/shared/types/database/database.types";
import type { AppConfig } from "../env";
import { HTTPException } from "hono/http-exception";
import type { Result } from "#shared/types/core";


let supabaseClient: SupabaseClient<Database> | undefined


export function initSupabaseClient(config: AppConfig): Result<void> {
    try {
        supabaseClient = createClient<Database>(config.supabase.url, config.supabase.serviceKey);
        return { success: true, data: undefined }
    } catch (error) {
        console.error("[initSupabaseClient] Failed to initialize supabase client:", error)
        return { success: false, error: 'Failed to initialize supabase client' }
    }
}


export function getSupabaseClient(): SupabaseClient<Database>  {
    if (!supabaseClient) {
        console.error("[getSupabaseClient] Supabase client not initialized")
        throw new HTTPException(500, { message: "Internal Error. Config has not been initialized." })
    }

    return supabaseClient
}