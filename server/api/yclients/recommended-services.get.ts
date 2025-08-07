export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const company_id = 1434780;

  const response = await $fetch(`https://api.yclients.com/api/v1/company/${company_id}/services`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.yclPartnerToken}, User ${config.yclUserToken}`,
      Accept: 'application/vnd.yclients.v2+json',
      "Content-Type": "application/json"
    }
  });

  return response;
});