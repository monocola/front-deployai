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
  adminDatabasePlans: {
    list: () => "/admin/database-plans",
    get: (planId: string) => `/admin/database-plans/${planId}`,
    create: () => "/admin/database-plans",
    update: (planId: string) => `/admin/database-plans/${planId}`,
    delete: (planId: string) => `/admin/database-plans/${planId}`,
    duplicate: (planId: string) => `/admin/database-plans/${planId}/duplicate`,
  },
  adminEmailPlans: {
    list: () => "/admin/email-plans",
    get: (planId: string) => `/admin/email-plans/${planId}`,
    create: () => "/admin/email-plans",
    update: (planId: string) => `/admin/email-plans/${planId}`,
    delete: (planId: string) => `/admin/email-plans/${planId}`,
    duplicate: (planId: string) => `/admin/email-plans/${planId}/duplicate`,
  },
  adminSupport: {
    tickets: () => "/admin/support/tickets",
    ticket: (ticketId: string) => `/admin/support/tickets/${ticketId}`,
    messages: (ticketId: string) => `/admin/support/tickets/${ticketId}/messages`,
    attachmentDownload: (ticketId: string, attachmentId: string) =>
      `/admin/support/tickets/${ticketId}/attachments/${attachmentId}/download`,
  },
  adminResources: {
    overview: () => "/admin/resources",
    block: (resourceId: string) => `/admin/resources/${resourceId}/block`,
    unblock: (resourceId: string) => `/admin/resources/${resourceId}/unblock`,
  },
  adminPayments: {
    overview: () => "/admin/payments",
  },
} as const;
