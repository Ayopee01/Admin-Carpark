"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type {
    ThemeConfig,
    ThemePayload,
    ThemeUploadLogoResponse,
} from "@/src/app/type/device/theme";

const DEFAULT_THEME: ThemeConfig = {
    themeName: "default",
    primaryColor: "#1D4ED8",
    secondaryColor: "#0F172A",
    accentColor: "#22C55E",
    logoUrl: null,
    updatedAt: "",
};

type ThemePreset = {
    name: string;
    themeName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
};

const FRONTEND_THEME_PRESETS: ThemePreset[] = [
    {
        name: "Dark",
        themeName: "dark",
        primaryColor: "#0F172A",
        secondaryColor: "#1E293B",
        accentColor: "#22C55E",
    },
    {
        name: "Blue",
        themeName: "blue",
        primaryColor: "#1D4ED8",
        secondaryColor: "#0F172A",
        accentColor: "#38BDF8",
    },
    {
        name: "Green",
        themeName: "green",
        primaryColor: "#16A34A",
        secondaryColor: "#14532D",
        accentColor: "#FACC15",
    },
];

function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function getErrorMessage(value: unknown, fallback: string) {
    if (
        value &&
        typeof value === "object" &&
        "message" in value &&
        typeof value.message === "string"
    ) {
        return value.message;
    }

    return fallback;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getThemeFromResult(result: unknown): Partial<ThemeConfig> | null {
    if (!isObject(result)) return null;

    if (isObject(result.theme)) {
        return result.theme as Partial<ThemeConfig>;
    }

    return result as Partial<ThemeConfig>;
}

function normalizeTheme(value?: Partial<ThemeConfig> | null): ThemeConfig {
    return {
        themeName: value?.themeName ?? DEFAULT_THEME.themeName,
        primaryColor: value?.primaryColor ?? DEFAULT_THEME.primaryColor,
        secondaryColor: value?.secondaryColor ?? DEFAULT_THEME.secondaryColor,
        accentColor: value?.accentColor ?? DEFAULT_THEME.accentColor,
        logoUrl: value?.logoUrl ?? null,
        updatedAt: value?.updatedAt ?? "",
    };
}

function toThemePayload(theme: ThemeConfig): ThemePayload {
    return {
        themeName: theme.themeName,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        logoUrl: theme.logoUrl,
    };
}

function getUploadedLogoUrl(result: ThemeUploadLogoResponse | null) {
    return (
        result?.logoUrl ??
        result?.url ??
        result?.data?.logoUrl ??
        result?.data?.url ??
        result?.theme?.logoUrl ??
        null
    );
}

function ThemeColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="rounded-xl bg-[#E6EEF4] p-4">
            <div className="text-[12px] font-semibold text-[#667085]">{label}</div>

            <div className="mt-3 flex items-center gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border-none bg-transparent p-0"
                />

                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 flex-1 rounded-md border border-[#D0D5DD] bg-white px-3 text-[14px] font-medium text-[#1F2937] outline-none"
                />
            </div>
        </div>
    );
}

