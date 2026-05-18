import { Result } from "#shared/types/core"
import { FirebaseApp, initializeApp } from "@firebase/app"
import { Firestore, getFirestore } from "@firebase/firestore/lite"
import { AppConfig } from "src/env"


let app: FirebaseApp | undefined
let db: Firestore | undefined


export function getFirebaseDatabase(config: AppConfig): Result<Firestore> {
    if (db) {
        return { success: true, data: db }
    }

    try {
        app = initializeApp(config.firebase)
        db = getFirestore(app)
    } catch (error) {
        console.error(error)
        return { success: false, error: `Failed to initialize Firebase database: ${String(error)}` }
    }
    
    return { success: true, data: db }
}