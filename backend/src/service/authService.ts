import { FIREBASE_API_KEY } from "../config/enviroments";
import { auth } from "../db/firebaseAdmin";
import { RegisterUserRequest, LoginRequest, LoginResponse } from "../types/auth";
import { httpService } from "./httpService";



export async function registerUser({ email, password, displayName }: RegisterUserRequest) {
    await auth.createUser({
        email,
        password,
        displayName,
    })
}

export async function login({ email, password }: LoginRequest): Promise<LoginResponse> {
    const apiKey = FIREBASE_API_KEY;
    if (!apiKey) throw new Error("FIREBASE_API_KEY no configurada")

    const data = await httpService.POST(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        { email, password, returnSecureToken: true }
    )
    return {
        uid: data.localId,
        displayName: data.displayName,
        email: data.email,
        authToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn
    }
}   