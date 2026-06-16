"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
type ThemeMode = "theme1" | "theme2" | "theme3" | "custom";

type ThemeApiResponse = {
    themeColor: string | null;
    logoUrl: string | null;
    configUpdatedAt?: string;
    themeMode?: string | null;
    customThemeColor?: string | null;
    updatedAt?: string;
};

type ThemeState = {
    themeColor: string;
    logoUrl: string | null;
    configUpdatedAt?: string;
    themeMode: ThemeMode;
    customThemeColor: string;
    updatedAt?: string;
};

type ThemePutPayload = {
    themeColor: string;
    themeMode: ThemeMode;
    customThemeColor: string;
};

type ColorOption = {
    mode: ThemeMode;
    title: string;
    subtitle: string;
    color: string;
};

const THEME_API_PATH = "/api/devices/theme";

const DEFAULT_THEME_COLOR = "#FFD54F";
const DEFAULT_CUSTOM_COLOR = "#FFD54F";

const THEME_OPTIONS: Record<ThemeMode, ColorOption> = {
    theme1: {
        mode: "theme1",
        title: "ธีม 01",
        subtitle: DEFAULT_THEME_COLOR,
        color: DEFAULT_THEME_COLOR,
    },
    theme2: {
        mode: "theme2",
        title: "ธีม 02",
        subtitle: "#1D4ED8",
        color: "#1D4ED8",
    },
    theme3: {
        mode: "theme3",
        title: "ธีม 03",
        subtitle: "#047857",
        color: "#047857",
    },
    custom: {
        mode: "custom",
        title: "Custom",
        subtitle: DEFAULT_CUSTOM_COLOR,
        color: DEFAULT_CUSTOM_COLOR,
    },
};

