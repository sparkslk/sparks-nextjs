## Quick Start Examples

Here are simple copy-paste examples for implementing logout in your app:

### 1. Simple Logout Button (Recommended)

```tsx
import { LogoutButton } from "@/components/ui/LogoutButton";

export function MyNavbar() {
  return (
    <nav>
      {/* Other nav items */}
      <LogoutButton variant="outline" showConfirmation={true} />
    </nav>
  );
}
```

### 2. Using API Call Directly

```tsx
"use client";

import { Button } from "@/components/ui/button";

export function CustomLogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button onClick={handleLogout} variant="destructive">
      Logout
    </Button>
  );
}
```

### 3. Using NextAuth signOut (Recommended for most cases)

```tsx
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function NextAuthLogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/login" })}
      variant="outline"
    >
      Logout
    </Button>
  );
}
```

### 4. Mobile/API Client Example

```javascript
// For mobile apps or external clients
const logout = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include auth token if using bearer authentication
        // 'Authorization': `Bearer ${authToken}`,
      },
      credentials: "include", // Important for cookies
    });

    const data = await response.json();

    if (data.success) {
      // Clear local storage
      localStorage.removeItem("authToken");
      // Redirect to login
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
```

### 5. Test Your Logout API

```bash
# Test with curl
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -v

# Expected response:
# {"success":true,"message":"Logged out successfully"}
```

### 6. Add to Navigation Component

If you have a navigation component, you can add the logout button like this:

```tsx
// In your navigation component
import { useSession } from "next-auth/react";
import { LogoutButton } from "@/components/ui/LogoutButton";

export function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between p-4">
      <div>Your Logo</div>

      {session && (
        <div className="flex items-center gap-4">
          <span>Welcome, {session.user?.name}</span>
          <LogoutButton variant="outline" size="sm" />
        </div>
      )}
    </nav>
  );
}
```

Choose the approach that best fits your needs!
