import { useEffect, useRef } from "react";
import { useUser } from "@clerk/react";

export function useUserSync() {
  const { user, isSignedIn } = useUser();
  const lastSyncedId = useRef<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user || lastSyncedId.current === user.id) return;

    const syncUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.BASE_URL}api/users/sync`.replace("//api", "/api"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: user.primaryEmailAddress?.emailAddress || null,
              phone: user.primaryPhoneNumber?.phoneNumber || null,
              fullName: user.fullName || user.firstName || "Valued Client",
              avatarUrl: user.imageUrl || null,
            }),
          }
        );

        if (res.ok) {
          lastSyncedId.current = user.id;
        }
      } catch {
        // Silently fail — sync will retry on next mount
      }
    };

    syncUser();
  }, [isSignedIn, user]);
}
