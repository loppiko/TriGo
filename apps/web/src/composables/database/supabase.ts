import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../../../shared/types/database/database.types";

const config = useRuntimeConfig()

export const supabaseClient = createClient<Database>(config.public.supabase.url, config.public.supabase.publishableKey);