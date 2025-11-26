import { HttpError } from "../errors/HttpError";
import { RegisterUserRequest } from "../types/auth";
import { PublicUser, UserDocument } from "../types/user";
import { db } from "../db/firebaseAdmin";

export async function isUsernameTaken(username: string): Promise<boolean> {
    const userDocs = await db.collection("users").where("username", "==", username).get();
    return !userDocs.empty;
}

export async function registerUser({ uid, email, username }: RegisterUserRequest): Promise<UserDocument> {
    if (!uid || !email || !username) throw new HttpError(400, "Please, provide all the required fields")

    if (await isUsernameTaken(username)) throw new HttpError(409, "Username already exists")

    const userDocument: UserDocument = {
        email,
        username: username,
        role: "USER",
        createdAt: new Date(),
    }
    await db.collection("users").doc(uid).set(userDocument)
    return userDocument;
}

export function getPublicUser(user: UserDocument): PublicUser {
    return {
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
    }
}
