import { useQuery } from "@tanstack/react-query";
import { usePath } from "raviger";

import { query } from "@/lib/request";

import { evaluationRoutes } from "@/apis/evaluation";
import type { VTAEvaluation } from "@/lib/types/evaluation";

function useFacilityId(): string | null {
  const path = usePath();
  const match = path?.match(/\/facility\/([^/]+)/);
  return match?.[1] ?? null;
}

export function useActiveEvaluation(): {
  evaluation: VTAEvaluation | null;
  isLoading: boolean;
} {
  const facilityId = useFacilityId();

  const { data, isLoading } = useQuery({
    queryKey: ["vta-evaluations", facilityId],
    queryFn: query(evaluationRoutes.list, {
      queryParams: { facility: facilityId!, status: "pending" },
    }),
    enabled: !!facilityId,
    refetchInterval: 60_000,
  });

  if (!facilityId || isLoading || !data) {
    return { evaluation: null, isLoading };
  }

  // One active evaluation per facility
  const active = data.results[0] ?? null;

  return { evaluation: active, isLoading: false };
}
