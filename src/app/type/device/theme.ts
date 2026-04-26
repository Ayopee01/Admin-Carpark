export type ThemeConfig = {
    themeName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
    updatedAt: string;
};

export type ThemePayload = {
    themeName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
};

export type ThemeUploadLogoResponse = {
    message?: string;
    logoUrl?: string | null;
    url?: string | null;
    theme?: ThemeConfig;
    data?: {
        logoUrl?: string | null;
        url?: string | null;
    };
};