

import videoConference from 'cnidus-videoconference-core'

import Rooms from './components/Rooms.vue'
import RoomJoin from './components/RoomJoin.vue'



const videoConferenceVue = {
    configs: {},
    actions: {},
    themes: {},
    overrides: {},

    async install(app, options) {
        videoConference.initial(this.configs, this.actions, this.themes, this.overrides)

        app.provide('webrtc', videoConference)
            .component('VCRooms', Rooms)
            .component('VCRoomJoin', RoomJoin)
    }
}

export function VideoConferenceCreator(options = {}) {

    videoConferenceVue.configs = options?.configs || {}
    videoConferenceVue.actions = options?.actions || {}
    videoConferenceVue.themes = options?.themes || {}
    videoConferenceVue.overrides = options?.overrides || {}

    return videoConferenceVue;
}

export default videoConferenceVue;

