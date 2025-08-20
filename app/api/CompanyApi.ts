export default {
  updateCompanyId(
    teacherId: string,
    summary: any
  ): Promise<{ success: boolean }> {
    const { $apiFetch } = useNuxtApp();
    return $apiFetch<{ success: boolean }>("/teacher/update-teacher-summary", {
      method: "POST",
      body: { teacherId, summary },
    });
  },
};
