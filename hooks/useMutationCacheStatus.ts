import { useEffect, useState } from "react";
import { useQueryClient, MutationStatus} from "react-query";

export const useMutationCacheStatus = (forKey: string) => {
  const queryClient = useQueryClient();
  const mutationCache = queryClient.getMutationCache();
  const [mutateStatus, setMutateStatus] = useState<MutationStatus>('idle');

  useEffect(() => {
    const unsubscribe = mutationCache.subscribe((mutation) => {
      
      if (mutation.options.mutationKey === forKey) {
        setMutateStatus(mutation.state.status);
      }
    });
    return () => unsubscribe();
  });

  return mutateStatus;
};
