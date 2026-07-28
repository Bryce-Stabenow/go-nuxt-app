export default defineNuxtRouteMiddleware(async (to) => {
  const { checkAuth } = useAuth();

  // Allow share routes without authentication - they handle their own auth flow
  if (to.path.startsWith("/lists/share/")) {
    return;
  }

  // Check authentication (uses cache if available)
  // This works on both server and client
  const authenticated = await checkAuth();

  // If visiting the homepage while authenticated, redirect to dashboard.
  // external: true forces a full-page navigation (window.location) rather than
  // an in-app route change, so the dashboard gets a clean server render + fresh
  // hydration instead of a client-side transition (which mismatches the
  // localStorage-driven list order and briefly leaks the spinner's flex layout).
  if (to.path === "/" && authenticated) {
    return navigateTo("/dashboard", { external: true });
  }

  // If trying to access signin/signup pages while authenticated, redirect to dashboard
  if ((to.path === "/signin" || to.path === "/signup") && authenticated) {
    return navigateTo("/dashboard");
  }

  // If trying to access dashboard without authentication, redirect to signin
  if (to.path === "/dashboard" && !authenticated) {
    return navigateTo("/signin");
  }

  // If trying to access list pages without authentication, redirect to signin
  if (to.path.startsWith("/lists/") && !authenticated) {
    return navigateTo("/signin");
  }
});
