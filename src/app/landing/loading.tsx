import Preload from "@/src/app/components/Preload";

function Loading() {
    return (
        <Preload
            open
            progress={72}
            message="กำลังโหลดข้อมูล..."
            detail="ระบบลานจอดรถ"
            fullscreen={false}
        />
    );
}

export default Loading;