import CompanyApi from "../api/CompanyApi";

export function useCompany() {
  let companyId = useState<number | null>(); // id текущей компании
  async function updateCompanyId(): Promise<boolean> {
    // Проверяем, что companyId не null перед отправкой
    if (companyId.value === null) {
      console.error("Company ID is null");
      return false;
    }

    try {
      const success = await CompanyApi.serverUpdateCompanyId(companyId.value);
      return success.success;
    } catch (error) {
      console.error("Failed to update company ID:", error);
      return false;
    }
  }
  return {
    // variables
    companyId,
    // functions
    updateCompanyId,
  };
}
