import { FIREBASE_API_KEY } from "../config/enviroments";
import { auth } from "../db/firebaseAdmin";
import { RegisterUserRequest, LoginRequest, LoginResponse, RefreshAuthTokenResponse } from "../types/auth";
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
        user: {
            uid: data.localId,
            displayName: data.displayName,
            email: data.email
        },
        authToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn
    }
}   

export async function logout(authToken: string) {
    const decodedToken = await auth.verifyIdToken(authToken);
    const uid = decodedToken.uid;

    await auth.revokeRefreshTokens(uid)
}

export async function refreshAuthToken(currentRefreshToken: string): Promise<RefreshAuthTokenResponse> {
    const apiKey = FIREBASE_API_KEY;
    if (!apiKey) throw new Error("FIREBASE_API_KEY no configurada")

    const response = await httpService.POST(
      `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: currentRefreshToken,
      }),
      { "Content-Type": "application/x-www-form-urlencoded"}
    )

    return {
      authToken: response.id_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
    }
}