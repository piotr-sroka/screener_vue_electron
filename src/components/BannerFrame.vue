<template>
	<div>
		<iframe ref="frame" class="banner-frame" scrolling="no" frameborder="0" :src="banner.htmlPath" @load="checkCanvas" :width="canvas ? canvas.width : 0" :height="canvas ? canvas.height : 0"></iframe>
	</div>
</template>
<script>
export default {
	props: ["banner", "maxBannerWidth", "maxBannerHeight"],
	data() {
		return {
			bannerFrame: null,
			bannerDocument: null,
			bannerBody: null,
			canvas: null
		};
	},
	methods: {
		reloadBanner() {
			this.$refs.frame.src = this.banner.htmlPath;
		},
		checkCanvas(e) {
			this.bannerFrame = e.target;
			this.bannerDocument = this.bannerFrame.contentDocument ? this.bannerFrame.contentDocument : this.bannerFrame.contentWindow.document;
			this.bannerBody = this.bannerDocument.body;
			this.canvas = this.bannerDocument.querySelector("canvas");
			if (this.canvas && this.bannerBody) this.resizeBannerFrame();
		},
		resizeBannerFrame() {
			this.bannerFrame.style.display = "block";
			const bannerWidth = this.canvas.width;
			const bannerHeight = this.canvas.height;
			let ratio = 1;
			if (bannerWidth > this.maxBannerWidth) {
				ratio = this.maxBannerWidth / bannerWidth;
				if (bannerHeight * ratio > this.maxBannerHeight) {
					ratio = this.maxBannerHeight / bannerHeight;
				}
			} else if (bannerHeight > this.maxBannerHeight) {
				ratio = this.maxBannerHeight / bannerHeight;
				if (bannerWidth * ratio > this.maxBannerWidth) {
					ratio = this.maxBannerWidth / bannerWidth;
				}
			}

			this.setPositionZero(this.bannerBody);
			this.setPositionZero(this.canvas);
			this.bannerBody.style.transform = "scale(" + ratio + ")";

			this.bannerFrame.style.width = bannerWidth * ratio + "px";
			this.bannerFrame.style.height = bannerHeight * ratio + "px";
		},
		setPositionZero(elem) {
			if (elem != null && elem != undefined) {
				elem.style.position = "absolute";
				elem.style.left = 0;
				elem.style.top = 0;
				elem.style.margin = 0;
				elem.style.padding = 0;
				elem.style.transformOrigin = "top left";
			}
		}
	},
	mounted() {
		this.$on("reload", this.reloadBanner);
	},
	watch: {
		maxBannerWidth: function(val) {
			this.maxBannerWidth = val;
			if (this.bannerFrame) this.resizeBannerFrame();
		},
		maxBannerHeight: function(val) {
			this.maxBannerHeight = val;
			if (this.bannerFrame) this.resizeBannerFrame();
		}
	}
};
</script>
<style scoped>
.banner-frame {
	pointer-events: none;
}
</style>
