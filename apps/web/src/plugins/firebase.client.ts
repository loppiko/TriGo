import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { VueFire } from 'vuefire'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const firebaseConfig = config.public.firebase as {
        apiKey: string
        authDomain: string
        projectId: string
        storageBucket: string
        messagingSenderId: string
        appId: string
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const firestore = getFirestore(app)

    nuxtApp.vueApp.use(VueFire, { firebaseApp: app })

    const user = useState<User | null>('firebase-user', () => null)
    const authReady = useState('firebase-auth-ready', () => false)
    onAuthStateChanged(auth, (firebaseUser) => {
        user.value = firebaseUser
        authReady.value = true
    })

    return {
        provide: {
            firebase: app,
            firebaseAuth: auth,
            firebaseFirestore: firestore,
            googleAuthProvider: new GoogleAuthProvider(),
        },
    }
})
