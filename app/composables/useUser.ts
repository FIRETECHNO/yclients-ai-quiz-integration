export function useUser() {
  let user = useState<IUser>()

  function setUser(data: IUser) {
    user.value = data;
  }

  return {
    // variables
    user,
    // functions
    setUser,
  }
}