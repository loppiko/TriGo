import { doc, setDoc, getDoc, serverTimestamp, Timestamp, type QueryDocumentSnapshot } from 'firebase/firestore'
import type { Result } from '#shared/types/core'
import type { User } from '#shared/types/user/types'
import { userSchema } from '#shared/types/user/schema'
import { useWorkspaces } from './useWorkspaces'


const userConverter = {
    toFirestore(user: User): Record<string, unknown> {
        userSchema.parse(user)
        return {
            uid: user.uid,
            name: user.name,
            createdAt: (user.createdAt) ? Timestamp.fromDate(user.createdAt) : serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): User {
        const data = snapshot.data() as Record<string, unknown>
        return {
            uid: snapshot.id,
            name: data.name as string,
            createdAt: (data.createdAt as Timestamp).toDate(),
            updatedAt: (data.updatedAt as Timestamp).toDate(),
        }
    },
}


export const useUsers = () => {
    const { $firebaseFirestore } = useNuxtApp()
    const USERS_COLLECTION = 'users'

    
    const createOrUpdateUser = async (firebaseUser: { uid: string; displayName: string | null }): Promise<Result<User>> => {
        const userRef = doc($firebaseFirestore, USERS_COLLECTION, firebaseUser.uid).withConverter(userConverter)
        const name = firebaseUser.displayName ?? 'Unknown'

        try {
            const existingDoc = await getDoc(userRef)

            if (existingDoc.exists()) {
                const user = existingDoc.data() as User
                return { success: true, data: user }
            }

            await setDoc(userRef, { name, uid: firebaseUser.uid }, { merge: true })

            const { createWorkspace } = useWorkspaces()
            const workspaceResult = await createWorkspace(firebaseUser.uid)
            if (!workspaceResult.success) {
                console.error('[createOrUpdateUser]', workspaceResult.error)
                return { success: false, error: workspaceResult.error }
            }

            const created = await getDoc(userRef)
            const user = created.data()
            return user ? { success: true, data: user as User } : { success: false, error: 'User document not found' }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to create user'
            console.error('[createOrUpdateUser]', errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    return {
        createOrUpdateUser,
    }
}
