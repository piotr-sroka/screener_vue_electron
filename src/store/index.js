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
		sLength: 0,
		currentLocation: "home",
		allScreenShots: [],
		defaultTimeout: 10,
		defaultFrequency: 1,
		allIndexFiles: []
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
			return state.sLength;
		},
		currentLocation: state => {
			return state.currentLocation;
		},
		allScreenShots: state => {
			return state.allScreenShots;
		},
		defaultTimeout: state => {
			return state.defaultTimeout;
		},
		defaultFrequency: state => {
			return state.defaultFrequency;
		},
		allIndexFiles: state => {
			return state.allIndexFiles;
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
			Vue.set(state.veevaSlides[state.veevaSlides.indexOf(config.slide)], "screenShots", []);
		},
		screenGrabbed(state, config) {
			state.veevaSlides[state.veevaSlides.indexOf(config.slide)].size = config.size;
			state.veevaSlides[state.veevaSlides.indexOf(config.slide)].screenShots.push(config.shot);
			state.sLength = state.veevaSlides[state.veevaSlides.indexOf(config.slide)].screenShots.length;
		},
		removeScreenShot(state, data) {
			let screenShots;
			state.veevaSlides.forEach(slide => {
				if (slide.screenShots && slide.screenShots.length) {
					if (slide.screenShots.find(s => s === data.screenShot)) {
						screenShots = slide.screenShots;
					}
				}
			});
			screenShots.splice(screenShots.indexOf(data.screenShot), 1);
		},
		setLocation(state, url) {
			Vue.set(state, "currentLocation", url);
		},
		setAllScreenShots(state) {
			state.allScreenShots = [];
			state.veevaSlides.forEach(slide => {
				if (slide.screenShots) {
					slide.screenShots.forEach(s => {
						state.allScreenShots.push({data: s, size: slide.size});
					});
				}
			});
		},
		setDefaultTimeout(state, t) {
			state.defaultTimeout = t;
		},
		setDefaultFrequency(state, t) {
			state.defaultFrequency = t;
		},
		addIndexFileToList(state, indexFile) {
			state.allIndexFiles.push(indexFile);
		},
		clearIndexFileList(state) {
			state.allIndexFiles = [];
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
		},
		setLocation({commit}, url) {
			commit("setLocation", url);
		},
		setAllScreenShots({commit}) {
			commit("setAllScreenShots");
		},
		setDefaultTimeout({commit}, t) {
			commit("setDefaultTimeout", t < 1 ? 1 : t);
		},
		setDefaultFrequency({commit}, t) {
			commit("setDefaultFrequency", t < 0.1 ? 0.1 : t);
		},
		addIndexFileToList({commit}, indexFile) {
			commit("addIndexFileToList", indexFile);
		},
		clearIndexFileList({commit}) {
			commit("clearIndexFileList");
		}
	},
	modules: {}
});
