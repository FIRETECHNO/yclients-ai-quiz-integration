<script setup lang="ts">
import { toast } from 'vue3-toastify';

let { BOOKING_URL, updateRecordComment, quizComment } = useYclients()
let route = useRoute();


onMounted(() => {
  if (route.query.quiz_comment) {
    quizComment.value = route.query.quiz_comment.toString();
  }
  window.addEventListener('message', async (event) => {
    if (event.origin !== BOOKING_URL) {
      console.warn("Message from untrusted origin:", event.origin);
      return;
    }

    if (!event.data || !event.data.type) {
      return;
    }

    switch (event.data.type) {
      case 'record_created':
        let res = await updateRecordComment(event.data.data.record_id)

        if (res.value?.success) {
          toast("Барберу передан ваш выбор в опросе!", { type: "success" })
        }
        break;
      default:
        console.log('Received unknown message type:', event.data.type);
        break;
    }
  });
})
</script>
<template>
  <div>
    <iframe max-width="320px" frameborder="0" allowtransparency="true" id="ms_booking_iframe" class="iframe"
      :src="BOOKING_URL"></iframe>
  </div>
</template>
<style scoped lang="scss">
.iframe {
  width: 100vw;
  height: 100vh;
}
</style>