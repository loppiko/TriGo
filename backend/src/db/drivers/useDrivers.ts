import type { Result } from "#shared/types/core";
import { getSupabaseClient } from "../supabase";
import type { Driver } from '#shared/types/drivers/schema'


export function useDrivers() {
    return {
        getDriverById,
    }
}


async function getDriverById(id: string): Promise<Result<Driver>> {
    const { data, error } = await getSupabaseClient()
        .from('Drivers')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('[getDriverById]', error)
        return { success: false, error: error.message }
    }

    return { success: true, data: data }
}