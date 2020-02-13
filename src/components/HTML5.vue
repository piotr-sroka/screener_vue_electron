<template>
	<section class="page">
		<div class="drop-zone-container">
			<Dropzone v-if="!tree.campaigns.length" />
			<Tree v-else />
		</div>
	</section>
</template>

<script>
import {mapGetters} from "vuex";
import Dropzone from "./Dropzone";
import Tree from "./Tree";

export default {
	components: {
		Dropzone,
		Tree
	},
	computed: {
		...mapGetters(["tree"])
	},
	mounted() {
		this.$store.dispatch("removeTheTrees");
	}
};
</script>

<style scoped></style>
