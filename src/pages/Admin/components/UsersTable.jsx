import React from 'react';

const UsersTable = ({ users }) => {
  return (
    <section className="bg-white rounded-2xl border border-[#D9D3C7] shadow-sm overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-[#D9D3C7]">
        <div>
          <h2 className="text-lg font-poppins font-bold text-[#1C2B21]">Registered Users</h2>
          <p className="text-sm text-[#707A72] mt-1">All customers and their details</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-[#6b4f3]/10 text-[#6b4f3] text-sm font-bold">
          {users.length} Users
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#EFECE6]">
            <tr className="text-sm font-bold text-[#4A5D4E] uppercase tracking-wide">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C7]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#FDFBF7] transition-colors">
                <td className="px-6 py-4 text-[#1C2B21] font-medium">
                  {user.displayName || user.name || "User"}
                </td>
                <td className="px-6 py-4 text-[#707A72]">
                  {user.email || "-"}
                </td>
                <td className="px-6 py-4 text-[#707A72]">
                  {user.phone || "-"}
                </td>
                <td className="px-6 py-4 text-[#707A72] text-sm">
                  {user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-sm text-[#707A72]"
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
