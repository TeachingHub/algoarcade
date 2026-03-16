export interface TSPMedals {
    gold: number;
    silver: number;
    bronze: number;
}

export interface UserProfileData {
    username: string;
    email: string;
    role: "USER" | "ADMIN"; 
    profilePic: string;
    createdAt: any;
    tspMedals?: TSPMedals;
}