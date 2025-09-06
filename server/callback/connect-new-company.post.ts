// этот эндпоинт обрабатывает вебхук о подключении приложения в филиал 
// подробнее: https://developers.yclients.com/ru/#tag/Marketplejs/operation/marketplace.webhook

export default defineEventHandler(async (ev) => {
  const config = useRuntimeConfig(ev);

  const { salon_id, application_id, event, partner_token } = await readBody(ev);

  if (partner_token != config.yclPartnerToken) {
    throw new Error("Partner token не совпадает с действительным!")
  }

  let response = await $fetch<{ data: any, success: boolean, meta: any }>(config.public.apiBase + "/company/connect-new", {
    method: "POST",
    body: {
      company_id: salon_id,
      application_id,
      event
    }
  })
  if (response.success) {
    return "ok"
  }

  throw new Error("Непредвиденная ошибка!")
});