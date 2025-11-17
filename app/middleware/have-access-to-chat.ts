export default defineNuxtRouteMiddleware(async (from, to) => {
  const userStore = useUser();
  console.log(userStore.user.value);

  if (!userStore.user.value?.id) {
    return navigateTo("/");
  }
  return true
})