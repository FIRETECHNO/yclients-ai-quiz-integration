export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const { company_id } = getQuery(event)


  const response = await $fetch(`https://api.yclients.com/api/v1/company/${company_id ?? 1434780}/services`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.yclPartnerToken}, User ${config.yclUserToken}`, // TODO: get user token from auth, 
      Accept: 'application/vnd.yclients.v2+json',
      "Content-Type": "application/json",
    },
  });

  return response;
});