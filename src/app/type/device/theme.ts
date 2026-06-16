export type ThemeConfig = {
    themeColor: string | null;
    logoUrl: string | null;
    configUpdatedAt: string | null;
    themeMode?: string | null;
    customThemeColor?: string | null;
    updatedAt?: string;
};

export type ThemePayload = {
    themeColor: string;
    themeMode?: string;
    customThemeColor?: string | null;
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

export type ThemeDeleteLogoResponse = {
    message?: string;
    logoUrl?: string | null;
    theme?: ThemeConfig;
};
