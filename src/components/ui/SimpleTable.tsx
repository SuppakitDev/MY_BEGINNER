type Row = {
  Reservation: string;
  // sku: string;
  // loc: string;
  // qty: number;
  // status: "OK" | "WARN" | "ERROR";
};

export function SimpleTable({ rows }: { rows: Row[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="max-h-[420px] overflow-auto">
        <table className="table">
          <thead className="sticky top-0 bg-white dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-2 w-28">Reservation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.Reservation} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">              
                <td className="px-4 py-2">{r.Reservation}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
