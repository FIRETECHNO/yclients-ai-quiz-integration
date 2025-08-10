export function useYclients() {
  const CATEGORY_FOR_RECOMMENDATIONS = 21444146;
  const COMPANY_ID = 894109;
  const BOOKING_URL = "https://n1603683.yclients.com";

  const MAX_COMMENT_LENGTH = 149;

  let quizComment = ref<string>("")


  const recommendedServices = ref<any[]>([]);

  async function getRecommendedServices() {
    const { data, error } = await useFetch<{
      success: boolean,
      data: any[],
      meta: any
    }>(
      `/api/yclients/recommended-services`
    );
    if (error.value) console.error(`Ошибка при получении услуг ${error.value}`);

    if (data.value?.data.length) {
      recommendedServices.value = data.value.data.filter((service) => service.category_id == CATEGORY_FOR_RECOMMENDATIONS);
    }
  }

  async function updateRecordComment(recordId: string): Promise<any> {
    if (!recordId) return console.error("[updateRecordComment()]: Нет recordId")

    if (!quizComment.value) return console.warn("no comment presented");

    if (quizComment.value.length > MAX_COMMENT_LENGTH) quizComment.value = quizComment.value.slice(0, MAX_COMMENT_LENGTH)

    const { data, error } = await useFetch<{
      success: boolean,
      data: any[],
      meta: any
    }>(
      `/api/yclients/update-record-comment`,
      {
        method: "POST",
        body: {
          companyId: COMPANY_ID,
          recordId,
          comment: quizComment.value
        }
      });
    return data;
  }

  return {
    // vars
    recommendedServices, COMPANY_ID, BOOKING_URL, quizComment,
    // funcs
    getRecommendedServices, updateRecordComment,
  };
}
