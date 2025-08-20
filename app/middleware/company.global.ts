export default defineNuxtRouteMiddleware((from, to) => {
  return true;
  if (from.fullPath.startsWith("/select-company")) return true;

  let { companyId, updateCompanyId } = useCompany();

  if (from.query?.company_id) {
    companyId.value = Number(to.query.company_id);
    const success = updateCompanyId();
  } else if (!companyId.value) {
    return navigateTo("/select-company");
  }
});
