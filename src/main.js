import Vue from "vue";
import VueRouter from "vue-router";
import store from "./store";
import App from "./App.vue";
import VueSweetalert2 from "vue-sweetalert2";
import PerfectScrollbar from "vue2-perfect-scrollbar";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faCaretUp, faCaretDown, faInfoCircle, faEye, faRedo, faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

import "sweetalert2/dist/sweetalert2.min.css";
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css";

import Dropzone from "./components/Dropzone";
import Tree from "./components/Tree";

Vue.config.productionTip = false;

const routes = [
	{path: "/", component: Dropzone},
	{path: "/select", component: Tree}
];
const router = new VueRouter({
	routes,
	mode: "history"
});

const options = {
	confirmButtonColor: "#00BFA5",
	cancelButtonColor: "#004D40"
};

library.add(faCaretUp, faCaretDown, faInfoCircle, faEye, faRedo, faTimes);

Vue.use(VueRouter);
Vue.use(VueSweetalert2, options);
Vue.use(PerfectScrollbar);

Vue.component('font-awesome-icon', FontAwesomeIcon)

new Vue({
	store,
	router,
	render: h => h(App)
}).$mount("#app");
