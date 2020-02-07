import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		tree: {
			campaigns: []
		},
		simplePreviewBanner: null
	},
	getters: {
		tree: state => {
			return state.tree;
		},
		simplePreviewBanner: state => {
			return state.simplePreviewBanner;
		}
	},
	mutations: {
		createTree(state, tree) {
			state.tree = tree;
		},
		setSimplePreviewBanner(state, banner) {
			state.simplePreviewBanner = banner;
		},
		clearSimplePreviewBanner(state) {
			state.simplePreviewBanner = null;
		}
	},
	actions: {
		createTree({commit}, tree) {
			commit("createTree", tree);
		},
		setSimplePreviewBanner({commit}, banner) {
			commit("setSimplePreviewBanner", banner);
		},
		clearSimplePreviewBanner({commit}) {
			commit("clearSimplePreviewBanner");
		}
	},
	modules: {}
});
