# Implementation Plan for Role & Department Based Authentication and Admin Management

This document describes the specific code changes needed to extend the existing authentication system with role-based access (RBAC) and department assignments while providing an admin interface for user management.

---

## 1. Update User Model and Default Preferences

• In the file `store/Auth.ts`, update the `UserPrefs` interface to include `role` and `department` fields. For example:

  // In store/Auth.ts (only show modifications)
  export interface UserPrefs {
    reputation: number;
    role: string;         // e.g., "user", "admin"
    department: string;   // e.g., "sales", "engineering"
  }

• In the `login` method (same file), after retrieving the user via `account.get<UserPrefs>()`, update the prefs if any are missing. Replace the existing update block with code similar to:

  // In login() in store/Auth.ts
  if (!user.prefs?.role || !user.prefs?.department || user.prefs?.reputation === undefined) {
    await account.updatePrefs<UserPrefs>({
      reputation: user.prefs?.reputation || 0,
      role: user.prefs?.role || "user",
      department: user.prefs?.department || "general"
    });
  }

This ensures that any new or existing users receive default values (role "user" and department "general") if not already assigned.

---

## 2. Update User Profile Page

Modify the profile page at `app/profile/[userId]/page.tsx` so that role and department are displayed along with other user details. Since roles are meant to be assigned by an admin, the fields should remain read-only for regular users.

• At the top of the file, initialize state for the new fields:

  // In app/profile/[userId]/page.tsx, near existing state definitions
  const [role, setRole] = useState(user?.prefs?.role || "user");
  const [department, setDepartment] = useState(user?.prefs?.department || "general");

• In the render section of the profile form, add new input groups (below the reputation field) that display these values as read-only. For example:

  {/* Role Field */}
  <div>
    <label className="flex items-center text-gray-300 mb-2" htmlFor="role">
     <FaUser className="mr-2" /> Role
    </label>
    <input
     type="text"
     id="role"
     value={role}
     readOnly
     className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-400 cursor-not-allowed"
    />
  </div>

  {/* Department Field */}
  <div>
    <label className="flex items-center text-gray-300 mb-2" htmlFor="department">
     <FaUser className="mr-2" /> Department
    </label>
    <input
     type="text"
     id="department"
     value={department}
     readOnly
     className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-400 cursor-not-allowed"
    />
  </div>

(You may want to import a suitable icon for department if desired.)

---

## 3. Admin Interface for User Management

Create a new admin section that allows users with the "admin" role to view and update the role and department of other users.

### 3.1 Create Admin Users Page

Create a new file at `app/admin/users/page.tsx` with the following pseudo-code structure:

  // In app/admin/users/page.tsx (client component)
  "use client";
  import { useEffect, useState } from "react";
  import { useAuthStore } from "@/store/Auth";
  import { useRouter } from "next/navigation";
  
  const AdminUsersPage = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [users, setUsers] = useState([]);
  
    // Redirect non-admin users
    useEffect(() => {
     if (user?.prefs?.role !== "admin") {
      router.push("/"); // or display an unauthorized message
     }
    }, [user]);
  
    // Fetch list of users via an API route
    const fetchUsers = async () => {
     const res = await fetch("/api/admin/listUsers");
     const data = await res.json();
     setUsers(data.users);
    };
  
    useEffect(() => {
     fetchUsers();
    }, []);
  
    // Handle updates for role and department (call update API)
    const handleUpdate = async (userId, newRole, newDept) => {
     await fetch("/api/admin/updateUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole, department: newDept })
     });
     fetchUsers();
    };
  
    return (
     <div>
      <h1>Admin - Manage Users</h1>
      {users.map((usr) => (
       <div key={usr.$id}>
        <p>{usr.name} ({usr.email})</p>
        <input
         type="text"
         defaultValue={usr.prefs.role}
         onBlur={(e) => handleUpdate(usr.$id, e.target.value, usr.prefs.department)}
        />
        <input
         type="text"
         defaultValue={usr.prefs.department}
         onBlur={(e) => handleUpdate(usr.$id, usr.prefs.role, e.target.value)}
        />
       </div>
      ))}
     </div>
    );
  };
  
  export default AdminUsersPage;

### 3.2 Create API Routes for Admin Actions

Since the Appwrite client SDK does not support modifications of other users on the client side, create secure API routes that utilize the server SDK with admin privileges.

#### API Route to List Users

Create `app/api/admin/listUsers/route.ts` with pseudo-code similar to:

  // In app/api/admin/listUsers/route.ts
  import { NextResponse } from "next/server";
  import { users } from "@/models/server/config";
  
  export async function GET() {
    try {
     const response = await users.list();
     return NextResponse.json({ users: response.users });
    } catch (error) {
     return NextResponse.error();
    }
  }

#### API Route to Update a User’s Role & Department

Create `app/api/admin/updateUser/route.ts` containing:

  // In app/api/admin/updateUser/route.ts
  import { NextResponse } from "next/server";
  import { users } from "@/models/server/config";
  
  export async function POST(request: Request) {
    const { userId, role, department } = await request.json();
    try {
     // Use the server SDK (with admin key) to update user prefs.
     // This assumes an API method exists: users.updatePrefs(userId, { role, department })
     const updatedUser = await users.updatePrefs(userId, { role, department });
     return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
     return NextResponse.error();
    }
  }

> Note: Adjust the actual server SDK calls if the Appwrite Users API uses a different method for updating custom metadata or preferences.

---

## 4. Security and Access Control

• In the admin page, verify the current user’s role (using `user?.prefs?.role`) and redirect or display an error if the user is not an admin.

• In the API routes, consider additional checks (e.g., via session tokens or headers) to ensure that only authorized (admin) requests are processed.

---

## 5. Optional: Update Registration Flow

Since roles are administered by an admin, the registration page does not need to take role/department inputs. However, ensure that after a new account is created the login function automatically initializes missing prefs (as detailed in section 1).

---

This plan outlines the modifications needed in the client-side pages (`store/Auth.ts`, `app/profile/[userId]/page.tsx`), the new admin interface (`app/admin/users/page.tsx`), and the API routes for admin actions. Follow these steps to implement role- and department-based authentication and admin management in the project.
