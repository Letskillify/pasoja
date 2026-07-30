import React from 'react';

const UsersTable = ({ users }) => {
  return (
    <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-200">
        <div>
          <h2 className="text-lg font-poppins font-bold text-zinc-900">Registered Users</h2>
          <p className="text-xs text-zinc-500 mt-0.5">All customers and their details</p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold">
          {users.length} Users
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100">
            <tr className="text-[11px] font-bold text-zinc-700 uppercase tracking-widest">
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Email</th>
              <th className="px-6 py-3.5">Phone</th>
              <th className="px-6 py-3.5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                <td className="px-6 py-4 text-zinc-900 font-semibold">
                  {user.displayName || user.name || "User"}
                </td>
                <td className="px-6 py-4 text-zinc-600">
                  {user.email || "-"}
                </td>
                <td className="px-6 py-4 text-zinc-600">
                  {user.phone || "-"}
                </td>
                <td className="px-6 py-4 text-zinc-500 text-xs">
                  {user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-zinc-500"
                >
                  No users found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UsersTable;
