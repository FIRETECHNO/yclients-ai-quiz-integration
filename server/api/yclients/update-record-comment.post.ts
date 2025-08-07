export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  try {
    const { companyId, recordId, comment } = await readBody(event);
    let record: any = null;

    let response = await $fetch<{ success: boolean, data: any, meta: any }>(`https://api.yclients.com/api/v1/record/${companyId}/${recordId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.yclPartnerToken}, User ${config.yclUserToken}`,
        Accept: 'application/vnd.yclients.v2+json',
        "Content-Type": "application/json"
      },
    });

    if (response.success) {
      record = response.data;
    } else {
      return response;
    }

    if (!record) {
      return null;
    }
    /**
    required fields:
      staff_id
      services
      client
      seance_length
      datetime
     */
    response = await $fetch(`https://api.yclients.com/api/v1/record/${companyId}/${recordId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.yclPartnerToken}, User ${config.yclUserToken}`,
        Accept: 'application/vnd.yclients.v2+json',
        "Content-Type": "application/json"
      },
      body: {
        comment: comment, // there the magic happens
        staff_id: record.staff_id,
        services: record.services,
        client: record.client,
        seance_length: record.seance_length,
        datetime: record.datetime,
      }
    });

    return response;
  } catch (error) {
    return { success: false, data: error, meta: error };
  }
});