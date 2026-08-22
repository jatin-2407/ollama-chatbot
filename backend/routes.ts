export const routes = {
  "/api/health": async () => {
    return Response.json({ status: "ok" });
  },
};
