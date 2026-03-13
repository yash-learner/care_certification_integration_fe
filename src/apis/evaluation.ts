import { HttpMethod, apiRoutes, query } from "@/lib/request";
import type { PaginatedResponse } from "@/lib/request";
import type { VTAEvaluation } from "@/lib/types/evaluation";

export const evaluationRoutes = apiRoutes({
  list: {
    method: HttpMethod.GET,
    path: "/api/care_certification_integration/vta/evaluations/",
    TResponse: {} as PaginatedResponse<VTAEvaluation>,
  },
  get: {
    method: HttpMethod.GET,
    path: "/api/care_certification_integration/vta/evaluations/{submission_id}/",
    TResponse: {} as VTAEvaluation,
  },
});

export const evaluationApis = {
  list: query(evaluationRoutes.list),
  get: query(evaluationRoutes.get),
};
