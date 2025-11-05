"use client";

export function ExportButton() {
  function download() {
    const link = document.createElement("a");
    link.href = "/api/items/export";
    link.click();
  }

  return (
    <button
      onClick={download}
      className="border px-3 py-2 text-white rounded-lg border-blue-500 bg-blue-950 hover:bg-blue-900"
    >
      Export Excel
    </button>
  );
}
