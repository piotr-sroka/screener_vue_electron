<template>
	<div id="app">
		<Header v-if="headerImage !== ''" :image_url="headerImage" />
		<perfect-scrollbar>
			<main class="main">
				<router-view></router-view>
			</main>
		</perfect-scrollbar>
		<footer class="footer"></footer>
		<SimplePreview v-if="simplePreviewBanner" />
	</div>
</template>

<script>
import "reset-css";
import {mapGetters} from "vuex";

import Header from "./components/Header";
import SimplePreview from "./components/SimplePreview";

export default {
	name: "app",
	components: {
		Header,
		SimplePreview
	},
	computed: {
		...mapGetters(["tree", "simplePreviewBanner"]),
		headerImage() {
			let imagePath = "";
			switch (this.$route.path) {
				case "/html5":
					imagePath = "static/images/html5_logo.png";
					break;
				case "/veeva":
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
}
.ps {
	height: Calc(100% - 166px);
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
	height: 80px;
}
</style>