function ThemeSettingContent() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
    const [draft, setDraft] = useState<ThemeConfig>(DEFAULT_THEME);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function fetchTheme() {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch("/api/devices/theme", {
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

            const nextTheme = normalizeTheme(getThemeFromResult(result));

            setTheme(nextTheme);
            setDraft(nextTheme);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTheme();
    }, []);

    async function handleSave() {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch("/api/devices/theme", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(toThemePayload(draft)),
            });

            const result: unknown = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "บันทึกธีมไม่สำเร็จ"));
            }

            const updatedTheme = normalizeTheme(getThemeFromResult(result) ?? draft);

            setTheme(updatedTheme);
            setDraft(updatedTheme);
            setSuccess("บันทึกธีมสำเร็จ");
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setDraft(theme);
        setError("");
        setSuccess("");
    }

    function handleSelectPreset(preset: ThemePreset) {
        setDraft((prev) => ({
            ...prev,
            themeName: preset.themeName,
            primaryColor: preset.primaryColor,
            secondaryColor: preset.secondaryColor,
            accentColor: preset.accentColor,
        }));
    }

    function handleSelectDefaultTheme() {
        setDraft(theme);
    }

    async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) return;

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

            const response = await fetch("/api/devices/theme/upload-logo", {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });

            const result: ThemeUploadLogoResponse | null = await response
                .json()
                .catch(() => null);

            if (!response.ok) {
                throw new Error(getErrorMessage(result, "อัปโหลดโลโก้ไม่สำเร็จ"));
            }

            const logoUrl = getUploadedLogoUrl(result);

            if (!logoUrl) {
                throw new Error("อัปโหลดสำเร็จ แต่ไม่พบ logoUrl จาก API");
            }

            if (result?.theme) {
                const nextTheme = normalizeTheme(result.theme);

                setTheme(nextTheme);
                setDraft(nextTheme);
            } else {
                setDraft((prev) => ({
                    ...prev,
                    logoUrl,
                }));
            }

            setSuccess("อัปโหลดโลโก้สำเร็จ");
        } catch (err) {
            setError(err instanceof Error ? err.message : "อัปโหลดโลโก้ไม่สำเร็จ");
        } finally {
            setUploadingLogo(false);
        }
    }

    function handleRemoveLogo() {
        setDraft((prev) => ({
            ...prev,
            logoUrl: null,
        }));
        setError("");
        setSuccess("");
    }

    const themeCards = useMemo(
        () => [
            {
                name: "Default",
                themeName: theme.themeName,
                primaryColor: theme.primaryColor,
                secondaryColor: theme.secondaryColor,
                accentColor: theme.accentColor,
                isDefaultFromApi: true,
            },
            ...FRONTEND_THEME_PRESETS.map((preset) => ({
                name: preset.name,
                themeName: preset.themeName,
                primaryColor: preset.primaryColor,
                secondaryColor: preset.secondaryColor,
                accentColor: preset.accentColor,
                isDefaultFromApi: false,
            })),
        ],
        [theme]
    );

    if (loading) {
        return (
            <>
                <h2 className="mb-6 flex items-center gap-3 text-[20px] font-extrabold text-[#2B3640]">
                    <span className="h-6 w-1 rounded-full bg-[#1F2933]" />
                    การตั้งค่าธีม
                </h2>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-h-[360px] animate-pulse rounded-2xl bg-[#E4E6E8]" />
                    <div className="min-h-[360px] animate-pulse rounded-[24px] bg-[#E4E6E8]" />
                </div>
            </>
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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-2xl bg-[#F8F8F8] p-6">
                    <div className="text-[18px] font-extrabold text-[#2B3640]">
                        ธีมที่มีอยู่
                    </div>

                    <div className="mt-5 flex flex-wrap gap-4">
                        {themeCards.map((item) => {
                            const isActive =
                                draft.themeName === item.themeName &&
                                draft.primaryColor === item.primaryColor &&
                                draft.secondaryColor === item.secondaryColor &&
                                draft.accentColor === item.accentColor;

                            return (
                                <button
                                    key={`${item.name}-${item.themeName}`}
                                    type="button"
                                    onClick={() =>
                                        item.isDefaultFromApi
                                            ? handleSelectDefaultTheme()
                                            : handleSelectPreset({
                                                name: item.name,
                                                themeName: item.themeName,
                                                primaryColor: item.primaryColor,
                                                secondaryColor: item.secondaryColor,
                                                accentColor: item.accentColor,
                                            })
                                    }
                                    className={`rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${isActive
                                            ? "border-[#0D1B2A] bg-white shadow-sm"
                                            : "border-transparent bg-[#E9EAEC]"
                                        }`}
                                >
                                    <div className="flex gap-2">
                                        <span
                                            className="h-8 w-8 rounded"
                                            style={{ backgroundColor: item.primaryColor }}
                                        />
                                        <span
                                            className="h-8 w-8 rounded"
                                            style={{ backgroundColor: item.secondaryColor }}
                                        />
                                        <span
                                            className="h-8 w-8 rounded"
                                            style={{ backgroundColor: item.accentColor }}
                                        />
                                    </div>

                                    <div className="mt-3 text-[13px] font-semibold">
                                        {item.name}
                                    </div>

                                    {item.isDefaultFromApi ? (
                                        <div className="mt-1 text-[11px] text-[#667085]">
                                            จาก API
                                        </div>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 rounded-2xl border border-[#E0E2E6] bg-white p-6">
                        <div className="mb-5 text-center text-[20px] font-extrabold text-[#2B3640]">
                            ตั้งค่าชุดสีหลัก
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <ThemeColorField
                                label="สีหลัก (PRIMARY)"
                                value={draft.primaryColor}
                                onChange={(value) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        primaryColor: value,
                                    }))
                                }
                            />

                            <ThemeColorField
                                label="สีรอง (SECONDARY)"
                                value={draft.secondaryColor}
                                onChange={(value) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        secondaryColor: value,
                                    }))
                                }
                            />

                            <ThemeColorField
                                label="สีเน้น (ACCENT)"
                                value={draft.accentColor}
                                onChange={(value) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        accentColor: value,
                                    }))
                                }
                            />

                            <div className="rounded-xl bg-[#E6EEF4] p-4">
                                <div className="text-[12px] font-semibold text-[#667085]">
                                    LOGO
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />

                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="h-10 rounded-md bg-[#0D1B2A] px-4 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {uploadingLogo
                                            ? "กำลังอัปโหลด..."
                                            : "อัปโหลดรูปภาพ"}
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
                    </div>
                </div>

                <div className="rounded-[24px] border border-[#667085] bg-[#F8F8F8] p-5">
                    <div className="text-[24px] font-extrabold text-[#2B3640]">
                        ตัวอย่าง
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
                                    style={{ backgroundColor: draft.accentColor }}
                                />
                            )}

                            <div className="mb-2 h-3 rounded bg-[#F3F4F6]" />
                            <div className="mb-2 h-3 w-3/4 rounded bg-[#F3F4F6]" />

                            <div
                                className="rounded-xl p-8"
                                style={{ backgroundColor: `${draft.primaryColor}20` }}
                            >
                                <div
                                    className="mx-auto h-14 w-14 rounded-b-2xl border-[4px] border-t-0"
                                    style={{ borderColor: draft.secondaryColor }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        style={{ backgroundColor: draft.primaryColor }}
                        className="mt-5 w-full rounded-xl px-4 py-4 text-[16px] font-bold text-white transition hover:opacity-90"
                    >
                        ตัวอย่าง Primary
                    </button>

                    <button
                        type="button"
                        style={{ backgroundColor: draft.accentColor }}
                        className="mt-3 w-full rounded-xl px-4 py-4 text-[16px] font-bold text-white transition hover:opacity-90"
                    >
                        ตัวอย่าง Accent
                    </button>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || uploadingLogo}
                            style={{ backgroundColor: draft.secondaryColor }}
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