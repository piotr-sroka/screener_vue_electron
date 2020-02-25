<template>
	<div>
		<div class="indexFile-box">
			<BannerFrame ref="banner" :banner="indexFile" :maxBannerWidth="maxWidth" :maxBannerHeight="maxHeight" :type="type" @click.stop />
			<BannerOptions :banner="indexFile" :type="type" :isWorking="isWorking" />
		</div>
		<div v-if="indexFile.screenShots && indexFile.screenShots.length" class="screenshots-container">
			<ScreenShot v-for="(screenShot, index) in indexFile.screenShots" :screenShot="screenShot.data" :key="index" v-on:screenshot-preview="previewScreenShot" v-on:screenshot-remove="removeScreenShot" />
		</div>
	</div>
</template>

<script>
import fs from "fs";
import path from "path";

import BannerFrame from "./BannerFrame";
import BannerOptions from "./BannerOptions";
import ScreenShot from "./ScreenShot";

export default {
	components: {
		BannerFrame,
		BannerOptions,
		ScreenShot
	},
	props: ["indexFile", "type"],
	data() {
		return {
			bannerFrame: null,
			bannerDocument: null,
			bannerBody: null,
			canvas: null,
			currentTimeStamp: 0,
			timeout: 10,
			frequency: 1,
			isWorking: false,
			timeStampInterval: null
		};
	},
	computed: {
		maxWidth() {
			return this.type === "veeva" ? 200 : 100;
		},
		maxHeight() {
			return this.type === "veeva" ? 200 : 100;
		}
	},
	methods: {
		startAutomaticScreenshots() {
			this.currentTimeStamp = 0;
			this.isWorking = true;
			this.indexFile.screenShots = [];
			this.$refs.banner.$emit("reload");
			clearInterval(this.timeStampInterval);
			this.timeStampInterval = setInterval(this.takeScreenShot, this.frequency * 1000);
			// setTimeout(this.takeScreenShot, this.frequency * 1000);
		},
		takeScreenShot() {
			const maxTimeStamp = Math.ceil(this.timeout / this.frequency);
			this.currentTimeStamp++;
			if (this.currentTimeStamp < maxTimeStamp) {
				this.$refs.banner.$emit("grab-screen");
				// setTimeout(this.takeScreenShot, this.frequency * 1000);
			} else {
				clearInterval(this.timeStampInterval);
				this.isWorking = false;
			}
		},
		onScreenGrabbed(e) {
			if (!this.indexFile.screenShots.find(s => s.data === e.target.data)) {
				this.indexFile.screenShots.push(e.target);
				this.$forceUpdate();
			}
		},
		previewScreenShot() {},
		removeScreenShot(screenShotData) {
			const screenShotIndex = this.indexFile.screenShots.indexOf(this.indexFile.screenShots.find(s => s.data === screenShotData));
			this.indexFile.screenShots.splice(screenShotIndex, 1);
			this.$forceUpdate();
		}
	},
	mounted() {
		this.$root.$on("run-automatic-screenshots-for-all", this.startAutomaticScreenshots);
		this.$on("screen-grabbed", this.onScreenGrabbed);
		this.$on("start-autoscreen", this.startAutomaticScreenshots);
	},
	beforeDestroy() {
		this.$root.$off("run-automatic-screenshots-for-all", this.startAutomaticScreenshots);
		this.$off("screen-grabbed", this.onScreenGrabbed);
		this.$off("start-autoscreen", this.startAutomaticScreenshots);
		clearInterval(this.timeStampInterval);
	}
};
</script>

<style scoped>
.indexFile-box {
	padding: 12px 24px 12px 36px;
	display: flex;
}
.screenshots-container {
	display: flex;
	flex-wrap: wrap;
}
</style>
