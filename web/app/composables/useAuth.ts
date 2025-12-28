export const useAuth = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl

  // Reactive state
  const isAuthenticated = useState<boolean>('auth.isAuthenticated', () => false)
  const user = useState<any>('auth.user', () => null)
  const isLoading = useState<boolean>('auth.isLoading', () => false)
  
  // Cache timestamp to avoid repeated calls
  const lastCheck = useState<number>('auth.lastCheck', () => 0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Check if user is authenticated by calling the /me endpoint
   * Uses cache if available and not expired
   */
  const checkAuth = async (force = false): Promise<boolean> => {
    // Only run on client side
    if (process.server) {
      return false
    }

    const now = Date.now()
    const cacheValid = lastCheck.value > 0 && (now - lastCheck.value) < CACHE_DURATION

    // Return cached result if available and not forcing refresh
    if (!force && cacheValid) {
      return isAuthenticated.value
    }

    isLoading.value = true

    try {
      const userData = await $fetch(`${apiUrl}/me`, {
        method: 'GET',
        credentials: 'include',
        retry: false
      })

      // User is authenticated
      isAuthenticated.value = true
      user.value = userData
      lastCheck.value = now
      return true
    } catch (error) {
      // User is not authenticated
      isAuthenticated.value = false
      user.value = null
      lastCheck.value = now
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear authentication state (for logout)
   */
  const clearAuth = () => {
    isAuthenticated.value = false
    user.value = null
    lastCheck.value = 0
  }

  /**
   * Refresh authentication state (force check)
   */
  const refreshAuth = async (): Promise<boolean> => {
    return await checkAuth(true)
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    isLoading: readonly(isLoading),
    checkAuth,
    clearAuth,
    refreshAuth
  }
}

