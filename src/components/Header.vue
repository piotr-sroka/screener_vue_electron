<template>
	<header class="header">
		<img class="header-image" :src="image_url" alt="" />
		<div @click="goBack" class="header-back"><font-awesome-icon icon="arrow-alt-circle-left" title="Back to Home" /></div>
		<div class="header-menu">
			<div class="loader-container">
				<Loader size="m-small" v-show="isWorking" />
			</div>
			<font-awesome-icon class="menu-icon" icon="cog" title="Preview asset" v-show="tree.campaigns.length || veevaSlides.length" />
			<div class="all-menu">
				<div class="menu-item" @click="createPreviewsForAll" v-if="currentLocation === 'veeva'">
					<font-awesome-icon class="item-icon" icon="image" />
					<span>Create previews for each slide (full and thumb)</span>
				</div>
				<div class="menu-item" @click="automateScreenShotsForAll">
					<font-awesome-icon class="item-icon" icon="camera" />
					<span>Run automatic screenshots for all files</span>
				</div>
				<div class="menu-item" @click="previewAll" v-if="currentLocation === 'veeva'">
					<font-awesome-icon class="item-icon" icon="eye" />
					<span>Preview all screenshots</span>
				</div>
				<div class="menu-item" @click="saveAllToPdf">
					<font-awesome-icon class="item-icon" icon="file-pdf" />
					<span>Save all previews to PDF</span>
				</div>
				<div class="menu-item" @click="saveLastToJpg" v-if="currentLocation === 'html5'">
					<font-awesome-icon class="item-icon" icon="file-image" />
					<span>Save last frames to JPG</span>
				</div>
				<div class="menu-item" @click="saveLastToPng" v-if="currentLocation === 'html5'">
					<font-awesome-icon class="item-icon" :icon="['far', 'file-image']" />
					<span>Save last frames to PNG</span>
				</div>
				<div class="menu-item" @click="createZip" v-if="currentLocation === 'html5'">
					<font-awesome-icon class="item-icon" icon="file-archive" />
					<span>Create zip packages and save in _SENT</span>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
import {mapGetter, mapGetters} from "vuex";
import Loader from "./Loader";

export default {
	props: ["image_url", "title"],
	components: {
		Loader
	},
	data() {
		return {
			allMenuOpened: false,
			isWorking: false
		};
	},
	computed: {
		...mapGetters(["tree", "veevaSlides", "allScreenShots", "currentLocation"])
	},
	methods: {
		goBack() {
			this.$store.dispatch("setLocation", "home");
		},
		createPreviewsForAll() {
			this.$root.$emit("create-previews-for-all");
		},
		automateScreenShotsForAll() {
			this.$root.$emit("run-automatic-screenshots-for-all");
		},
		previewAll() {
			this.$root.$emit("preview-all");
		},
		saveAllToPdf() {
			this.$store.dispatch("setAllScreenShots");
			if (this.allScreenShots.length) {
				this.isWorking = true;
				this.$root.$emit("save-all-to-pdf");
			}
		},
		saveLastToJpg() {},
		saveLastToPng() {},
		createZip() {}
	},
	mounted() {
		this.$root.$on("pdf-saved", () => {
			this.isWorking = false;
		});
	}
};
</script>

<style scoped>
.header {
	display: flex;
	padding: 12px;
	padding-bottom: 34px;
	align-items: center;
	/* justify-content: space-between; */
}
.header-image {
	max-width: 40px;
	max-height: 40px;
	object-fit: contain;
	margin-right: 20px;
}
.header-back {
	cursor: pointer;
}
.header-back,
.header-menu {
	border: none;
	font-size: 2em;
	color: #009688;
	outline-color: transparent;
	transition: transform 0.2s linear;
}
.header-back:hover {
	transform: translateX(-5px);
}
.header-menu {
	margin-left: auto;
	color: #263238;
}
.menu-icon {
	transition: transform 0.2s linear;
	z-index: 8;
	margin-left: 12px;
	cursor: pointer;
}
.menu-icon:hover {
	transform: rotate(-90deg);
}
.all-menu {
	position: absolute;
	right: 48px;
	top: -200px;
	z-index: 9;
	background-color: #263238;
	opacity: 0;
	padding: 12px;
	transition: all 0.2s linear;
	box-sizing: border-box;
}
.header-menu:hover .all-menu {
	top: 16px;
	opacity: 0.9;
}
.menu-item {
	margin: 12px;
	padding-bottom: 12px;
	color: #eceff1;
	display: flex;
	align-items: center;
	font-size: 12px;
	cursor: pointer;
	border-bottom: 1px solid #577280;
	transition: all 0.2s linear;
}
.menu-item:hover {
	border-bottom: 1px solid #eceff1;
}
.menu-item .item-icon {
	margin-right: 12px;
	font-size: 1.4em;
	width: 30px;
	text-align: center;
}
.header-menu {
	display: flex;
	align-items: center;
}
.loader-container {
	align-items: center;
	display: flex;
}
</style>
