<template>
	<header class="header">
		<img class="header-image" :src="image_url" alt="" />
		<div @click="goBack" class="header-back"><font-awesome-icon icon="arrow-alt-circle-left" title="Back to Home" /></div>
		<div class="header-menu">
			<font-awesome-icon class="menu-icon" icon="cog" title="Preview asset" v-show="tree.campaigns.length || veevaSlides.length" />
			<div class="all-menu">
				<div class="menu-item" @click="createPreviewsForAll">
					<font-awesome-icon class="item-icon" icon="image" title="Preview asset" />
					<span>Create previews for each slide (full and thumb)</span>
				</div>
				<div class="menu-item" @click="automateScreenShotsForAll">
					<font-awesome-icon class="item-icon" icon="camera" title="Preview asset" />
					<span>Run automatic screenshots for all files</span>
				</div>
				<div class="menu-item" @click="previewAll">
					<font-awesome-icon class="item-icon" icon="eye" title="Preview asset" />
					<span>Preview all screenshots</span>
				</div>
				<div class="menu-item" @click="saveAllToPdf">
					<font-awesome-icon class="item-icon" icon="file-pdf" title="Preview asset" />
					<span>Save all previews to PDF</span>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
import {mapGetter, mapGetters} from "vuex";

export default {
	props: ["image_url", "title"],
	data() {
		return {
			allMenuOpened: false
		};
	},
	computed: {
		...mapGetters(["tree", "veevaSlides"])
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
		saveAllToPdf() {}
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
	z-index: 999;
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
</style>
