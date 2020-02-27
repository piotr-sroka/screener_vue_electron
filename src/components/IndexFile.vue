<template>
	<div>
		<div class="indexFile-box">
			<BannerFrame ref="banner" :banner="indexFile" :maxBannerWidth="maxWidth" :maxBannerHeight="maxHeight" :type="type" @click.stop />
			<BannerOptions :banner="indexFile" :type="type" :isWorking="isWorking" />
		</div>
		<div v-if="indexFile.screenShots && indexFile.screenShots.length" class="screenshots-container">
			<ScreenShot v-for="(screenShot, index) in indexFile.screenShots" :screenShot="screenShot.data" :key="index" v-on:screenshot-preview="previewScreenShot" v-on:screenshot-remove="removeScreenShot" />
		</div>
		<FastPreview v-if="showFastPreview && indexFile.screenShots && indexFile.screenShots.length" :screenShots="indexFile.screenShots" :previewIndex="previewIndex" v-on:close="closePreview" v-on:change-preview="previewScreenShot" v-on:remove-preview="removeScreenShot" />
	</div>
</template>

<script>
import fs from "fs";
import path from "path";
import {mapGetters} from "vuex";

import BannerFrame from "./BannerFrame";
import BannerOptions from "./BannerOptions";
import ScreenShot from "./ScreenShot";
import FastPreview from "./FastPreview";

export default {
	components: {
		BannerFrame,
		BannerOptions,
		ScreenShot,
		FastPreview
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
			timeStampInterval: null,
			showFastPreview: false,
			previewIndex: 0
		};
	},
	computed: {
		...mapGetters(["defaultTimeout", "defaultFrequency"]),
		maxWidth() {
			return this.type === "veeva" ? 200 : 100;
		},
		maxHeight() {
			return this.type === "veeva" ? 200 : 100;
		}
	},
	methods: {
		closePreview() {
			this.showFastPreview = false;
		},
		previewScreenShot(screenShot) {
			this.showFastPreview = true;
			this.previewIndex = this.indexFile.screenShots.indexOf(this.indexFile.screenShots.find(s => (screenShot.data && s.data === screenShot.data) || (!screenShot.data && s.data === screenShot)));
		},
		startAutomaticScreenshots() {
			this.currentTimeStamp = 0;
			this.isWorking = true;
			this.indexFile.screenShots = [];
			this.$refs.banner.$emit("reload");
			clearInterval(this.timeStampInterval);
			setTimeout(() => {
				this.timeStampInterval = setInterval(this.takeScreenShot, this.frequency * 1000);
			}, 100);
		},
		takeScreenShot() {
			const maxTimeStamp = Math.ceil(this.timeout / this.frequency);
			this.currentTimeStamp++;
			if (this.currentTimeStamp < maxTimeStamp) {
				this.$refs.banner.$emit("grab-screen");
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
		removeScreenShot(screenShotData) {
			const screenShotIndex = this.indexFile.screenShots.indexOf(this.indexFile.screenShots.find(s => s.data === screenShotData));
			this.indexFile.screenShots.splice(screenShotIndex, 1);
			this.$forceUpdate();
		},
		forceUpdate() {
			this.$forceUpdate();
		},
		onFileSaving(e) {
			this.isWorking = true;
		},
		onFileSaved(e) {
			this.isWorking = false;
		}
	},
	mounted() {
		this.$root.$on("run-automatic-screenshots-for-all", this.startAutomaticScreenshots);
		this.$root.$on("screen-grabbed", this.onScreenGrabbed);
		this.$root.$on("refresh", this.forceUpdate);
		this.$root.$on("each-file-saving", this.onFileSaving);
		this.$root.$on("each-file-saved", this.onFileSaved);
		this.$on("screen-grabbed", this.onScreenGrabbed);
		this.$on("start-autoscreen", this.startAutomaticScreenshots);
		this.timeout = this.defaultTimeout;
		this.frequency = this.defaultFrequency;
		this.$store.dispatch("addIndexFileToList", this.indexFile);
	},
	beforeDestroy() {
		this.$root.$off("run-automatic-screenshots-for-all", this.startAutomaticScreenshots);
		this.$root.$off("screen-grabbed", this.onScreenGrabbed);
		this.$root.$off("refresh", this.forceUpdate);
		this.$root.$off("each-file-saving", this.onFileSaving);
		this.$root.$off("each-file-saved", this.onFileSaved);
		this.$off("screen-grabbed", this.onScreenGrabbed);
		this.$off("start-autoscreen", this.startAutomaticScreenshots);
		clearInterval(this.timeStampInterval);
		this.$store.dispatch("clearIndexFileList");
	},
	watch: {
		defaultTimeout: function(val) {
			this.timeout = val;
		},
		defaultFrequency: function(val) {
			this.frequency = val;
		}
	}
};
</script>

<style scoped>
.indexFile-box {
	padding: 12px 24px 36px 36px;
	display: flex;
	align-items: flex-start;
}
.screenshots-container {
	display: flex;
	flex-wrap: wrap;
}
</style>
