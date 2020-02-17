<template>
	<div class="screenshot">
		<div class="options">
			<font-awesome-icon class="option-icon" icon="eye" title="Preview frame" @click="onPreviewClick" v-if="type !== 'fast'" />
			<font-awesome-icon class="option-icon" icon="times" title="Delete frame" @click="onRemoveClick" />
		</div>
		<img class="screenshot-image" :src="screenShot" alt="" @click="onPreviewClick" />
	</div>
</template>
<script>
export default {
	props: ["screenShot", "type"],
	methods: {
		onPreviewClick() {
			this.$emit("screenshot-preview", this.screenShot);
		},
		onRemoveClick() {
			this.$emit("screenshot-remove", this.screenShot);
		}
	}
};
</script>
<style scoped>
.screenshot {
	width: 140px;
	height: 100px;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 12px;
	position: relative;
}
.screenshot-image {
	max-width: 100%;
	max-height: 100%;
}
.options {
	position: absolute;
	display: flex;
	right: 0;
	top: 0;
}
.option-icon {
	margin-left: 5px;
	cursor: pointer;
}
</style>