function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function getErrorMessage(value: unknown, fallback: string) {
    if (
        value &&
        typeof value === "object" &&
        "message" in value &&
        typeof (value as { message?: unknown }).message === "string"
    ) {
        return (value as { message: string }).message;
    }

    return fallback;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getThemeFromResult(result: unknown): Partial<ThemeApiResponse> | null {
    if (!isObject(result)) return null;

    if (isObject(result.theme)) {
        return result.theme as Partial<ThemeApiResponse>;
    }

    return result as Partial<ThemeApiResponse>;
}

function isHexColor(value: string) {
    return /^#[0-9A-F]{6}$/i.test(value);
}

function normalizeHexInput(value: string) {
    const cleaned = value.trim().replace(/[^#0-9a-fA-F]/g, "");
    const withoutHash = cleaned.startsWith("#") ? cleaned.slice(1) : cleaned;

    return `#${withoutHash.slice(0, 6).toUpperCase()}`;
}

function normalizeThemeMode(value: unknown, fallback: ThemeMode = "theme1"): ThemeMode {
    if (value === "theme1") return "theme1";
    if (value === "theme2") return "theme2";
    if (value === "theme3") return "theme3";
    if (value === "custom") return "custom";

    return fallback;
}

function normalizeTheme(
    value?: Partial<ThemeApiResponse> | null,
    fallbackMode: ThemeMode = "theme1"
): ThemeState {
    const apiThemeColor = value?.themeColor;
    const apiCustomThemeColor = value?.customThemeColor;
    const themeMode = normalizeThemeMode(value?.themeMode, fallbackMode);
    const customThemeColor =
        typeof apiCustomThemeColor === "string" && isHexColor(apiCustomThemeColor)
            ? apiCustomThemeColor
            : DEFAULT_CUSTOM_COLOR;

    const themeColor =
        themeMode === "custom"
            ? customThemeColor
            : typeof apiThemeColor === "string" && isHexColor(apiThemeColor)
                ? apiThemeColor
                : THEME_OPTIONS[themeMode].color;

    return {
        themeColor,
        logoUrl: typeof value?.logoUrl === "string" ? value.logoUrl : null,
        configUpdatedAt:
            typeof value?.configUpdatedAt === "string"
                ? value.configUpdatedAt
                : undefined,
        themeMode,
        customThemeColor,
        updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : undefined,
    };
}

function toThemePutPayload(theme: ThemeState): ThemePutPayload {
    return {
        themeColor: theme.themeColor,
        themeMode: theme.themeMode,
        customThemeColor: theme.customThemeColor,
    };
}

function getUploadedLogoUrl(result: unknown) {
    if (!isObject(result)) return null;

    if (typeof result.logoUrl === "string") return result.logoUrl;
    if (typeof result.url === "string") return result.url;

    if (isObject(result.data)) {
        if (typeof result.data.logoUrl === "string") return result.data.logoUrl;
        if (typeof result.data.url === "string") return result.data.url;
    }

    if (isObject(result.theme) && typeof result.theme.logoUrl === "string") {
        return result.theme.logoUrl;
    }

    return null;
}

function getThemeOptionColor(mode: ThemeMode, customColor: string) {
    if (mode === "custom") {
        return isHexColor(customColor) ? customColor : DEFAULT_CUSTOM_COLOR;
    }

    return THEME_OPTIONS[mode].color;
}

function applyThemeColorToRoot(themeColor: string) {
    if (typeof document === "undefined") return;
    if (!isHexColor(themeColor)) return;

    const root = document.documentElement;

    root.style.setProperty("--theme", themeColor);
    root.style.setProperty("--keyboard-confirm", themeColor);
}

type ThemeOptionCardProps = {
    title: string;
    subtitle: string;
    color: string;
    selected: boolean;
    active: boolean;
    onClick: () => void;
};

function ThemeOptionCard({
    title,
    subtitle,
    color,
    selected,
    active,
    onClick,
}: ThemeOptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-h-[108px] rounded-[14px] border bg-[#E9EEF3] px-4 py-3 text-left transition ${selected
                ? "border-[#0D1B2A] shadow-[0_0_0_1px_#0D1B2A]"
                : "border-transparent hover:border-[#CBD5E1]"
                }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div
                    className="h-7 w-[84px] rounded-[4px] border border-white/80 shadow-sm"
                    style={{ backgroundColor: color }}
                />

                {active ? (
                    <span className="rounded-md bg-[#DCE6F2] px-2 py-1 text-[10px] font-bold text-[#4B5563]">
                        ใช้งานอยู่
                    </span>
                ) : null}
            </div>

            <div className="mt-4 text-[14px] font-extrabold text-[#2B3640]">
                {title}
            </div>

            <div className="mt-1 text-[12px] font-semibold text-[#6B7280]">
                {subtitle}
            </div>
        </button>
    );
}

type CustomColorEditorProps = {
    value: string;
    onChange: (value: string) => void;
};

function CustomColorEditor({ value, onChange }: CustomColorEditorProps) {
    const safeColor = isHexColor(value) ? value : DEFAULT_CUSTOM_COLOR;

    function handleChange(nextValue: string) {
        onChange(normalizeHexInput(nextValue));
    }

    return (
        <div className="rounded-[24px] border border-[#D8DEE5] bg-white p-6">
            <div className="mb-6 text-center text-[18px] font-extrabold text-[#2B3640] md:text-[20px]">
                เลือกสีหลัก 1 สี
            </div>

            <div className="rounded-[16px] bg-[#E9EEF3] p-4">
                <div className="text-[12px] font-semibold text-[#667085]">
                    สี Custom
                </div>

                <div className="mt-3 flex items-center gap-3">
                    <input
                        type="color"
                        value={safeColor}
                        onChange={(event) =>
                            handleChange(event.target.value.toUpperCase())
                        }
                        className="h-11 w-11 shrink-0 cursor-pointer rounded-[6px] border border-white bg-transparent p-0 shadow-sm"
                        aria-label="เลือกสี Custom"
                    />

                    <input
                        value={value}
                        onChange={(event) => handleChange(event.target.value)}
                        placeholder="#FFD54F"
                        className={`h-11 flex-1 rounded-[10px] border bg-white px-4 text-[15px] font-semibold outline-none ${isHexColor(value)
                            ? "border-[#D0D5DD] text-[#1F2937]"
                            : "border-red-300 text-red-600"
                            }`}
                    />
                </div>

                {!isHexColor(value) ? (
                    <div className="mt-3 text-[12px] font-semibold text-red-500">
                        กรุณากรอกค่าสีแบบ HEX เช่น #FFD54F
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ThemeSettingContent() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [theme, setTheme] = useState<ThemeState | null>(null);
    const [draft, setDraft] = useState<ThemeState | null>(null);

    const [selectedThemeMode, setSelectedThemeMode] =
        useState<ThemeMode>("theme1");
    const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function fetchTheme(showLoading = true) {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch(THEME_API_PATH, {
                method: "GET",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                cache: "no-store",
            });

            const result: unknown = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "โหลดข้อมูลธีมไม่สำเร็จ"));
            }

            const latestTheme = normalizeTheme(getThemeFromResult(result));

            setTheme(latestTheme);
            setDraft(latestTheme);

            setSelectedThemeMode(latestTheme.themeMode);
            setCustomColor(latestTheme.customThemeColor);

            applyThemeColorToRoot(latestTheme.themeColor);
            return latestTheme;
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
            return null;
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        fetchTheme();
    }, []);

    const colorOptions = useMemo<ColorOption[]>(() => {
        const safeCustomColor = isHexColor(customColor)
            ? customColor
            : DEFAULT_CUSTOM_COLOR;

        return [
            THEME_OPTIONS.theme1,
            THEME_OPTIONS.theme2,
            THEME_OPTIONS.theme3,
            {
                ...THEME_OPTIONS.custom,
                subtitle: safeCustomColor,
                color: safeCustomColor,
            },
        ];
    }, [customColor]);

    function handleSelectThemeMode(mode: ThemeMode) {
        if (!draft) return;

        const nextColor = getThemeOptionColor(mode, customColor);

        setSelectedThemeMode(mode);
        setError("");
        setSuccess("");

        setDraft({
            ...draft,
            themeColor: nextColor,
            themeMode: mode,
            customThemeColor:
                mode === "custom" && isHexColor(nextColor)
                    ? nextColor
                    : draft.customThemeColor,
        });

        if (mode === "custom") {
            setCustomColor(nextColor);
        }

        applyThemeColorToRoot(nextColor);
    }

    function handleCustomColorChange(value: string) {
        if (!draft) return;

        setCustomColor(value);
        setSelectedThemeMode("custom");
        setError("");
        setSuccess("");

        if (isHexColor(value)) {
            setDraft({
                ...draft,
                themeColor: value,
                themeMode: "custom",
                customThemeColor: value,
            });

            applyThemeColorToRoot(value);
        }
    }

    async function handleSave() {
        if (!draft) return;

        if (selectedThemeMode === "custom" && !isHexColor(customColor)) {
            setError("กรุณาระบุค่าสี Custom ให้ถูกต้อง เช่น #FFD54F");
            return;
        }

        if (!isHexColor(draft.themeColor)) {
            setError("กรุณาเลือกค่าสีให้ถูกต้อง เช่น #FFD54F");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const payload = toThemePutPayload(draft);

            const response = await fetch(THEME_API_PATH, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const result: unknown = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "บันทึกธีมไม่สำเร็จ"));
            }

            const responseTheme = getThemeFromResult(result);
            const updatedTheme = normalizeTheme(
                responseTheme
                    ? {
                        ...draft,
                        ...responseTheme,
                        customThemeColor:
                            responseTheme.customThemeColor ?? draft.customThemeColor,
                    }
                    : draft,
                draft.themeMode
            );

            setTheme((prev) => ({
                themeColor: updatedTheme.themeColor,
                logoUrl: prev?.logoUrl ?? updatedTheme.logoUrl ?? null,
                configUpdatedAt: updatedTheme.configUpdatedAt,
                themeMode: updatedTheme.themeMode,
                customThemeColor: updatedTheme.customThemeColor,
                updatedAt: updatedTheme.updatedAt,
            }));

            setDraft((prev) => ({
                themeColor: updatedTheme.themeColor,
                logoUrl: prev?.logoUrl ?? updatedTheme.logoUrl ?? null,
                configUpdatedAt: updatedTheme.configUpdatedAt,
                themeMode: updatedTheme.themeMode,
                customThemeColor: updatedTheme.customThemeColor,
                updatedAt: updatedTheme.updatedAt,
            }));

            setSelectedThemeMode(updatedTheme.themeMode);
            setCustomColor(updatedTheme.customThemeColor);

            applyThemeColorToRoot(updatedTheme.themeColor);
            setSuccess("บันทึกธีมสำเร็จ");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        if (!theme) return;

        setDraft(theme);
        setSelectedThemeMode(theme.themeMode);
        setCustomColor(theme.customThemeColor);

        setError("");
        setSuccess("");
        applyThemeColorToRoot(theme.themeColor);
    }

    async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
        const currentTheme = theme;
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file || !currentTheme) return;

        if (!file.type.startsWith("image/")) {
            setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
            return;
        }

        try {
            setUploadingLogo(true);
            setError("");
            setSuccess("");

            const token = getToken();
            const formData = new FormData();

            formData.append("logo", file);

            const response = await fetch(`${THEME_API_PATH}/upload-logo`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            const result: unknown = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "อัปโหลดโลโก้ไม่สำเร็จ"));
            }

            const logoUrl = getUploadedLogoUrl(result);

            if (!logoUrl) {
                throw new Error("อัปโหลดสำเร็จ แต่ไม่พบ logoUrl จาก API");
            }

            setTheme((prev) =>
                prev
                    ? {
                        ...prev,
                        logoUrl,
                    }
                    : prev
            );

            setDraft((prev) =>
                prev
                    ? {
                        ...prev,
                        logoUrl,
                    }
                    : prev
            );

            setSuccess("อัปโหลดโลโก้สำเร็จ");
            await fetchTheme();
        } catch (err) {
            setError(err instanceof Error ? err.message : "อัปโหลดโลโก้ไม่สำเร็จ");
        } finally {
            setUploadingLogo(false);
        }
    }

    async function handleRemoveLogo() {
        const currentTheme = theme;

        if (!currentTheme) return;

        try {
            setUploadingLogo(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch(
                `${THEME_API_PATH}/logo`,
                {
                    method: "DELETE",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const result: unknown = await response.json().catch(() => null);

            if (!response.ok && response.status !== 204) {
                throw new Error(getErrorMessage(result, "ลบโลโก้ไม่สำเร็จ"));
            }

            setTheme((prev) =>
                prev
                    ? {
                        ...prev,
                        logoUrl: null,
                    }
                    : prev
            );

            setDraft((prev) =>
                prev
                    ? {
                        ...prev,
                        logoUrl: null,
                    }
                    : prev
            );

            setSuccess("ลบโลโก้สำเร็จ");
            await fetchTheme();
        } catch (err) {
            setError(err instanceof Error ? err.message : "ลบโลโก้ไม่สำเร็จ");
        } finally {
            setUploadingLogo(false);
        }
    }

    if (loading) {
        return (
            <>
                <h2 className="mb-6 flex items-center gap-3 text-[20px] font-extrabold text-[#2B3640]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    การตั้งค่าธีม
                </h2>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="min-h-[360px] animate-pulse rounded-2xl bg-[#E4E6E8]" />
                    <div className="min-h-[360px] animate-pulse rounded-[24px] bg-[#E4E6E8]" />
                </div>
            </>
        );
    }

    if (!theme || !draft) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                ไม่พบข้อมูลธีมจาก API
            </div>
        );
    }

    return (
        <>
            <h2 className="mb-6 flex items-center gap-3 text-[20px] font-extrabold text-[#2B3640]">
                <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                การตั้งค่าธีม
            </h2>

            {error ? (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                    {success}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="rounded-2xl bg-[#F8F8F8] p-6">
                    <div className="text-[18px] font-extrabold text-[#2B3640]">
                        ธีมที่มีอยู่
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {colorOptions.map((option) => (
                            <ThemeOptionCard
                                key={option.mode}
                                title={option.title}
                                subtitle={option.subtitle}
                                color={option.color}
                                selected={selectedThemeMode === option.mode}
                                active={theme.themeMode === option.mode}
                                onClick={() => handleSelectThemeMode(option.mode)}
                            />
                        ))}
                    </div>

                    {selectedThemeMode === "custom" ? (
                        <div className="mt-8">
                            <CustomColorEditor
                                value={customColor}
                                onChange={handleCustomColorChange}
                            />
                        </div>
                    ) : null}

                    <div className="mt-8 rounded-2xl border border-[#E0E2E6] bg-white p-6">
                        <div className="mb-5 text-[18px] font-extrabold text-[#2B3640]">
                            โลโก้
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingLogo}
                                className="h-10 rounded-md bg-[#0D1B2A] px-4 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {uploadingLogo ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
                            </button>

                            {draft.logoUrl ? (
                                <button
                                    type="button"
                                    onClick={handleRemoveLogo}
                                    disabled={uploadingLogo}
                                    className="h-10 rounded-md border border-[#D0D5DD] bg-white px-4 text-[13px] font-semibold text-[#667085] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    ลบโลโก้
                                </button>
                            ) : null}
                        </div>

                        {draft.logoUrl ? (
                            <div className="mt-4 rounded-lg border border-[#D0D5DD] bg-white p-3">
                                <img
                                    src={draft.logoUrl}
                                    alt="Logo preview"
                                    className="h-16 max-w-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="mt-4 rounded-lg border border-dashed border-[#C7CDD5] bg-white px-3 py-5 text-center text-[12px] text-[#98A2B3]">
                                ยังไม่มีโลโก้
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-[24px] border border-[#667085] bg-[#F8F8F8] p-5">
                    <div className="text-[24px] font-extrabold text-[#2B3640]">
                        ตัวอย่าง
                    </div>

                    <div className="mt-2 text-[13px] font-semibold text-[#667085]">
                        สีที่เลือก: {draft.themeColor}
                    </div>

                    <div className="mt-5 rounded-xl bg-[#EFEFEF] p-4">
                        <div className="rounded-xl bg-white p-4">
                            {draft.logoUrl ? (
                                <img
                                    src={draft.logoUrl}
                                    alt="Logo preview"
                                    className="mb-4 h-10 max-w-full object-contain"
                                />
                            ) : (
                                <div
                                    className="mb-4 h-3 w-32 rounded-full"
                                    style={{ backgroundColor: draft.themeColor }}
                                />
                            )}

                            <div className="mb-2 h-3 rounded bg-[#F3F4F6]" />
                            <div className="mb-2 h-3 w-3/4 rounded bg-[#F3F4F6]" />

                            <div
                                className="rounded-xl p-8"
                                style={{ backgroundColor: `${draft.themeColor}20` }}
                            >
                                <div
                                    className="mx-auto h-14 w-14 rounded-b-2xl border-[4px] border-t-0"
                                    style={{ borderColor: draft.themeColor }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        style={{ backgroundColor: draft.themeColor }}
                        className="mt-5 w-full rounded-xl px-4 py-4 text-[16px] font-bold text-white transition hover:opacity-90"
                    >
                        ตัวอย่าง Theme
                    </button>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || uploadingLogo}
                            style={{ backgroundColor: draft.themeColor }}
                            className="flex-1 rounded-full px-4 py-3 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "กำลังบันทึก..." : "บันทึก"}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={saving || uploadingLogo}
                            className="flex-1 rounded-full bg-[#9CA3AF] px-4 py-3 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ThemeSettingContent;
