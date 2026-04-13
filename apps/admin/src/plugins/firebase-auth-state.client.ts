import type { User } from 'firebase/auth'
import { getAuth, onAuthStateChanged } from 'firebase/auth'


/**
 * Keeps shared `user` / `authReady` state in sync with Firebase Auth (session restore, sign-out elsewhere, etc.).
 * Uses `getAuth(useFirebaseApp())` so we resolve the same Auth instance as VueFire’s `initializeAuth`, without relying on `nuxtApp.$firebaseAuth` (inject timing can leave it undefined).
 */
export default defineNuxtPlugin({
    name: 'firebase-auth-state',
    enforce: 'post',
    setup() {
        const firebaseApp = useFirebaseApp()
        const auth = getAuth(firebaseApp)
        const user = useState<User | null>('firebase-user', () => null)
        const authReady = useState<boolean>('firebase-auth-ready', () => false)

        onAuthStateChanged(auth, (firebaseUser) => {
            user.value = firebaseUser
            authReady.value = true
        })
    },
})
