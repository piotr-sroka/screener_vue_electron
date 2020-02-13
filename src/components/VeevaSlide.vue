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
        <div v-if="screenShots.length" class="screenshots-container">
            <div class="screenshot" v-for="(screenShot, index) in screenShots" :key="index">
                <img class="screenshot-image" :src="screenShot" alt="">
            </div>
        </div>
	</div>
</template>

<script>
import VeevaSlideHeader from "./VeevaSlideHeader";
import IndexFile from "./IndexFile";
import Loader from "./Loader";
import ThumbGenerator from "./ThumbGenerator";
import ScreenGrabber from "./ScreenGrabber";

export default {
	props: ["slide"],
	components: {
		VeevaSlideHeader,
		IndexFile,
		Loader,
        ThumbGenerator,
        ScreenGrabber
	},
	data() {
		return {
			defaultThumb: "",
			generatingThumb: false,
            isScreeningRunning: false,
            screenShots: []
		};
	},
	computed: {
		mode() {
			return this.isScreeningRunning ? "screening" : "normal";
		}
	},
	methods: {
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
			this.isScreeningRunning = true;
			console.log("START SCREENING...");
		},
		stopAutoScreen() {
			this.isScreeningRunning = false;
        },
        onSlideGrabbed(e) {
            this.screenShots.push(e.target.data);
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
.screenshot {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
}
.screenshot-image {
    max-width: 100%;
    max-height: 100%;
}
</style>
