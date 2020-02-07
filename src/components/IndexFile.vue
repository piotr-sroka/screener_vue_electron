<template>
	<div class="indexFile-box">
		<BannerFrame :banner="indexFile" maxBannerWidth="100" maxBannerHeight="100" />
		<BannerOptions :banner="indexFile" />
	</div>
</template>

<script>
import fs from "fs";
import path from "path";

import BannerFrame from "./BannerFrame";
import BannerOptions from "./BannerOptions";

export default {
	components: {
		BannerFrame,
		BannerOptions
	},
	props: ["indexFile"],
	data() {
		return {
			bannerFrame: null,
			bannerDocument: null,
			bannerBody: null,
			canvas: null
		};
	},
	computed: {},
	methods: {},
	mounted() {}
};
</script>

<style scoped>
.indexFile-box {
	padding: 12px 24px 12px 36px;
	display: flex;
}
</style>
