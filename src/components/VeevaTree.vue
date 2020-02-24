<template>
	<div class="tree">
		<VeevaSlide v-for="(slide, index) in veevaSlides" :key="index" :slide="slide" :ref="slide.name" />
		<FastPreview mode="all" v-if="showFastPreview && allScreenShots.length" :screenShots="allScreenShots" :previewIndex="previewIndex" v-on:close="closePreview" v-on:change-preview="previewScreenShot" v-on:remove-preview="removeScreenShot" />
	</div>
</template>

<script>
import {mapGetters} from "vuex";
import VeevaSlide from "./VeevaSlide";
import FastPreview from "./FastPreview";

export default {
	components: {
		VeevaSlide,
		FastPreview
	},
	data() {
		return {
			currentIndexOfAutoScreen: 0,
			showFastPreview: false,
			allScreenShots: [],
			previewIndex: 0,
			isAutomateForAllRunning: false
		};
	},
	computed: {
		...mapGetters(["veevaSlides"])
	},
	methods: {
		onPositionChanged(e) {
			const slidePosition = e.slideId;
			const newPosition = e.direction === "down" ? (slidePosition + 1 === this.veevaSlides.length ? 0 : slidePosition + 1) : slidePosition - 1;
			this.$store.dispatch("changeSlidePosition", {slidePosition, newPosition});
		},
		createQueueToCreatePreviews() {
			this.veevaSlides.forEach((slide, index) => {
				setTimeout(() => {
					this.$refs[slide.name][0].generateThumb();
				}, index * 500);
			});
		},
		runQueueToAutomaticScreenshots() {
			this.isAutomateForAllRunning = true;
			this.$refs[this.veevaSlides[this.currentIndexOfAutoScreen].name][0].startAutoScreen();
		},
		createPreviewAll() {
			this.allScreenShots = [];
			this.veevaSlides.forEach((slide, index) => {
				const slideScreenshots = [].concat.apply([], slide.screenShots);
				if (slideScreenshots.length) {
					slideScreenshots.forEach(s => {
						this.allScreenShots.push({slide: slide.name, screenshot: s});
					});
				}
			});
			this.showFastPreview = true;
		},
		closePreview() {
			this.allScreenShots = [];
			this.showFastPreview = false;
		},
		previewScreenShot(screenShot) {
			this.previewIndex = this.allScreenShots.indexOf(this.allScreenShots.find(s => s.screenshot === screenShot));
		},
		removeScreenShot(screenShot) {
			setTimeout(() => {
				const slide = this.veevaSlides.find(slide => {
					if (slide.screenShots) {
						return slide.screenShots.find(s => s === screenShot);
					} else {
						return null;
					}
				});
				this.$store.dispatch("removeScreenShot", {slide, screenShot});
				this.$refs[slide.name][0].$forceUpdate();
			}, 100);
			// slide.screenShots.splice(slide.screenShots.indexOf(screenShot), 1);
			// this.showFastPreview = false;
			// setTimeout(() => {
			// 	this.showFastPreview = true;
			// 	this.$forceUpdate();
			// }, 150);
			// console.log(screenShot);
		}
	},
	mounted() {
		this.allScreenShots = [];
		this.$on("change-position", this.onPositionChanged);
		this.$root.$on("create-previews-for-all", this.createQueueToCreatePreviews);
		this.$root.$on("run-automatic-screenshots-for-all", this.runQueueToAutomaticScreenshots);
		this.$root.$on("autoscreen-end", () => {
			if (this.isAutomateForAllRunning) {
				this.currentIndexOfAutoScreen++;
				if (this.currentIndexOfAutoScreen < this.veevaSlides.length) {
					this.runQueueToAutomaticScreenshots();
				} else {
					this.isAutomateForAllRunning = false;
				}
			}
		});
		this.$root.$on("preview-all", this.createPreviewAll);
	}
};
</script>

<style scoped>
.tree {
	display: flex;
	flex-direction: column;
	width: 100%;
}
</style>
