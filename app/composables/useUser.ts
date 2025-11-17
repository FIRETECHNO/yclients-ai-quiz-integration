export function useUser() {
  let user = useState<IUser | null>(() => null
    // return {
    //   id: 13373222,
    //   name: "Соломон",
    //   login: "79194573139",
    //   user_token: "не скажу"
    // }
  )

  function setUser(data: IUser) {
    user.value = data;
  }

  // function setNewSession(id: number) {
  //   user.value = { id, name: "",  };
  // }

  return {
    // variables
    user,
    // functions
    setUser
  }
}