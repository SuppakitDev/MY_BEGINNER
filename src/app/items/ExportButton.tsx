"use client";

export function ExportButton() {
  async function download() {
    try {
      const res = await fetch("/api/items/export-ftp");
      const j = await res.json();

      if (j.status === "success") {
        alert("✅ Export & Upload to FTP สำเร็จ\nไฟล์: " + j.filename);
      } else {
        alert("❌ Export ผิดพลาด: " + j.error);
      }
    } catch (err) {
      alert("❌ ไม่สามารถเชื่อมต่อ API ได้");
      console.error(err);
    }
  }

  return (
    <button
      onClick={download}
      className="border px-3 py-2 text-white rounded-lg border-blue-500 bg-blue-950 hover:bg-blue-900"
    >
      Export Excel → FTP
    </button>
    
  );
}
