import React from 'react';

export default function AuditLog() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Audit Log</h1>
      <p>Track all system actions performed by users and admins.</p>

      <table className="w-full mt-4 border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Action</th>
            <th className="border p-2">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">2026-04-09 10:15</td>
            <td className="border p-2">admin@example.com</td>
            <td className="border p-2">Created User</td>
            <td className="border p-2">User: Jane Doe</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}