import type { User } from 'firebase/auth'

export const useAuth = () => {
    const { $firebaseAuth, $googleAuthProvider } = useNuxtApp()
    const user = useState<User | null>('firebase-user', () => null)

    const signInWithGoogle = async () => {
        const { signInWithPopup } = await import('firebase/auth')
        const result = await signInWithPopup($firebaseAuth, $googleAuthProvider)
        return result.user
    }

    const signOut = async () => {
        const { signOut: firebaseSignOut } = await import('firebase/auth')
        await firebaseSignOut($firebaseAuth)
        user.value = null
    }

    return {
        user,
        signInWithGoogle,
        signOut,
    }
}
