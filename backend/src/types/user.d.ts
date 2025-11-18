export type UserDocument = {
        email: string,
        username: string,
        role: UserRole,
        createdAt: Date,
};

export type UserRole = "USER" | "ADMIN";

export type PublicUser = {
    username: string,
    role: UserRole,
    createdAt: Date,    
}