export default defineEventHandler(async (event) => {
  const { chainId } = event.context.params!;
  const config = useRuntimeConfig(event);

  return await $fetch(`https://api.yclients.com/api/v1/chain/${chainId}/service_categories`, {
    headers: {
      Authorization: `Bearer ${config.yclPartnerToken}, User ${config.yclPartnerToken}`,
      Accept: 'application/vnd.yclients.v2+json',
    },
  });
});