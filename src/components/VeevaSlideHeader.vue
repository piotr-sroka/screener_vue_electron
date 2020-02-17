<template>
	<header class="title">
		<h3 class="title-header">{{ slide.name }}</h3>
		<div class="slide-settings" v-if="mode === 'normal'">
			<font-awesome-icon class="settings-icon icon-big" icon="caret-up" title="Move up" @click="changePosition('up')" />
			<font-awesome-icon class="settings-icon icon-big" icon="caret-down" title="Move down" @click="changePosition('down')" />
			<font-awesome-icon class="settings-icon" icon="eye" title="Preview asset" @click="previewBanner" />
			<font-awesome-icon class="settings-icon" icon="camera" title="Automatic screenshot making" @click="$parent.$emit('auto-screen')" />
		</div>
		<div class="slide-settings" v-if="mode === 'screening'">
			<font-awesome-icon class="settings-icon" icon="ban" title="Cancel" @click="$parent.$emit('auto-screen-cancel')" />
			<Loader size="small" color="#B2DFDB" />
		</div>
	</header>
</template>

<script>
import Loader from "./Loader";

export default {
	components: {
		Loader
	},
	props: ["slide", "slideId", "mode"],
	data() {
		return {};
	},
	computed: {},
	methods: {
		previewBanner() {
			this.$store.dispatch("setSimplePreviewBanner", {banner: this.slide, type: "veeva"});
		},
		changePosition(dir) {
			this.$parent.$parent.$emit("change-position", {slideId: this.slideId, direction: dir});
		}
	},
	mounted() {}
};
</script>

<style scoped>
.title {
	width: 100%;
	background-color: #263238;
	color: #eceff1;
	padding: 12px;
	font-size: 1em;
	overflow: hidden;
	white-space: nowrap;
	display: flex;
	align-items: center;
}
.title .title-header {
	max-width: Calc(100% - 200px);
	text-overflow: ellipsis;
	overflow: hidden;
	margin-right: auto;
}
.slide-settings {
	display: flex;
	align-items: center;
}
.settings-icon {
	margin-right: 12px;
	font-size: 1em;
	height: 24px;
	line-height: 24px;
	vertical-align: middle;
	cursor: pointer;
}
.icon-big {
	font-size: 1.6em;
}
</style>
