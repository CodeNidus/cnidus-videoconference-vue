<template>
  <div id="faceapi-text-action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="admin-section" v-if="props.userSettings.isCreator">
      <div class="text-section">
        <div class="settings mx-15">
          <div>
            <label>User:</label>
            <select
              v-model="selectedUser"
            >
              <option
                v-for="(user, index) in users"
                :key="'user-' + index"
                :value="user.peerJsId"
              >{{ user.name }}</option>
            </select>
          </div>
          <div>
            <label>Timeout:</label>
            <input type="text" v-model="timeout" placeholder="Enter timeout" />
            <span> (seconds) </span>
          </div>
        </div>
        <div class="type-options mx-15">
          <div>
            <label for="type-hat">Pirate Hat</label>
            <input id="type-hat" name="type" type="radio" value="hat" v-model="type" />
          </div>
          <div>
            <label for="type-medal">Medal</label>
            <input id="type-medal" name="type" type="radio" value="medal" v-model="type"  />
          </div>
        </div>
        <div class="mx-15">
          <button @click="startDraw" :disabled="!selectedUser || !timeout">Start Draw</button>
        </div>
      </div>
    </div>
    <div class="faceapi-action-back" @click="show(false)"></div>
  </div>
</template>

<script setup>
import {defineExpose, defineProps, ref, computed, onMounted, onUnmounted, inject} from 'vue'

const webrtc = inject('webrtc')

const props = defineProps({
  webrtc: {
    type: Object,
    required: true
  },
  room: {
    type: Object,
    required: true
  },
  userSettings: {
    type: Object,
    required: true
  }
})

const users = computed(() => {
  let users = [{
    name: 'Creator',
    peerJsId: props.userSettings.peerJsId
  }]

  props.webrtc.People.getConnections().forEach((item) => {
    users.push({
      name: item.name,
      peerJsId: item.peerJsId
    })
  })

  return users;
})

const dialog = ref(false)
const type = ref('hat')
const timeout = ref(30)
const selectedUser= ref()

const action = ref({
  name: 'face-api',
  moderator: true,
  users: [],
  attributes: {
    type: 'hat',
    timeout: '5',
    peerJsId: null,
  }
})

const show = (status = true) => {
  dialog.value = status;

  if(!status) {
  }
}

const run = () => {
  show()
}


const startDraw = () => {
  let actionItem = JSON.parse(JSON.stringify(action.value))

  actionItem.attributes.type = type.value
  actionItem.attributes.timeout = timeout.value
  actionItem.users.push({
    peerJsId: selectedUser.value
  })

  props.webrtc.runAction(props.room.id, actionItem)
  show(false)
}

const setActionEventListener = () => {
  window.addEventListener('onFaceApiAction-DetectAndDraw', userFaceApiListenerAction);
}

const clearListener = () => {
  window.removeEventListener('onFaceApiAction-DetectAndDraw', userFaceApiListenerAction);
}


const userFaceApiListenerAction = (e) => {
  webrtc.helpers.faceApiAction.setTimer(e)
}

onMounted(() => {
  setActionEventListener()
})

onUnmounted(() => {
  clearListener()
})

defineExpose({
  run
})

</script>

<style lang="scss">
#faceapi-text-action {
  .admin-section {
    position: fixed;
    display: flex;
    z-index: 2;
    top: 50%;
    left: 50%;
    width: 600px;
    padding: 10px;
    background: #fff;
    border: 1px solid #ccc;
    transform: translate(-50%, -50%);

    @media screen and (max-width:480px) {
      width: 90%;
    }

    .mx-15 {
      margin: 15px 0;
    }

    .text-section {
      width: 100%;

      .settings {
        display: flex;
        justify-content: space-between;

        @media screen and (max-width:480px) {
          flex-direction: column;
        }

        div {
          label {
            margin-right: 5px;
          }

          select {
            min-width: 150px;
          }

          @media screen and (max-width:480px) {
            margin: 15px;
          }
        }
      }

      .type-options {
        width: 100%;

        div {
          display: inline-block;
          margin-right: 15px;

          label {
            margin-right: 5px;
          }

          &:last-child {
            margin-right: unset;
          }
        }
      }
    }
  }

  .faceapi-action-back {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.6;
  }
}
</style>
