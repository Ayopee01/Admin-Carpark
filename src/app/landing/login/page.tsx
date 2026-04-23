"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiAtSign, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import type {LoginResponse} from "@/src/app/type/auth/Login"

function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const remembered = localStorage.getItem("rememberMe");

        if (token && remembered === "true") {
            router.replace("/landing/dashboard");
        }
    }, [router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = (await res.json().catch(() => null)) as LoginResponse | null;

            if (!res.ok || !data?.token || !data?.user) {
                setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            } else {
                localStorage.removeItem("rememberMe");
            }

            router.push("/landing/dashboard");
        } catch {
            setError("ไม่สามารถเชื่อมต่อระบบได้");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4 py-8">
            <div className="w-full max-w-[520px]">
                <header className="mb-7 flex flex-col items-center text-center">
                    <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#9fd0ff] text-[28px] font-extrabold text-[#10233c] shadow-[0_8px_20px_rgba(80,150,220,0.18)]">
                        P
                    </div>

                    <h1 className="text-[32px] font-extrabold leading-tight text-slate-900">
                        Smart Carpark
                    </h1>

                    <p className="mt-2.5 text-[15px] text-gray-500">
                        ระบบบริหารลานจอดรถ
                    </p>
                </header>

                <div className="relative overflow-hidden rounded-[14px] bg-white px-8 py-7 shadow-[0_10px_30px_rgba(15,23,42,0.08)] max-sm:px-5 max-sm:py-6">
                    <div className="absolute top-0 left-0 h-1 w-full bg-[#10233c]" />

                    <form className="flex flex-col gap-[22px]" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2.5">
                            <label htmlFor="username" className="text-sm font-semibold text-gray-600">
                                ชื่อผู้ใช้ / อีเมล
                            </label>

                            <div className="flex min-h-14 items-center gap-3 rounded-lg border border-transparent bg-[#dfeaf2] px-4 transition focus-within:border-[#8cb9e6] focus-within:shadow-[0_0_0_3px_rgba(140,185,230,0.2)]">
                                <FiAtSign className="h-5 w-5 shrink-0 text-slate-500" />
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="name@facility.com"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full border-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <label htmlFor="password" className="text-sm font-semibold text-gray-600">
                                รหัสผ่าน
                            </label>

                            <div className="flex min-h-14 items-center gap-3 rounded-lg border border-transparent bg-[#dfeaf2] px-4 transition focus-within:border-[#8cb9e6] focus-within:shadow-[0_0_0_3px_rgba(140,185,230,0.2)]">
                                <FiLock className="h-5 w-5 shrink-0 text-slate-500" />

                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                                    className="flex shrink-0 items-center justify-center bg-transparent text-xl text-gray-500"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="mt-[-2px] flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                            <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-gray-500">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe((prev) => !prev)}
                                    className="peer hidden"
                                />
                                <span className="relative inline-block h-[18px] w-[18px] shrink-0 rounded-[4px] border border-[#d1d9e0] bg-[#dfeaf2] peer-checked:border-[#10233c] peer-checked:bg-[#10233c] peer-checked:after:absolute peer-checked:after:left-[6px] peer-checked:after:top-[2px] peer-checked:after:h-2 peer-checked:after:w-1 peer-checked:after:rotate-45 peer-checked:after:border-b-2 peer-checked:after:border-r-2 peer-checked:after:border-white peer-checked:after:content-['']" />
                                <span>จดจำการเข้าสู่ระบบ</span>
                            </label>

                            <button
                                type="button"
                                className="text-sm font-bold text-[#10233c] hover:underline"
                            >
                                ลืมรหัสผ่าน
                            </button>
                        </div>

                        {error ? (
                            <p className="text-sm font-medium text-red-600">{error}</p>
                        ) : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[10px] bg-[#071a2f] text-[21px] font-bold text-white shadow-[0_8px_20px_rgba(7,26,47,0.18)] transition hover:opacity-95 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
                            <FiArrowRight className="h-[22px] w-[22px]" />
                        </button>
                    </form>

                    <div className="my-7 h-px bg-gray-200" />

                    <p className="text-center text-sm text-gray-500">
                        ระบบมีการตรวจสอบการเข้าใช้งาน,{" "}
                        <strong className="font-bold text-[#10233c]">กรุณาเข้าสู่ระบบ</strong>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default LoginPage;