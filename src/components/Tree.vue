<template>
	<div class="tree">
		<Campaign v-for="campaign in tree.campaigns" :key="campaign.name" :name="campaign.name" :campaign="campaign"></Campaign>
	</div>
</template>

<script>
import {mapGetters} from "vuex";
import Campaign from "./Campaign";

export default {
	components: {
		Campaign
	},
	data() {
		return {};
	},
	computed: {
		...mapGetters(["tree"])
	},
	methods: {},
	mounted() {}
};
</script>

<style scoped>
.tree {
	display: flex;
	flex-direction: column;
	width: 100%;
}
</style>
