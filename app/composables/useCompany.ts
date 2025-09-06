import CompanyApi from "../api/CompanyApi";

export function useCompany() {
  let companyId = useState<number | null>(() => 125616); // id текущей компании

  async function ensureCompanyIsConnected(): Promise<boolean> {
    // Проверяем, что companyId не null перед отправкой
    if (companyId.value === null) {
      console.error("Company ID is null");
      return false;
    }

    const response = await CompanyApi.ensureCompanyIsConnected(companyId.value);

    return response.success;
  }

  return {
    // variables
    companyId,
    // functions
    ensureCompanyIsConnected,
  };
}
