import CompanyApi from "../api/CompanyApi";

export function useCompany() {
  let companyId = useState<number | null>(() => 125616); // id текущей компании

  async function updateCompanyId(): Promise<boolean> {
    // Проверяем, что companyId не null перед отправкой
    if (companyId.value === null) {
      console.error("Company ID is null");
      return false;
    }

    try {
      const data = await CompanyApi.serverUpdateCompanyId(companyId.value);

      return true;
    } catch (error) {
      console.error("Failed to update company ID:", error);
      return false;
    }
  }

  async function connectNewCompany(company_id: number) {
    const data = await $fetch("/api/yclients/connect-new-company", {
      method: "POST",
      body: {
        company_id
      }
    })
  }

  return {
    // variables
    companyId,
    // functions
    updateCompanyId,
    connectNewCompany
  };
}
