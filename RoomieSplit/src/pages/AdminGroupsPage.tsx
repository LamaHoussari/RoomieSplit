import React from 'react';

export default function Groups() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Groups Management</h1>
      <p>Manage all groups here: view, edit, or assign users to groups.</p>

      {/* Example list */}
      <ul className="mt-4 space-y-2">
        <li className="p-2 border rounded">Group A - 12 users</li>
        <li className="p-2 border rounded">Group B - 8 users</li>
        <li className="p-2 border rounded">Group C - 20 users</li>
      </ul>
    </div>
  );
}