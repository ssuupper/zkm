// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import Vue from 'vue'
import main from './components/main.vue'

var mainVm = new Vue({
    render: h => h(main)
});
mainVm.$mount("#app");