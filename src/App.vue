<template>
	<div id="app" :class="currentLocation === 'home' ? 'no-header' : ''">
		<Header v-if="headerImage !== ''" :image_url="headerImage" />
		<perfect-scrollbar>
			<main class="main">
				<Main v-if="currentLocation === 'home'" />
				<HTML5 v-if="currentLocation === 'html5'" />
				<Veeva v-if="currentLocation === 'veeva'" />
			</main>
		</perfect-scrollbar>
		<footer class="footer">
			<Updater />
		</footer>
		<SimplePreview v-if="simplePreviewBanner" />
		<Saver />
	</div>
</template>

<script>
import "reset-css";
import {mapGetters} from "vuex";
import Main from "./components/Main";
import HTML5 from "./components/HTML5";
import Veeva from "./components/Veeva";
import Header from "./components/Header";
import SimplePreview from "./components/SimplePreview";
import Updater from "./components/Updater";
import Saver from "./components/Saver";

export default {
	name: "app",
	components: {
		Header,
		SimplePreview,
		Main,
		Veeva,
		HTML5,
		Updater,
		Saver
	},
	computed: {
		...mapGetters(["tree", "simplePreviewBanner", "currentLocation"]),
		headerImage() {
			let imagePath = "";
			switch (this.currentLocation) {
				case "html5":
					imagePath = "static/images/html5_logo.png";
					break;
				case "veeva":
					imagePath = "static/images/veeva_logo.png";
					break;
			}
			return imagePath;
		}
	},
	mounted() {
		const tree = this.tree;
		// if (tree.campaigns.length < 1 && this.$route.path !== "/") {
		// 	this.$router.push("/");
		// }
	}
};
</script>

<style>
html,
body,
body.swal2-shown.swal2-height-auto {
	background-color: #eceff1;
	height: 100% !important;
}
* {
	box-sizing: border-box;
}
::selection {
	background: #263238;
	color: #eceff1;
}
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #37474f;
	height: 100%;
	position: relative;
	overflow: hidden;
}
.scrollable #app {
	overflow: hidden;
}
.ps {
	height: Calc(100% - 126px);
}
.no-header .ps {
	height: Calc(100% - 40px);
}
.scrollable .ps {
	height: unset;
}
.preview-box .ps {
	height: unset;
}
.main,
.drop-zone-container {
	display: flex;
	justify-items: center;
	height: 100%;
}
.page {
	width: 100%;
	height: 100%;
}
.footer {
	height: 40px;
}
.swal2-header, .swal2-content, .swal2-actions {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
}
</style>
