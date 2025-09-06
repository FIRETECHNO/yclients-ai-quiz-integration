export default defineNuxtRouteMiddleware(async (from, to) => {
  if (from.fullPath.startsWith("/select-company")) return true;

  let { companyId, ensureCompanyIsConnected } = useCompany();


  const companyIdCookie = useCookie<number | null>('company_id', {
    maxAge: 60 * 60 * 24 * 80, // Срок жизни 80 дней
    path: '/',
  });

  if (from.query?.company_id) {
    const newCompanyId = Number(to.query.company_id);

    companyId.value = newCompanyId;

    companyIdCookie.value = newCompanyId;

    const success = await ensureCompanyIsConnected();

    if (success) {
      return true;
    }

    return navigateTo("/select-company");
  } else if (companyIdCookie.value != null) {
    companyId.value = companyIdCookie.value;
    const success = await ensureCompanyIsConnected();
    if (success) {
      return true;
    }

    return navigateTo("/select-company");
  } else if (!companyId.value) {
    return navigateTo("/select-company");
  }
});
