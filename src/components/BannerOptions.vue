<template>
	<div class="banner-options">
		<font-awesome-icon class="option" icon="info-circle" title="Show asset info"/>
		<font-awesome-icon class="option" icon="eye" title="Preview asset" @click="previewBanner" />
	</div>
</template>

<script>
export default {
	components: {},
	props: ["banner"],
	data() {
		return {};
	},
	computed: {},
	methods: {
        previewBanner() {
            this.$store.dispatch("setSimplePreviewBanner", this.banner);
        }
    },
	mounted() {}
};
</script>

<style scoped>
.banner-options {
    margin-left: auto;
}
.option {
    cursor: pointer;
}
.option:not(:last-of-type) {
    margin-right: 8px;
}
</style>
