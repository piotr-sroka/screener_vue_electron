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
					<div>
						<font-awesome-icon class="item-icon" icon="image" />
						<span>Create previews for each slide (full and thumb)</span>
					</div>
				</div>
				<div class="menu-item" @click="automateScreenShotsForAll">
					<div>
						<font-awesome-icon class="item-icon" icon="camera" />
						<span>Run automatic screenshots for all files</span>
					</div>
					<div class="item-submenu" v-if="currentLocation === 'html5'">
						<div class="submenu-item">
							<p>Timeout: <input type="number" min="1" max="60" :value="defaultTimeout" @input="setTimeout" /></p>
						</div>
						<div class="submenu-item">
							<p>Frequency: <input type="number" min=".1" max="60" step=".1" :value="defaultFrequency" @input="setFrequency" /></p>
						</div>
						<div class="submenu-item">
							<button class="submenu-button" @click="runAutomate">Run</button>
						</div>
					</div>
				</div>
				<div class="menu-item" @click="previewAll" v-if="currentLocation === 'veeva'">
					<div>
						<font-awesome-icon class="item-icon" icon="eye" />
						<span>Preview all screenshots</span>
					</div>
				</div>
				<div class="menu-item" @click="currentLocation === 'veeva' ? saveAllToPdf($event) : saveEachToPdf($event)">
					<div>
						<font-awesome-icon class="item-icon" icon="file-pdf" />
						<span>Save all previews to PDF</span>
					</div>
				</div>
				<div class="menu-item" @click="saveLastToJpg" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" icon="file-image" />
						<span>Save last frames to JPG</span>
					</div>
				</div>
				<div class="menu-item" @click="saveLastToPng" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" :icon="['far', 'file-image']" />
						<span>Save last frames to PNG</span>
					</div>
				</div>
				<div class="menu-item" @click="createZip" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" icon="file-archive" />
						<span>Create zip packages and save in _SENT</span>
					</div>
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
			isWorking: false,
			submenuShown: false
		};
	},
	computed: {
		...mapGetters(["tree", "veevaSlides", "allScreenShots", "currentLocation", "defaultTimeout", "defaultFrequency"])
	},
	methods: {
		goBack() {
			this.$store.dispatch("setLocation", "home");
		},
		createPreviewsForAll() {
			this.$root.$emit("create-previews-for-all");
		},
		automateScreenShotsForAll() {
			if (this.currentLocation === "veeva") return this.runAutomate();
			if (this.currentLocation === "html5") {
				this.submenuShown = true;
			}
		},
		runAutomate() {
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
		saveEachToPdf(e) {
			this.$root.$emit("save-each-to-pdf");
		},
		saveLastToJpg() {
			this.$root.$emit("save-each-last-frame-to-jpg");
		},
		saveLastToPng() {
			this.$root.$emit("save-each-last-frame-to-png");
		},
		createZip() {
			this.$root.$emit("save-each-last-frame-to-zip");
		},
		setTimeout(e) {
			this.$store.dispatch("setDefaultTimeout", e.target.value);
		},
		setFrequency(e) {
			this.$store.dispatch("setDefaultFrequency", e.target.value);
		}
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
	top: -300px;
	z-index: 9;
	background-color: #263238;
	opacity: 0;
	padding: 12px;
	transition: all 0.2s linear;
	box-sizing: border-box;
}
.header-menu:hover .all-menu {
	top: 16px;
	opacity: 0.95;
}
.menu-item {
	margin: 12px;
	padding-bottom: 12px;
	color: #eceff1;
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	justify-content: center;
	align-items: flex-start;
	font-size: 12px;
	cursor: pointer;
	border-bottom: 1px solid #577280;
	transition: all 0.2s linear;
}
.menu-item > div {
	display: flex;
	align-items: center;
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
.item-submenu {
	display: flex;
	flex: 100%;
	padding-top: 12px;
	align-items: center;
}
.submenu-item:not(:last-child) {
	margin-right: 12px;
}
.submenu-item input {
	width: 60px;
	padding: 8px 12px;
	text-align: center;
	outline: none;
}
.submenu-button {
	border: 1px solid #eceff1;
	background: none;
	color: #eceff1;
	padding: 8px 24px;
	cursor: pointer;
	transition: all 0.2s linear;
	outline: none;
}
.submenu-button:hover {
	background-color: #eceff1;
	color: #577280;
}
</style>
