import { FIREBASE_API_KEY } from "../config/enviroments";
import { auth, db } from "../db/firebaseAdmin";
import { HttpError } from "../errors/HttpError";
import { RegisterUserRequest, LoginRequest, LoginResponse, RefreshAuthTokenResponse } from "../types/auth";
import { PublicUser, UserDocument } from "../types/user";
import { httpService } from "./httpService";



export async function registerUser({ email, password, displayName }: RegisterUserRequest): Promise<UserDocument> {
    if (!email || !password || !displayName) throw new HttpError(400, "Please, provide all the required fields")
    const userAlreadyExists = await db.collection("users").where("username", "==", displayName).get();
    if (!userAlreadyExists.empty) throw new HttpError(409, "Username already exists")

    const user = await auth.createUser({
        email,
        password,
        displayName,
    })
    const userDocument: UserDocument = {
        email,
        username: displayName,
        role: "USER",
        createdAt: new Date(),
    }
    await db.collection("users").doc(user.uid).set(userDocument)
    return userDocument;
}

export async function login({ email, password }: LoginRequest): Promise<LoginResponse> {
    const apiKey = FIREBASE_API_KEY;

    const data = await httpService.POST(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        { email, password, returnSecureToken: true }
    )
    const userDocument = (await db.collection("users").doc(data.localId).get()).data() as UserDocument;
    const date = (userDocument.createdAt as any).toDate ? (userDocument.createdAt as any).toDate() : userDocument.createdAt;
    return {
        user: {
            email: data.email,
            username: data.displayName,
            role: userDocument.role,
            createdAt: date,
        },
        authToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn
    }
}

export function getPublicUser(user: UserDocument): PublicUser {
    return {
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
    }
}

export async function logout(authToken: string) {
    const decodedToken = await auth.verifyIdToken(authToken);
    const uid = decodedToken.uid;

    await auth.revokeRefreshTokens(uid)
}

export async function refreshAuthToken(currentRefreshToken: string): Promise<RefreshAuthTokenResponse> {
    const apiKey = FIREBASE_API_KEY;

    const response = await httpService.POST(
        `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
        new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: currentRefreshToken,
        }),
        { "Content-Type": "application/x-www-form-urlencoded" }
    )

    return {
        authToken: response.id_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in,
    }
}