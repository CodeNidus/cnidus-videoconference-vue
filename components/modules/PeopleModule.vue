<template>
  <div id="people-module" class="module"  :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="module-box sidebar">
      <div class="module-box-heading">
        <h3>Peoples</h3>
        <span class="close" @click="show(false)"></span>
      </div>
      <div class="module-box-interface">
        <div class="people" ref="people">
          <div
            v-for="(user, index) in usersMenu"
            :key="index"
            class="user-item"
          >
            <span>{{ user.name }}</span>
            <div v-if="index > 0">
              <svg
                @click="user.openMenu = !user.openMenu"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                class="dropdown-dots bi bi-three-dots-vertical"
              >
                <path
                  d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
              <div
                ref="dropdown"
                class="dropdown-content"
                :class="{ show: user.openMenu }"
              >
                <h3>{{ user.name }}</h3>
                <ul>
                  <li v-if="isCreator" @click="banUser(user)">Ban user</li>
                  <li v-if="isCreator && !user.micMute" @click="muteMic(user)">Mute user microphone</li>
                </ul>
              </div>
            </div>
          </div>
          <div
            v-if="props.waitingList.length > 0"
            v-show="showWaitList"
            class="waitingList"
          >
            <hr/>
            <div
              v-for="(waiting, index) in props.waitingList"
              :key="index"
              class="waitingList-item"
            >
              <span>{{ waiting.name }}</span>
              <div>
                <span
                  class="btn"
                  @click="responseWaiting(true, waiting, index)"
                >
                  approve
                </span>
                <span
                  class="btn"
                  @click="responseWaiting(false, waiting, index)"
                >
                  denied
                </span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
    <div class="module-back" @click="show(false)"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import admitAudio from '../../assets/audio/admit.mp3'

const props = defineProps({
  webrtc: {
    type: Object,
    required: true
  },
  runAction: {
    type: Function,
    required: true
  },
  waitingList: {
    type: Array,
    required: true
  }
})

const usersMenu = ref([])

const users = computed(() => {
  usersMenu.value = [{
    name: props.webrtc.options.name + ' (You)',
    peerJsId: props.webrtc.peerJsId,
    openMenu: false,
  }]

  props.webrtc.People.getConnections().forEach((item) => {
    usersMenu.value.push({
      name: item.name,
      peerJsId: item.peerJsId,
      micMute: item.micMute,
      openMenu: false,
    })
  })
})

const isCreator = computed(() => {
  return props.webrtc.userSettings.isCreator
})

watch(users, (value) => {
  let index = value.findIndex(x => x.peerJsId === selectedUser.value)

  if (index < 0) {
    selectedUser.value = null
  }
})


const dropdown = ref()
const audio = ref()
const dialog = ref(false)
const room = ref()
const showWaitList = ref(true)

const show = (status = true) => {
  dialog.value = status
  props.webrtc.userSettings.newAdmitRequest = false
}

const open = (room) => {
  room.value = room
  show()
}

const hideMenu = (event) => {
  if (!event.target.matches('.dropdown-content') &&
      dropdown.value &&
      dropdown.value.length > 0
  ) {
    dropdown.value.forEach(dropdownItem => {
      dropdownItem.classList.remove('show')
    })
  }

  if (event.target.matches('.dropdown-dots')) {
    event.target.parentElement.childNodes.forEach(node => {
      if (node.classList.contains('dropdown-content') && !node.classList.contains('show')) {
        node.classList.add('show');
      }
    })
  }
}

const setEventsListener = () => {
  window.addEventListener('click', hideMenu)
  window.addEventListener('onRequestToAdmit', eventHandlerRequestToAdmit)
  window.addEventListener('onCancelForAdmit', eventHandlerCancelForAdmit)
}

const banUser = (user) => {
  props.runAction('ban', {
    peerJsId: user.peerJsId
  })

  user.openMenu = false
}

const banUser5Second = (user) => {
  props.runAction('multi', {
    peerJsId: user.peerJsId
  })

  user.openMenu = false;
}

const muteMic = (user) => {
  props.runAction('muteUserMic', {
    peerJsId: user.peerJsId
  })

  user.openMenu = false
}

const responseWaiting = (status = false, user, index) => {
  props.runAction('admit', {
    status: status,
    roomId: room.value.id,
    peerJsId: user.peerJsId,
  })

  showWaitList.value = false;
  props.webrtc.People.removeFromWaitingList(index)

  nextTick(() => {
    showWaitList.value = true;
  })
}

const eventHandlerRequestToAdmit = () => {
  audio.value.play()
  if(!dialog.value) {
    props.webrtc.userSettings.newAdmitRequest = true
  }
}

const eventHandlerCancelForAdmit = () => {
  if(props.waitingList.length === 0) {
    props.webrtc.userSettings.newAdmitRequest = false
  }
}

onUnmounted(() => {
  window.removeEventListener('click', hideMenu)
  window.removeEventListener('onRequestToAdmit', eventHandlerRequestToAdmit)
  window.removeEventListener('onCancelForAdmit', eventHandlerCancelForAdmit);
})

setEventsListener()
audio.value = new Audio(admitAudio)

defineExpose({
  open
})
</script>

<style lang="scss">
#people-module {
  .module-box-interface {
    .people {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .user-item {
        display: flex;
        justify-content: space-between;
        position: relative;

        .dropdown-dots {
          cursor: pointer;
        }
      }

      .waitingList {
        margin-top: 15px;

        .waitingList-item {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;

          .btn {
            font-size: 0.9em;
            padding: 5px 10px;
            margin: 0 2px;
          }
        }
      }
    }
  }
}
</style>
