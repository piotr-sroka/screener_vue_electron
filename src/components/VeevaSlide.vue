<template>
	<div class="slide-box">
		<VeevaSlideHeader ref="slideHeader" :slide="slide" :slideId="$vnode.key" :mode="mode" />
		<div class="slide-thumb">
			<img v-if="slide.thumb" class="thumb-image" :src="slide.thumb" alt="" />
			<font-awesome-icon v-if="!slide.thumb && !generatingThumb" class="slide-thumb loader-icon" icon="image" title="Generate thumbs" @click="generateThumb" />
			<Loader v-if="generatingThumb" />
		</div>
		<ThumbGenerator v-if="generatingThumb" :slide="slide" v-on:thumb-generated="onThumbGenerated" />
		<ScreenGrabber v-if="isScreeningRunning" :slide="slide" v-on:grab-screen="onSlideGrabbed" v-on:grab-end="stopAutoScreen" />
		<div v-if="slide.screenShots && slide.screenShots.length" class="screenshots-container" :sLength="sLength">
			<ScreenShot v-for="(screenShot, index) in slide.screenShots" :screenShot="screenShot" :key="index" v-on:screenshot-preview="previewScreenShot" v-on:screenshot-remove="removeScreenShot" />
		</div>
		<FastPreview v-if="showFastPreview && slide.screenShots && slide.screenShots.length" :screenShots="slide.screenShots" :previewIndex="previewIndex" v-on:close="closePreview" v-on:change-preview="previewScreenShot" v-on:remove-preview="removeScreenShot" />
	</div>
</template>

<script>
import {mapGetters} from "vuex";
import VeevaSlideHeader from "./VeevaSlideHeader";
import IndexFile from "./IndexFile";
import Loader from "./Loader";
import ThumbGenerator from "./ThumbGenerator";
import ScreenGrabber from "./ScreenGrabber";
import ScreenShot from "./ScreenShot";
import FastPreview from "./FastPreview";

export default {
	props: ["slide"],
	components: {
		VeevaSlideHeader,
		IndexFile,
		Loader,
		ThumbGenerator,
		ScreenGrabber,
		ScreenShot,
		FastPreview
	},
	data() {
		return {
			defaultThumb: "",
			generatingThumb: false,
			isScreeningRunning: false,
			showFastPreview: false,
			previewIndex: 0
		};
	},
	computed: {
		...mapGetters(["sLength"]),
		mode() {
			return this.isScreeningRunning ? "screening" : "normal";
		}
	},
	methods: {
		closePreview() {
			this.showFastPreview = false;
		},
		previewScreenShot(screenShot) {
			this.showFastPreview = true;
			this.previewIndex = this.slide.screenShots.indexOf(screenShot);
		},
		removeScreenShot(screenShot) {
			this.$store.dispatch("removeScreenShot", {slide: this.slide, screenShot});
			const pi = this.previewIndex;
			this.previewIndex = -1;
			setTimeout(() => {
                this.previewIndex = pi < this.slide.screenShots.length ? pi : this.slide.screenShots.length - 1;
				this.$forceUpdate();
			}, 10);
		},
		generateThumb() {
			this.generatingThumb = true;
		},
		onThumbGenerated(e) {
			if (e.type === "thumb") {
				this.generatingThumb = false;
				this.slide.thumb = e.image;
			}
		},
		startAutoScreen() {
			this.slide.screenShots = [];
			this.isScreeningRunning = true;
		},
		stopAutoScreen() {
			this.isScreeningRunning = false;
		},
		onSlideGrabbed(e) {
			this.$store.dispatch("screenGrabbed", {slide: this.slide, shot: e.target.data});
			// if (!this.slide.screenShots) this.slide.screenShots = [];
			// this.slide.screenShots.push(e.target.data);
		}
	},
	mounted() {
		this.screenShots = [];
		this.$on("auto-screen", this.startAutoScreen);
		this.$on("auto-screen-cancel", this.stopAutoScreen);
	}
};
</script>

<style scoped>
.slide-box {
	width: 100%;
	text-align: left;
}
.slide-thumb {
	max-width: 160px;
	max-height: 160px;
	padding: 12px;
	display: flex;
	justify-content: center;
	align-items: center;
}
.thumb-image {
	max-width: 100%;
	max-height: 100%;
}
.loader-icon {
	font-size: 80px;
	cursor: pointer;
}
#thumb-file {
	position: absolute;
	left: -99999999999999px;
}
.screenshots-container {
	display: flex;
	flex-wrap: wrap;
}
</style>
