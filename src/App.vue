<template>
	<div id="app">
		<header class="header">
			<router-link v-if="this.$route.path !== '/'" to="/">back</router-link>
		</header>
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

import SimplePreview from "./components/SimplePreview";

export default {
	name: "app",
	components: {
		SimplePreview
	},
	computed: {
		...mapGetters(["tree", "simplePreviewBanner"])
	},
	mounted() {
		const tree = this.tree;
		if (tree.campaigns.length < 1 && this.$route.path !== "/") {
			this.$router.push("/");
		}
	}
};
</script>

<style>
html,
body,
body.swal2-shown.swal2-height-auto {
	background-color: #f8f8f8;
	height: 100% !important;
}
* {
	box-sizing: border-box;
}
::selection {
	background: #00838f;
	color: #f8f8f8;
}
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #00bcd4;
	height: 100%;
}
.header {
	height: 60px;
}
.ps {
	height: Calc(100% - 140px);
}
.main {
	display: flex;
	justify-items: center;
	height: 100%;
}
.footer {
	height: 80px;
}
</style>
