import { v4 as uuidv4 } from 'uuid';

export async function getGigaToken(): Promise<string> {
  const {
    gigachatAuthKey } = useRuntimeConfig();

  try {
    const resp = await $fetch<{ access_token: string }>(
      "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            "Basic " + gigachatAuthKey,
          RqUID: uuidv4(),
        },
        body: new URLSearchParams({ scope: "GIGACHAT_API_PERS" }),
      }
    );

    return resp.access_token;
  } catch (error: any) {
    console.log(error.data);
    return "error";
  }
}