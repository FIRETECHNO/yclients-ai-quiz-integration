export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  try {
    const { login, password } = await readBody(event);

    let response = await $fetch<{ success: boolean, data: any, meta: any }>(`https://api.yclients.com/api/v1/auth`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.yclPartnerToken}, User ${config.yclUserToken}`,
        Accept: 'application/vnd.yclients.v2+json',
        "Content-Type": "application/json"
      },
      body: {
        login,
        password
      }
    });

    return response;
  } catch (error: any) {
    return { success: false, data: error, meta: { status: error.response.status || 500 } };
  }
});