export function useYclients() {
  const CATEGORY_FOR_RECOMMENDATIONS = 21444146;
  const COMPANY_ID = 1434780;
  const BOOKING_URL = "https://n1595189.yclients.com";

  const MAX_COMMENT_LENGTH = 149;
  let _rawQuizComment = ref<string>('');

  let quizComment = computed<string>({
    get() {
      return _rawQuizComment.value;
    },
    set(newValue) {
      if (newValue.length > MAX_COMMENT_LENGTH) {
        _rawQuizComment.value = newValue.slice(0, MAX_COMMENT_LENGTH);
      } else {
        _rawQuizComment.value = newValue;
      }
    }
  });


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

  return {
    // vars
    recommendedServices, COMPANY_ID, BOOKING_URL, quizComment,
    // funcs
    getRecommendedServices
  };
}
