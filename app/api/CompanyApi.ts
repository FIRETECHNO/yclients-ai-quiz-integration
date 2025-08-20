export const serverUpdateCompanyId = (
  companyId: number
): Promise<{ success: boolean }> => {
  const { $apiFetch } = useNuxtApp();
  return $apiFetch<{ success: boolean }>("/teacher/update-teacher-summary", {
    method: "POST",
    body: { companyId },
  });
};
