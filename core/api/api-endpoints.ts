export const apiEndpoints = {
  adminPlans: {
    list: () => "/admin/plans",
    get: (planId: string) => `/admin/plans/${planId}`,
    create: () => "/admin/plans",
    update: (planId: string) => `/admin/plans/${planId}`,
    delete: (planId: string) => `/admin/plans/${planId}`,
    features: (planId: string) => `/admin/plans/${planId}/features`,
    limits: (planId: string) => `/admin/plans/${planId}/limits`,
    duplicate: (planId: string) => `/admin/plans/${planId}/duplicate`,
    reorder: () => "/admin/plans/reorder",
  },
} as const;
