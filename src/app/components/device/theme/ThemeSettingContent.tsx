"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

type PresetKey = "preset1" | "preset2" | "preset3" | "preset4";

type ThemePreset = {
    themeColor: string;
};

type ThemePresets = Record<PresetKey, ThemePreset>;

type ThemeApiConfig = {
    themeColor: string;
    logoUrl: string | null;
    themeName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    updatedAt?: string;
    method?: string;
    action?: string;
    presets: ThemePresets;
};

type ThemePutPayload = {
    themeColor: string;
    logoUrl: string | null;
    presets: {
        preset4: {
            themeColor: string;
        };
    };
};

type ColorOption = {
    key: PresetKey;
    title: string;
    subtitle: string;
    color: string;
};

const THEME_API_PATH = "/api/devices/theme";

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

function getThemeFromResult(result: unknown): Partial<ThemeApiConfig> | null {
    if (!isObject(result)) return null;

    if (isObject(result.theme)) {
        return result.theme as Partial<ThemeApiConfig>;
    }

    return result as Partial<ThemeApiConfig>;
}

function isHexColor(value: string) {
    return /^#[0-9A-F]{6}$/i.test(value);
}

function normalizeHexInput(value: string) {
    const cleaned = value.trim().replace(/[^#0-9a-fA-F]/g, "");
    const withoutHash = cleaned.startsWith("#") ? cleaned.slice(1) : cleaned;

    return `#${withoutHash.slice(0, 6).toUpperCase()}`;
}

function normalizeTheme(value?: Partial<ThemeApiConfig> | null): ThemeApiConfig {
    if (!value?.themeColor || !isHexColor(value.themeColor)) {
        throw new Error("ข้อมูล themeColor จาก API ไม่ถูกต้อง");
    }

    if (!value.presets || !isObject(value.presets)) {
        throw new Error("ข้อมูล presets จาก API ไม่ครบ");
    }

    const preset1 = value.presets.preset1?.themeColor;
    const preset2 = value.presets.preset2?.themeColor;
    const preset3 = value.presets.preset3?.themeColor;
    const preset4 = value.presets.preset4?.themeColor;

    if (
        !isHexColor(preset1 ?? "") ||
        !isHexColor(preset2 ?? "") ||
        !isHexColor(preset3 ?? "") ||
        !isHexColor(preset4 ?? "")
    ) {
        throw new Error("ค่าสีใน presets จาก API ไม่ถูกต้อง");
    }

    return {
        themeColor: value.themeColor,
        logoUrl: typeof value.logoUrl === "string" ? value.logoUrl : null,
        themeName: value.themeName,
        primaryColor: value.primaryColor,
        secondaryColor: value.secondaryColor,
        accentColor: value.accentColor,
        updatedAt: value.updatedAt,
        method: value.method,
        action: value.action,
        presets: {
            preset1: {
                themeColor: preset1 as string,
            },
            preset2: {
                themeColor: preset2 as string,
            },
            preset3: {
                themeColor: preset3 as string,
            },
            preset4: {
                themeColor: preset4 as string,
            },
        },
    };
}

function toThemePutPayload(theme: ThemeApiConfig, customColor: string): ThemePutPayload {
    return {
        themeColor: theme.themeColor,
        logoUrl: theme.logoUrl,
        presets: {
            preset4: {
                themeColor: customColor,
            },
        },
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

function getActivePresetKey(theme: ThemeApiConfig): PresetKey {
    const matchedPreset = Object.entries(theme.presets).find(
        ([, preset]) =>
            preset.themeColor.toLowerCase() === theme.themeColor.toLowerCase()
    );

    return (matchedPreset?.[0] as PresetKey | undefined) ?? "preset1";
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
    active: boolean;
    onClick: () => void;
};

function ThemeOptionCard({
    title,
    subtitle,
    color,
    active,
    onClick,
}: ThemeOptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`min-h-[108px] rounded-[14px] border bg-[#E9EEF3] px-4 py-3 text-left transition ${active
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
    const safeColor = isHexColor(value) ? value : "#000000";

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
                    สี Custom ของ Preset 4
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
                        placeholder="#000000"
                        className={`h-11 flex-1 rounded-[10px] border bg-white px-4 text-[15px] font-semibold outline-none ${isHexColor(value)
                                ? "border-[#D0D5DD] text-[#1F2937]"
                                : "border-red-300 text-red-600"
                            }`}
                    />
                </div>

                {!isHexColor(value) ? (
                    <div className="mt-3 text-[12px] font-semibold text-red-500">
                        กรุณากรอกค่าสีแบบ HEX เช่น #000000
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ThemeSettingContent() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [theme, setTheme] = useState<ThemeApiConfig | null>(null);
    const [draft, setDraft] = useState<ThemeApiConfig | null>(null);

    const [selectedPresetKey, setSelectedPresetKey] =
        useState<PresetKey>("preset1");
    const [customColor, setCustomColor] = useState("");

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

            const nextTheme = normalizeTheme(getThemeFromResult(result));
            const activePresetKey = getActivePresetKey(nextTheme);

            setTheme(nextTheme);
            setDraft(nextTheme);
            setSelectedPresetKey(activePresetKey);
            setCustomColor(nextTheme.presets.preset4.themeColor);
            applyThemeColorToRoot(nextTheme.themeColor);
        } catch (err) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTheme();
    }, []);

    const colorOptions = useMemo<ColorOption[]>(() => {
        if (!draft) return [];

        return [
            {
                key: "preset1",
                title: "ธีม 01",
                subtitle: draft.presets.preset1.themeColor,
                color: draft.presets.preset1.themeColor,
            },
            {
                key: "preset2",
                title: "ธีม 02",
                subtitle: draft.presets.preset2.themeColor,
                color: draft.presets.preset2.themeColor,
            },
            {
                key: "preset3",
                title: "ธีม 03",
                subtitle: draft.presets.preset3.themeColor,
                color: draft.presets.preset3.themeColor,
            },
            {
                key: "preset4",
                title: "Custom",
                subtitle: draft.presets.preset4.themeColor,
                color: draft.presets.preset4.themeColor,
            },
        ];
    }, [draft]);

    function handleSelectPreset(key: PresetKey) {
        if (!draft) return;

        const nextColor = draft.presets[key].themeColor;

        setSelectedPresetKey(key);
        setError("");
        setSuccess("");

        setDraft({
            ...draft,
            themeColor: nextColor,
        });

        if (key === "preset4") {
            setCustomColor(nextColor);
        }

        applyThemeColorToRoot(nextColor);
    }

    function handleCustomColorChange(value: string) {
        if (!draft) return;

        setCustomColor(value);
        setSelectedPresetKey("preset4");
        setError("");
        setSuccess("");

        if (isHexColor(value)) {
            setDraft({
                ...draft,
                themeColor: value,
                presets: {
                    ...draft.presets,
                    preset4: {
                        themeColor: value,
                    },
                },
            });

            applyThemeColorToRoot(value);
        }
    }

    async function handleSave() {
        if (!draft) return;

        if (!isHexColor(customColor)) {
            setError("กรุณาระบุค่าสี Custom ของ Preset 4 ให้ถูกต้อง เช่น #000000");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const token = getToken();
            const payload = toThemePutPayload(draft, customColor);

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

            const updatedTheme = normalizeTheme(getThemeFromResult(result) ?? draft);
            const activePresetKey = getActivePresetKey(updatedTheme);

            setTheme(updatedTheme);
            setDraft(updatedTheme);
            setSelectedPresetKey(activePresetKey);
            setCustomColor(updatedTheme.presets.preset4.themeColor);
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

        const activePresetKey = getActivePresetKey(theme);

        setDraft(theme);
        setSelectedPresetKey(activePresetKey);
        setCustomColor(theme.presets.preset4.themeColor);
        setError("");
        setSuccess("");
        applyThemeColorToRoot(theme.themeColor);
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

            setDraft((prev) =>
                prev
                    ? {
                        ...prev,
                        logoUrl,
                    }
                    : prev
            );

            setSuccess("อัปโหลดโลโก้แล้ว กดบันทึกเพื่อยืนยัน");
        } catch (err) {
            setError(err instanceof Error ? err.message : "อัปโหลดโลโก้ไม่สำเร็จ");
        } finally {
            setUploadingLogo(false);
        }
    }

    function handleRemoveLogo() {
        setDraft((prev) =>
            prev
                ? {
                    ...prev,
                    logoUrl: null,
                }
                : prev
        );

        setError("");
        setSuccess("ลบโลโก้ในแบบร่างแล้ว กดบันทึกเพื่อยืนยัน");
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
                                key={option.key}
                                title={option.title}
                                subtitle={option.subtitle}
                                color={option.color}
                                active={selectedPresetKey === option.key}
                                onClick={() => handleSelectPreset(option.key)}
                            />
                        ))}
                    </div>

                    {selectedPresetKey === "preset4" ? (
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