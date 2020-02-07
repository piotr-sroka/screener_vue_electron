<template>
	<div class="variant-box" :class="collapsed ? 'collapsed' : ''">
		<BranchHeader :title="variant.name" :onclick="toggleBranch" :collapsed="collapsed" collapsable="true" />
		<div class="branch-content variant-content">
			<Language class="variant-child" v-for="language in languages" :key="language.name" :language="language"></Language>
			<Size class="variant-child" v-for="size in sizes" :key="size.name" :size="size"></Size>
			<IndexFile class="variant-child" v-for="indexFile in indexFiles" :key="indexFile.name" :indexFile="indexFile"></IndexFile>
		</div>
	</div>
</template>

<script>
import BranchHeader from "./BranchHeader";
import Language from "./Language";
import Size from "./Size";
import IndexFile from "./IndexFile";

export default {
	components: {
		BranchHeader,
		Language,
		Size,
		IndexFile
	},
	props: ["variant"],
	data() {
		return {
			collapsed: false
		};
	},
	computed: {
		languages() {
			return this.variant.languages || [];
		},
		sizes() {
			return this.variant.sizes || [];
		},
		indexFiles() {
			return this.variant.indexFiles || [];
		}
	},
	methods: {
		toggleBranch() {
			this.collapsed = !this.collapsed;
		}
	},
	mounted() {}
};
</script>

<style scoped></style>
