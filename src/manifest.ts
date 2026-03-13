import { lazy } from "react";

import routes from "./routes";

const manifest = {
  plugin: "care-certification-integration-fe",
  routes,
  extends: [],
  components: {
    GlobalOverlay: lazy(() => import("./components/GlobalOverlay")),
  },
  devices: [],
} as const;

export default manifest;
