export interface UserProfileData {
    username: string;
    email: string;
    role: "USER" | "ADMIN"; 
    profilePic: string;
    createdAt: any;
}