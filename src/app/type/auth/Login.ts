export type LoginResponse = {
    token: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
    };
};