<script setup lang="ts">
definePageMeta({ layout: "ai" })

let { BOOKING_URL } = useYclients()


onMounted(() => {
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://n1595189.yclients.com') {
      console.warn("Message from untrusted origin:", event.origin);
      return;
    }

    if (!event.data || !event.data.type) {
      return;
    }

    switch (event.data.type) {
      case 'record_created':
        console.log('SUCCESS: Received record id from iframe:', event.data.data.record.id);
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
    <iframe height="545px" max-width="320px" frameborder="0" allowtransparency="true" id="ms_booking_iframe"
      :src="BOOKING_URL"></iframe>
  </div>
</template>