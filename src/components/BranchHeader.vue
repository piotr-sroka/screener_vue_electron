<template>
	<header class="title" @click="onclick ? onclick : null">
		<h3 class="title-header">{{ title }}</h3>
		<div class="branch-settings" v-if="collapsable == 'true'">
			<font-awesome-icon v-if="!collapsed" icon="caret-up" />
			<font-awesome-icon v-if="collapsed" icon="caret-down" />
		</div>
	</header>
</template>

<script>
export default {
	components: {},
	props: ["title", "onclick", "collapsable", "collapsed"],
	data() {
		return {};
	},
	computed: {},
	methods: {},
	mounted() {}
};
</script>

<style scoped>
.title {
	display: flex;
}
.title-header {
	padding-right: 24px;
	text-overflow: ellipsis;
	overflow: hidden;
}
.branch-settings {
	margin-left: auto;
	max-width: 25%;
}
</style>
