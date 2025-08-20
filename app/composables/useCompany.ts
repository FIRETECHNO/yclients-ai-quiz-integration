export function useCompany() {
  let companyId = useState<number | null>(); // id текущей компании
  async function updateCompanyId() {}
  return {
    // variables
    companyId,
    // functions
  };
}
