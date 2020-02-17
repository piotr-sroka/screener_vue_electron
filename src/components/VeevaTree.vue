<template>
	<div class="tree">
		<VeevaSlide v-for="(slide, index) in veevaSlides" :key="index" :slide="slide" />
	</div>
</template>

<script>
import {mapGetters} from "vuex";
import VeevaSlide from "./VeevaSlide";

export default {
	components: {
		VeevaSlide
	},
	data() {
		return {};
	},
	computed: {
		...mapGetters(["veevaSlides"])
	},
	methods: {
		onPositionChanged(e) {
			const slidePosition = e.slideId;
			const newPosition = e.direction === "down" ? (slidePosition + 1 === this.veevaSlides.length ? 0 : slidePosition + 1) : slidePosition - 1;
			this.$store.dispatch("changeSlidePosition", {slidePosition, newPosition});
		}
	},
	mounted() {
		this.$on("change-position", this.onPositionChanged);
	}
};
</script>

<style scoped>
.tree {
	display: flex;
	flex-direction: column;
	width: 100%;
}
</style>
