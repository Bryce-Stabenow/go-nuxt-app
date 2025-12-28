export default defineNuxtRouteMiddleware(async (to) => {
  // Only check authentication on signin/signup pages
  if (to.path !== '/signin' && to.path !== '/signup') {
    return
  }

  // Only run on client side
  if (process.server) {
    return
  }

  const { checkAuth } = useAuth()
  
  // Check authentication (uses cache if available)
  const authenticated = await checkAuth()

  // User is authenticated, redirect to homepage
  if (authenticated) {
    return navigateTo('/')
  }
})

