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
		currentContentType: null
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
		}
	},
	mutations: {
		createTree(state, tree) {
			state.tree = tree;
		},
		createVeevaTree(state, veevaSlides) {
			state.veevaSlides = veevaSlides;
		},
		setSimplePreviewBanner(state, config) {
			state.simplePreviewBanner = config.banner;
			state.currentContentType = config.type;
		},
		clearSimplePreviewBanner(state) {
			state.simplePreviewBanner = null;
			state.currentContentType = null;
		},
		removeTheTrees(state) {
			state.tree = {
				campaigns: []
			};
			state.veevaSlides = [];
		},
		changeSlidePosition(state, config) {
			arrayMove.mutate(state.veevaSlides, config.slidePosition, config.newPosition);
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
		}
	},
	modules: {}
});
