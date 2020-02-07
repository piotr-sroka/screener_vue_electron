<template>
	<div class="language-box" :class="collapsed ? 'collapsed' : ''">
		<BranchHeader :title="language.name" :onclick="toggleBranch" :collapsed="collapsed" collapsable="true" />
		<div class="branch-content language-content">
			<Size class="language-child" v-for="size in sizes" :key="size.name" :size="size"></Size>
			<IndexFile class="language-child" v-for="indexFile in indexFiles" :key="indexFile.name" :indexFile="indexFile"></IndexFile>
		</div>
	</div>
</template>

<script>
import BranchHeader from "./BranchHeader";
import Size from "./Size";
import IndexFile from "./IndexFile";

export default {
	components: {
		BranchHeader,
		Size,
		IndexFile
	},
	props: ["language"],
	data() {
		return {
			collapsed: false
		};
	},
	computed: {
		sizes() {
			return this.language.sizes || [];
		},
		indexFiles() {
			return this.language.indexFiles || [];
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
