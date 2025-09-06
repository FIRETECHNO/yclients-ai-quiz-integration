export default {
  serverUpdateCompanyId(
    companyId: number
  ): Promise<{ success: boolean }> {
    const { $apiFetch } = useNuxtApp();
    return $apiFetch<{ success: boolean }>("/teacher/update-teacher-summary", {
      method: "POST",
      body: { companyId },
    });
  },

  ensureCompanyIsConnected(companyId: number): Promise<{ data: any, success: boolean, meta: any }> {
    const { $apiFetch } = useNuxtApp();
    return $apiFetch<{ data: any, success: boolean, meta: any }>(`/company/get-by-id?company_id=${companyId}`, {
      method: "GET",
    });
  }
}