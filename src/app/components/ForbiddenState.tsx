import type { Permission } from "@/src/app/type/common";

type Props = {
  requiredPermission?: Permission;
};

export default function ForbiddenState({ requiredPermission }: Props) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-100 px-5">
      <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">ไม่มีสิทธิ์เข้าถึง</h1>
        <p className="mt-3 text-sm text-slate-500">
          บัญชีนี้ไม่มีสิทธิ์สำหรับหน้านี้
          {requiredPermission ? ` (${requiredPermission})` : ""}
        </p>
      </div>
    </section>
  );
}
