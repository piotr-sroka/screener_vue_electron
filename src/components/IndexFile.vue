<template>
	<div class="indexFile-box">
		<BannerFrame :banner="indexFile" :maxBannerWidth="maxWidth" :maxBannerHeight="maxHeight" :type="type" />
		<BannerOptions :banner="indexFile" :type="type" />
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
	props: ["indexFile", "type"],
	data() {
		return {
			bannerFrame: null,
			bannerDocument: null,
			bannerBody: null,
			canvas: null
		};
	},
	computed: {
		maxWidth() {
			return this.type === "veeva" ? 200 : 100;
		},
		maxHeight() {
			return this.type === "veeva" ? 200 : 100;
		},
	},
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
