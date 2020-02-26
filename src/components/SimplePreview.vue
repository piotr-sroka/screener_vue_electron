<template>
	<div class="preview-box" @click="closePreview">
		<header class="preview-header" @click.stop>
			<h3 class="title">{{ simplePreviewBanner.nc_name || simplePreviewBanner.name }}</h3>
			<div class="buttons">
				<font-awesome-icon class="option option-grab-screen" icon="camera" title="Grab screenshot" @click="grabScreenShot" :class="isGrabbingScreen ? 'active' : ''" />
				<font-awesome-icon class="option" icon="redo" title="Show asset info" @click="reloadBanner" />
				<font-awesome-icon class="option" icon="times" title="Preview asset" @click="closePreview" />
			</div>
		</header>
		<div class="banner-container" ref="bannerContainer">
			<BannerFrame ref="banner" :banner="simplePreviewBanner" :maxBannerWidth="maxPreviewBannerWidth" :maxBannerHeight="maxPreviewBannerHeight" :type="currentContentType" @click.stop />
		</div>
		<div class="screenshot-thumbs">
			<img class="thumb" v-for="(screenshot, index) in screenshotThumbs" :key="index" :src="screenshot" alt="" />
		</div>
	</div>
</template>
<script>
import {mapGetters} from "vuex";

import BannerFrame from "./BannerFrame";

export default {
	components: {
		BannerFrame
	},
	data() {
		return {
			maxPreviewBannerWidth: 0,
			maxPreviewBannerHeight: 0,
			bannerContainer: null,
			banner: null,
			isGrabbingScreen: false,
			screenshotThumbs: []
		};
	},
	computed: {
		...mapGetters(["simplePreviewBanner", "currentContentType"])
	},
	methods: {
		checkProperSize() {
			this.maxPreviewBannerWidth = window
				.getComputedStyle(this.bannerContainer, null)
				.getPropertyValue("width")
				.split("px")[0];
			this.maxPreviewBannerHeight = window
				.getComputedStyle(this.bannerContainer, null)
				.getPropertyValue("height")
				.split("px")[0];
		},
		reloadBanner() {
			this.$refs.banner.$emit("reload");
		},
		closePreview() {
			this.$store.dispatch("clearSimplePreviewBanner");
		},
		onWindowResize() {
			this.checkProperSize();
		},
		grabScreenShot() {
			if (!this.isGrabbingScreen) {
				this.isGrabbingScreen = true;
				this.$refs.banner.$emit("grab-screen");
			}
		},
		onScreenGrabbed(e) {
			if (this.currentContentType === "veeva") {
				this.$store.dispatch("screenGrabbed", {slide: this.simplePreviewBanner, shot: e.target.data, size: e.target.size});
			}
			if (this.currentContentType === "html5") {
				if (!this.simplePreviewBanner.screenShots.find(s => s.data === e.target.data)) {
					this.screenshotThumbs.push(e.target.data);
					setTimeout(this.removeFirstThumb, 2000);
					this.simplePreviewBanner.screenShots.push(e.target);
					this.$root.$emit("refresh");
				}
			}
			setTimeout(() => {
				this.isGrabbingScreen = false;
			}, 100);
		},
		removeFirstThumb() {
			if (this.screenshotThumbs.length) {
				this.screenshotThumbs.splice(0, 1);
			}
		}
	},
	mounted() {
		this.bannerContainer = this.$refs.bannerContainer;
		this.banner = this.$refs.banner;
		window.addEventListener("resize", this.onWindowResize);
		this.onWindowResize();
		this.$on("screen-grabbed", this.onScreenGrabbed);
	}
};
</script>
<style scoped>
.preview-box {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.8);
	color: #eceff1;
	z-index: 9;
}
.preview-header {
	display: flex;
}
.title {
	padding: 24px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	line-height: 38px;
	vertical-align: middle;
}
.buttons {
	margin-left: auto;
	display: flex;
	align-items: center;
	padding: 24px;
}
.option {
	font-size: 1.6em;
	cursor: pointer;
}
.option:not(:last-of-type) {
	margin-right: 12px;
}
.banner-container {
	width: Calc(100% - 240px);
	height: Calc(100% - 100px);
	margin: auto;
	display: flex;
	justify-content: center;
	align-items: center;
}
.option.option-grab-screen {
	margin-right: 48px;
	transition: color 0.1s linear;
}
.option-grab-screen.active {
	color: #004d40;
}
@media all and (max-width: 480px) {
	.banner-container {
		width: Calc(100% - 20px);
		height: Calc(100% - 20px);
	}
}
.screenshot-thumbs {
	position: fixed;
	width: 100%;
	height: 60px;
	bottom: 0;
	padding: 10px;
	display: flex;
	justify-content: flex-end;
	align-items: center;
}
.thumb {
	max-width: 60px;
	max-height: 60px;
	margin-right: 12px;
}
</style>
