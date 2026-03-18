import { doc, setDoc, getDoc, serverTimestamp, Timestamp, type QueryDocumentSnapshot } from 'firebase/firestore'
import type { Result } from '#shared/types/core'
import type { Workspace } from '#shared/types/workspace/types'
import { workspaceSchema } from '#shared/types/workspace/schema'


const workspaceConverter = {
    toFirestore(workspace: Partial<Workspace>): Record<string, unknown> {
        workspaceSchema.parse(workspace)
        return {
            id: workspace.id,
            uid: workspace.uid,
            name: workspace.name,
            description: workspace.description,
            createdAt: (workspace.createdAt) ? Timestamp.fromDate(workspace.createdAt) : serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Workspace {
        const data = snapshot.data() as Record<string, unknown>
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        return workspaceSchema.parse({
            id: data.id ?? snapshot.id,
            uid: data.uid,
            name: data.name,
            description: data.description,
            createdAt,
            updatedAt,
        })
    },
}


export const useWorkspaces = () => {
    const { $firebaseFirestore } = useNuxtApp()
    const currentWorkspace = useState<Workspace | null>('current-workspace', () => null)
    const WORKSPACES_COLLECTION = 'workspaces'

    const DEFAULT_WORKSPACE_NAME = 'My Workspace'
    const DEFAULT_WORKSPACE_DESCRIPTION = ''

    const createWorkspace = async (userId: string): Promise<Result<Workspace>> => {
        const workspaceRef = doc($firebaseFirestore, WORKSPACES_COLLECTION, userId).withConverter(workspaceConverter)

        try {
            const userData = {
                id: userId,
                uid: userId,
                name: DEFAULT_WORKSPACE_NAME,
                description: DEFAULT_WORKSPACE_DESCRIPTION,
            }

            await setDoc(workspaceRef, {
                ...userData,
            })

            const created = await getDoc(workspaceRef)
            const workspace = created.data()
            return workspace ? { success: true, data: workspace as Workspace } : { success: false, error: 'Workspace document not found' }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to create workspace'
            console.error('[createWorkspace]', errorMessage)
            return { success: false, error: errorMessage }
        }
    }


    const changeWorkspace = async (userId: string): Promise<Result<Workspace>> => {
        const workspaceRef = doc($firebaseFirestore, WORKSPACES_COLLECTION, userId).withConverter(workspaceConverter)

        try {
            const snapshot = await getDoc(workspaceRef)
            const workspace = snapshot.data()
            if (workspace) {
                currentWorkspace.value = workspace as Workspace
                return { success: true, data: workspace as Workspace }
            }
            return { success: false, error: 'Workspace not found' }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to fetch workspace'
            console.error('[fetchWorkspace]', errorMessage)
            return { success: false, error: errorMessage }
        }
    }

    const clearCurrentWorkspace = (): void => {
        currentWorkspace.value = null
    }

    return {
        currentWorkspace,
        createWorkspace,
        changeWorkspace,
        clearCurrentWorkspace,
    }
}
