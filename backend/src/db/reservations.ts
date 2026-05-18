export const firebaseAdmin = initializeApp({
    credential: cert(serviceAccount),
})