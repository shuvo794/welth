import { useSupabase } from "@/hooks/useSupabase";
import { useUserStore } from "@/store/userStore";
import { useUser } from "@clerk/expo";
import { useEffect, useRef } from "react";

export const useUserSync = () => {
  const { user } = useUser();
  const setCurrency = useUserStore((state) => state.setCurrency);
  const setNeedsOnboarding = useUserStore((state) => state.setNeedsOnboarding);
  const authSupabase = useSupabase();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    if (syncedUserIdRef.current === user.id) return;
    syncedUserIdRef.current = user.id;

    const syncUser = async () => {
      try {
        let { data: existingUser, error: fetchError } = await authSupabase
          .from("users")
          .select("clerk_id, currency")
          .eq("clerk_id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          if (fetchError.code === "42501") {
            console.warn(
              "Supabase RLS Policy (42501): Read permission denied on 'users' table. Please check RLS policies in Supabase SQL Editor.",
            );
          } else {
            console.error("Error fetching user:", fetchError);
          }
          setNeedsOnboarding(true);
          return;
        }

        const email = user.emailAddresses[0]?.emailAddress;
        const imageUrl = user.imageUrl ?? null;

        if (existingUser) {
          setCurrency(existingUser.currency ?? "INR");
          setNeedsOnboarding(true); // Forced true so user can view & test Onboarding UI on mobile
          return;
        }

        let { data: newUser, error: insertError } = await authSupabase
          .from("users")
          .upsert(
            {
              clerk_id: user.id,
              email,
              image_url: imageUrl,
            },
            { onConflict: "clerk_id", ignoreDuplicates: false },
          )
          .select("currency")
          .single();

        if (insertError && insertError.code === "PGRST204") {
          const retry = await authSupabase
            .from("users")
            .upsert(
              {
                clerk_id: user.id,
                email,
              },
              { onConflict: "clerk_id", ignoreDuplicates: false },
            )
            .select("currency")
            .single();

          newUser = retry.data;
          insertError = retry.error;
        }

        if (insertError) {
          if (insertError.code === "42501") {
            console.warn(
              "Supabase RLS Policy Notice (42501): The 'users' table has Row Level Security enabled. Please add an INSERT / UPSERT policy in Supabase SQL Editor to sync user records to Supabase DB.",
            );
          } else {
            console.error("Error upserting user:", insertError);
          }
          setNeedsOnboarding(true);
          return;
        }

        setCurrency(newUser?.currency ?? "INR");
        setNeedsOnboarding(!newUser?.currency);

        const { error: accountError } = await authSupabase
          .from("accounts")
          .insert({
            user_id: user.id,
            name: "Cash",
            type: "CASH",
            balance: 0,
            is_default: true,
          });

        if (accountError) {
          console.error("Error creating default account:", accountError);
        }
      } catch (e) {
        console.error("Unexpected sync error:", e);
        setNeedsOnboarding(true);
      }
    };

    syncUser();
  }, [user?.id]);
};
