import type { User } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import type { Result } from '#shared/types/core'


/**
 * Maps Firebase Auth error codes to short, user-facing messages.
 */
function mapFirebaseAuthError(error: unknown): string {
    if (error && typeof error === 'object' && 'code' in error) {
        const code = String((error as { code: unknown }).code)
        const map: Record<string, string> = {
            'auth/invalid-credential': 'Nieprawidłowy e-mail lub hasło',
            'auth/user-disabled': 'To konto zostało wyłączone',
            'auth/user-not-found': 'Nieprawidłowy e-mail lub hasło',
            'auth/wrong-password': 'Nieprawidłowy e-mail lub hasło',
            'auth/invalid-email': 'Nieprawidłowy adres e-mail',
            'auth/too-many-requests': 'Zbyt wiele prób — spróbuj ponownie później',
        }
        if (code in map) {
            return map[code]!
        }
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'Logowanie nie powiodło się'
}


/**
 * Firebase Authentication for the admin app (email and password only).
 */
export function useAuth() {
    const firebaseApp = useFirebaseApp()
    const auth = getAuth(firebaseApp)
    const user = useState<User | null>('firebase-user', () => null)
    const authReady = useState<boolean>('firebase-auth-ready', () => false)

    /**
     * Signs in with email and password and updates shared `user` state on success.
     */
    async function signInWithEmailAndPassword(
        email: string,
        password: string,
    ): Promise<Result<User>> {
        try {
            const { signInWithEmailAndPassword: firebaseSignIn } = await import('firebase/auth')
            const credential = await firebaseSignIn(auth, email, password)
            user.value = credential.user
            return { success: true, data: credential.user }
        } catch (error) {
            console.error('[signInWithEmailAndPassword] Sign-in failed:', error)
            return { success: false, error: mapFirebaseAuthError(error) }
        }
    }


    /**
     * Signs out the current user and clears local auth state.
     */
    async function signOut(): Promise<Result<void>> {
        try {
            const { signOut: firebaseSignOut } = await import('firebase/auth')
            await firebaseSignOut(auth)
            user.value = null
            return { success: true, data: undefined }
        } catch (error) {
            console.error('[signOut] Sign-out failed:', error)
            return { success: false, error: mapFirebaseAuthError(error) }
        }
    }

    return {
        user,
        authReady,
        signInWithEmailAndPassword,
        signOut,
    }
}
