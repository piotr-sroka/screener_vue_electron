<template>
	<div class="size-box">
		<BranchHeader
			:title="size.name"
			:onclick="
				() => {
					return;
				}
			"
			collapsable="false"
		/>
		<div class="branch-content size-content">
			<IndexFile class="size-child" v-for="indexFile in indexFiles" :key="indexFile.name" :indexFile="indexFile"></IndexFile>
		</div>
	</div>
</template>

<script>
import BranchHeader from "./BranchHeader";
import IndexFile from "./IndexFile";

export default {
	components: {
		BranchHeader,
		IndexFile
	},
	props: ["size"],
	data() {
		return {};
	},
	computed: {
		indexFiles() {
			return this.size.indexFiles || [];
		}
	},
	methods: {},
	mounted() {}
};
</script>

<style scoped></style>
