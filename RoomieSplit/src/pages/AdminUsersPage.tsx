import React from 'react';

export default function Users() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Users Management</h1>
      <p>Manage all users here: view, edit, or deactivate users.</p>

      {/* Example table */}
      <table className="w-full mt-4 border-collapse border border-slate-300">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">1</td>
            <td className="border p-2">John Doe</td>
            <td className="border p-2">john@example.com</td>
            <td className="border p-2">User</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}