import { queryKeys } from "@/lib/query/key";
import { getTransactions } from "@/lib/services/transactions";
import { TransactionFilters } from "@/types/transaction";
import { useUser } from "@clerk/expo";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "../useSupabase";

export function useTransactionsQuery(filters: TransactionFilters = {}) {
  const { user } = useUser();
  const supabase = useSupabase();

  return useQuery({
    queryKey: queryKeys.transactions(user?.id, filters),
    queryFn: () => getTransactions(supabase, user!.id, filters),
    enabled: !!user,
  });
}
