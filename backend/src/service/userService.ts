import { db, auth } from "../db/firebaseAdmin";
import { HttpError } from "../errors/HttpError";

export async function updateUser(uid: string, username?: string) {
    if (!uid) throw new HttpError(400, "UID is required");

    if (username) {
        const userDocs = await db.collection("users").where("username", "==", username).get();
        if (!userDocs.empty) {
            const doc = userDocs.docs[0];
            if (doc.id !== uid) {
                throw new HttpError(409, "Username already taken");
            }
        }
    }

    await db.collection("users").doc(uid).update({
        ...(username && { username })
    });
    if (username) {
        await auth.updateUser(uid, { displayName: username });
    }

    return { message: "User updated successfully" };
}

export async function deleteUser(uid: string) {
    if (!uid) throw new HttpError(400, "UID is required");

    await db.collection("users").doc(uid).delete();
    await auth.deleteUser(uid);

    return { message: "User deleted successfully" };
}
