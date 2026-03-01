import { validatePassword as validatePasswordFirebase, type PasswordValidationStatus } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";

interface ValidatePasswordResult {
    valid: boolean;
    error: string | null;
}

export async function validatePassword(password: string): Promise<ValidatePasswordResult> {
    try {

        const status: PasswordValidationStatus = await validatePasswordFirebase(auth, password);

        if (status.isValid) {
            return { valid: true, error: null };
        }

        return { valid: false, error: parsePasswordError(status) };
    } catch (error: unknown) {
        console.error("Password validation error:", error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred during validation.";
        return { valid: false, error: message };
    }
}

function parsePasswordError(status: PasswordValidationStatus): string {
    if (!status.meetsMinPasswordLength) {
        return "Password does not meet the minimum length requirement.";
    }
    if (!status.containsLowercaseLetter) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!status.containsUppercaseLetter) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!status.containsNumericCharacter) {
        return "Password must contain at least one number.";
    }
    if (!status.containsNonAlphanumericCharacter) {
        return "Password must contain at least one special character.";
    }

    return "Password does not meet the requirements.";
}

export async function validateUsernameAvailability(username: string): Promise<boolean> {
    try {
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    } catch (error) {
        console.error("Error checking username availability:", error);
        throw new Error("Failed to validate username availability");
    }
}