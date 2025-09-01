export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const { company_id: salon_id } = await readBody(event);

  const response = await $fetch(`https://api.yclients.com/api/v1/marketplace/partner/callback`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.yclPartnerToken}`,
      Accept: 'application/vnd.yclients.v2+json',
      "Content-Type": "application/json",
    },
    Body: {
      salon_id,
      // application_id
      // webhook_urls - куда отправлять статус установилось ли приложение https://developers.yclients.com/ru/#tag/Marketplejs/operation/marketplace.webhook
    }
  });

  return response;
});