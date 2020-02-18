<template>
	<div class="main-menu">
		<MainMenuItem image_url="static/images/html5_logo.png" link="html5" />
		<MainMenuItem image_url="static/images/veeva_logo.png" link="veeva" />
	</div>
</template>

<script>
import path from "path";
import MainMenuItem from "./MainMenuItem";

export default {
	components: {
		MainMenuItem
	},
	data() {
		return {
		};
	}
};
</script>

<style scoped>
.main-menu {
    display: flex;
    margin: auto;
}
</style>
