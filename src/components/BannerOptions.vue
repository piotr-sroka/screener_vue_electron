<template>
	<div class="banner-options">
		<Loader size="small" v-if="isWorking" />
		<font-awesome-icon class="option" icon="info-circle" title="Show asset info" />
		<font-awesome-icon class="option" icon="eye" title="Preview asset" @click="previewBanner" />
		<font-awesome-icon class="option" icon="camera" title="Automatic screenshot making" @click="startAutoScreen" />
	</div>
</template>

<script>
import Loader from "./Loader";

export default {
	components: {
		Loader
	},
	props: ["banner", "type", "isWorking"],
	data() {
		return {};
	},
	computed: {},
	methods: {
		previewBanner() {
			this.$store.dispatch("setSimplePreviewBanner", {banner: this.banner, type: this.type});
		},
		startAutoScreen() {
			this.$parent.$emit("start-autoscreen");
		}
	},
	mounted() {}
};
</script>

<style scoped>
.banner-options {
	margin-left: auto;
	display: flex;
	align-items: center;
}
.option {
	cursor: pointer;
}
.option:not(:last-of-type) {
	margin-right: 8px;
}
</style>
