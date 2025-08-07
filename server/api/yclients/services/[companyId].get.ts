export default defineEventHandler(async (event) => {
  const { companyId } = event.context.params!;
  const categoryId = getQuery(event).category_id;
  const config = useRuntimeConfig(event);

  if (!categoryId) {
    throw createError({ statusCode: 400, message: 'Missing category_id in query' });
  }

  return await $fetch(`https://api.yclients.com/api/v1/companies/${companyId}/services?category_id=${categoryId}`, {
    headers: {
      'X-Partner-Token': config.yclPartnerToken,
      Authorization: `Bearer ${config.yclUserToken}`,
      Accept: 'application/vnd.yclients.v2+json',
    },
  });
});
