import { queryKeys } from "@/lib/query/key";
import { getBudget, upsertBudget } from "@/lib/services/budgets";
import { useUser } from "@clerk/expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";

export function useBudgetQuery() {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.budget(user?.id),
    queryFn: () => getBudget(supabase, user!.id),
    enabled: !!user,
  });
}

export function useUpsertBudget() {
  const { user } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => upsertBudget(supabase, user!.id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budget(user?.id) });
    },
  });
}
