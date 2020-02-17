<template>
	<div class="preview-box" @click="closePreview">
		<header class="preview-header">
			<div class="buttons" @click.stop>
				<font-awesome-icon class="option" icon="times" title="Preview asset" @click="closePreview" />
			</div>
		</header>
		<div class="preview-screenshot">
			<img class="image" :src="currentPreviewedScreenShot" alt="" @click.stop />
		</div>
		<perfect-scrollbar>
			<div class="screenshots-container" @click.stop>
				<ScreenShot v-for="(screenShot, index) in screenShots" :class="index == previewIndex ? 'active' : ''" type="fast" :screenShot="screenShot" :key="index" v-on:screenshot-preview="previewScreenShot" v-on:screenshot-remove="removeScreenShot" />
			</div>
		</perfect-scrollbar>
	</div>
</template>
<script>
import ScreenShot from "./ScreenShot";

export default {
	components: {
		ScreenShot
	},
	props: ["screenShots", "previewIndex"],
	computed: {
		currentPreviewedScreenShot() {
			return this.screenShots[this.previewIndex];
		}
	},
	methods: {
		closePreview(e) {
			this.$emit("close");
		},
		previewScreenShot(screenShot) {
			this.$emit("change-preview", screenShot);
			// this.showFastPreview = true;
		},
		removeScreenShot(screenShot) {
            this.$emit("remove-preview", screenShot);
			this.$forceUpdate();
			// this.$store.dispatch("removeScreenShot", {slide: this.slide, screenShot});
			// this.$forceUpdate();
		},
		toggleBodyClass(addRemoveClass, className) {
			const el = document.body;
			if (addRemoveClass === "addClass") {
				el.classList.add(className);
			} else {
				el.classList.remove(className);
			}
		}
    },
    watch: {
        previewIndex: function(val) {
            this.$forceUpdate();
        }
    },
	mounted() {
		this.toggleBodyClass("addClass", "scrollable");
	},
	destroyed() {
		this.toggleBodyClass("removeClass", "scrollable");
	}
};
</script>
<style scoped>
.preview-box {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.8);
	color: #eceff1;
}
.preview-screenshot {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 40px;
	height: Calc(100% - 324px);
}
.preview-screenshot .image {
	max-width: 100%;
	max-height: 100%;
}
.preview-header {
	display: flex;
}
.buttons {
	margin-left: auto;
	display: flex;
	align-items: center;
	padding: 24px;
}
.option {
	font-size: 1.6em;
	cursor: pointer;
}
.option:not(:last-of-type) {
	margin-right: 12px;
}
.screenshots-container {
	margin-top: 24px;
	display: flex;
	flex-wrap: wrap;
	height: 225px;
}
.screenshot {
	opacity: 0.6;
	transition: opacity 0.1s linear;
}
.screenshot:hover,
.screenshot.active {
	opacity: 1;
}
</style>
