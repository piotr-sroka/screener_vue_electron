import Vue from "vue";
import Vuex from "vuex";
import arrayMove from "array-move";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		tree: {
			campaigns: []
		},
		veevaSlides: [],
		simplePreviewBanner: null,
		currentContentType: null,
		sLength: 0
	},
	getters: {
		tree: state => {
			return state.tree;
		},
		veevaSlides: state => {
			return state.veevaSlides;
		},
		simplePreviewBanner: state => {
			return state.simplePreviewBanner;
		},
		currentContentType: state => {
			return state.currentContentType;
		},
		sLength: state => {
			return state.sLength
		}
	},
	mutations: {
		createTree(state, tree) {
			Vue.set(state, "tree", tree);
		},
		createVeevaTree(state, veevaSlides) {
			Vue.set(state, "veevaSlides", veevaSlides);
		},
		setSimplePreviewBanner(state, config) {
			Vue.set(state, "simplePreviewBanner", config.banner);
			Vue.set(state, "currentContentType", config.type);
		},
		clearSimplePreviewBanner(state) {
			Vue.set(state, "simplePreviewBanner", null);
			Vue.set(state, "currentContentType", null);
		},
		removeTheTrees(state) {
			state.tree = {
				campaigns: []
			};
			state.veevaSlides = [];
		},
		changeSlidePosition(state, config) {
			arrayMove.mutate(state.veevaSlides, config.slidePosition, config.newPosition);
		},
		createScreenShotsArray(state, config) {
			Vue.set(state.veevaSlides[state.veevaSlides.indexOf(config.slide)], "screenShots", [])
		},
		screenGrabbed(state, config) {
			state.veevaSlides[state.veevaSlides.indexOf(config.slide)].screenShots.push(config.shot);
			state.sLength = state.veevaSlides[state.veevaSlides.indexOf(config.slide)].screenShots.length;
		},
		removeScreenShot(state, data) {
			const screenShots = state.veevaSlides[state.veevaSlides.indexOf(data.slide)].screenShots;
			screenShots.splice(screenShots.indexOf(data.screenShot), 1);
		}
	},
	actions: {
		createTree({commit}, tree) {
			commit("createTree", tree);
		},
		createVeevaTree({commit}, veevaSlides) {
			commit("createVeevaTree", veevaSlides);
		},
		setSimplePreviewBanner({commit}, config) {
			commit("setSimplePreviewBanner", config);
		},
		clearSimplePreviewBanner({commit}) {
			commit("clearSimplePreviewBanner");
		},
		removeTheTrees({commit}) {
			commit("removeTheTrees");
		},
		changeSlidePosition({commit}, config) {
			commit("changeSlidePosition", config);
		},
		screenGrabbed({commit}, config) {
			if (!config.slide.screenShots) commit("createScreenShotsArray", config);
			commit("screenGrabbed", config);
		},
		removeScreenShot({commit}, data) {
			commit("removeScreenShot", data);
		}
	},
	modules: {}
});
