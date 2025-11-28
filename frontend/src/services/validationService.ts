import { validatePassword as validatePasswordFirebase, type PasswordValidationStatus } from "firebase/auth";
import { auth } from "../firebase/config";

interface ValidatePasswordResult {
    valid: boolean;
    error: string | null;
}

export async function validatePassword(password: string): Promise<ValidatePasswordResult> {
    try {

        const status: PasswordValidationStatus = await validatePasswordFirebase(auth, password);
        console.log(status);
        if (status.isValid) {
            return { valid: true, error: null };
        }

        return { valid: false, error: parsePasswordError(status) };
    } catch (error: any) {
        console.error("Password validation error:", error);
        return { valid: false, error: error.message || "An unexpected error occurred during validation." };
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