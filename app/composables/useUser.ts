export function useUser() {
  let user = useState<IUser>(() => {
    return {
      id: 13373222,
      name: "Соломон",
      login: "79194573139",
      user_token: "не скажу"
    }
  })

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