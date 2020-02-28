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
				<div class="menu-item" @click="saveAllToPdf" v-if="currentLocation === 'veeva'">
					<div>
						<font-awesome-icon class="item-icon" icon="file-pdf" />
						<span>Save all previews to PDF</span>
					</div>
				</div>
				<div class="menu-item" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" icon="copy" />
						<span>Save all previews to:</span>
					</div>
					<div class="item-submenu">
						<div class="submenu-item">
							<p class="submenu-checkbox"><input type="checkbox" @change="saveEachOptions" v-model="eachSaveOptions.all.pdf" id="save-all-pdf-checkbox" /><label for="save-all-pdf-checkbox">PDF</label></p>
						</div>
						<div class="submenu-item">
							<p class="submenu-checkbox"><input type="checkbox" @change="saveEachOptions" v-model="eachSaveOptions.all.jpg" id="save-all-jpg-checkbox" /><label for="save-all-jpg-checkbox">JPG</label></p>
						</div>
						<div class="submenu-item">
							<p class="submenu-checkbox"><input type="checkbox" @change="saveEachOptions" v-model="eachSaveOptions.all.png" id="save-all-png-checkbox" /><label for="save-all-png-checkbox">PNG</label></p>
						</div>
						<div class="submenu-item">
							<button class="submenu-button" @click="saveEachAllFiles">Save</button>
						</div>
					</div>
				</div>
				<!-- <div class="menu-item" @click="saveEachToJpg" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" icon="file-image" />
						<span>Save all previews to JPG</span>
					</div>
				</div>
				<div class="menu-item" @click="saveEachToPng" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" :icon="['far', 'file-image']" />
						<span>Save all previews to PNG</span>
					</div>
				</div> -->
				<div class="menu-item" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" icon="copy" />
						<span>Save last frames to:</span>
					</div>
					<div class="item-submenu">
						<div class="submenu-item">
							<p class="submenu-checkbox"><input type="checkbox" @change="saveEachOptions" v-model="eachSaveOptions.last.jpg" id="save-last-jpg-checkbox" /><label for="save-last-jpg-checkbox">JPG</label></p>
						</div>
						<div class="submenu-item">
							<p class="submenu-checkbox"><input type="checkbox" @change="saveEachOptions" v-model="eachSaveOptions.last.png" id="save-last-png-checkbox" /><label for="save-last-png-checkbox">PNG</label></p>
						</div>
						<div class="submenu-item">
							<button class="submenu-button" @click="saveEachLastFrames">Save</button>
						</div>
					</div>
				</div>
				<!-- <div class="menu-item" @click="saveLastToJpg" v-if="currentLocation === 'html5'">
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
				</div> -->
				<div class="menu-item" @click="createZip" v-if="currentLocation === 'html5'">
					<div>
						<font-awesome-icon class="item-icon" icon="file-archive" />
						<span>Create zip packages and save in _SENT</span>
					</div>
				</div>
				<div class="menu-item menu-info">
					<p>*Unselected previews types will be removed from folders.</p>
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
			submenuShown: false,
			eachSaveOptions: {
				all: {
					pdf: true,
					jpg: true,
					png: true
				},
				last: {
					jpg: true,
					png: true
				}
			}
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
		saveEachOptions() {
			localStorage.setItem("eachSaveOptions", JSON.stringify(this.eachSaveOptions));
		},
		saveEachAllFiles(e) {
			this.$root.$emit("save-each-all");
		},
		saveEachLastFrames(e) {
			this.$root.$emit("save-each-last");
		},
		saveEachToPdf(e) {
			this.$root.$emit("save-each-to-pdf");
		},
		saveEachToJpg(e) {
			this.$root.$emit("save-each-to-jpg");
		},
		saveEachToPng(e) {
			this.$root.$emit("save-each-to-png");
		},
		saveLastToJpg() {
			this.$root.$emit("save-each-last-frame-to-jpg");
		},
		saveLastToPng() {
			this.$root.$emit("save-each-last-frame-to-png");
		},
		createZip() {
			this.$root.$emit("save-each-to-zip");
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
		if (localStorage.getItem("eachSaveOptions")) {
			const savedEachSaveOptions = JSON.parse(localStorage.getItem("eachSaveOptions"));
			this.eachSaveOptions.all.pdf = savedEachSaveOptions.all.pdf;
			this.eachSaveOptions.all.jpg = savedEachSaveOptions.all.jpg;
			this.eachSaveOptions.all.png = savedEachSaveOptions.all.png;
			this.eachSaveOptions.last.jpg = savedEachSaveOptions.last.jpg;
			this.eachSaveOptions.last.png = savedEachSaveOptions.last.png;
		} else {
			localStorage.setItem("eachSaveOptions", JSON.stringify(this.eachSaveOptions));
		}
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
.menu-item.menu-info {
	align-items: flex-end;
	padding-top: 24px;
	color: #e64a19;
	border: none;
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
	padding: 12px 24px 0 24px;
	align-items: center;
	justify-content: space-between;
	width: 100%;
}
.submenu-item:not(:last-child) {
	margin-right: 12px;
}
.submenu-item:last-child {
	margin-left: 48px;
}
.submenu-item input {
	width: 60px;
	padding: 8px 12px;
	text-align: center;
	outline: none;
	border-width: 1px;
}
.submenu-button {
	border: 1px solid #eceff1;
	background: none;
	color: #eceff1;
	padding: 8px 24px;
	cursor: pointer;
	transition: all 0.2s linear;
	outline: none;
	min-width: 100px;
}
.submenu-button:hover {
	background-color: #eceff1;
	color: #577280;
}
.submenu-checkbox label {
	cursor: pointer;
	position: relative;
	padding: 0;
}
.submenu-checkbox input {
	opacity: 0;
	position: absolute;
}
.submenu-checkbox label::before {
	content: "";
	margin-right: 10px;
	display: inline-block;
	vertical-align: middle;
	width: 20px;
	height: 20px;
	background: #eceff1;
}
.submenu-checkbox:hover label::before,
.submenu-checkbox input:checked + label::before {
	background: #009688;
}
.submenu-checkbox input:checked + label::after {
	content: "";
	position: absolute;
	left: 5px;
	top: 7px;
	background: #eceff1;
	width: 2px;
	height: 2px;
	box-shadow: 2px 0 0 #eceff1, 4px 0 0 #eceff1, 4px -2px 0 #eceff1, 4px -4px 0 #eceff1, 4px -6px 0 #eceff1, 4px -8px 0 #eceff1;
	transform: rotate(45deg);
}
</style>
