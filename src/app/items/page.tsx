import ItemsClient from "./ItemsClient";
// import { ExportButton } from "./ExportButton";
// <ExportButton />

export default async function Page() {
  // ไม่ต้องอ่าน role ฝั่ง server แล้ว
  // data table ถ้าอยากดึง server-side ต่อก็ได้ (หรือง่ายสุดให้ client fetch)
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Items</h1>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          Role will be detected on client
        </span>
      </div>
      
      <ItemsClient />
    </main>
  );
}

