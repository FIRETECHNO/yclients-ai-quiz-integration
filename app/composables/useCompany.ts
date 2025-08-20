export function useCompany() {
  let companyId = useState<number | null>() // id текущей компании

  return {
    // variables
    companyId,
    // functions
  }
}