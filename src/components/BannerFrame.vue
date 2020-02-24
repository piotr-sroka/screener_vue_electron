<template>
	<div :style="cssVars">
		<iframe ref="frame" class="banner-frame" scrolling="no" frameborder="0" :src="banner.htmlPath || banner.indexFile" @load="checkCanvas" :width="canvas ? canvas.width : 0" :height="canvas ? canvas.height : 0"></iframe>
	</div>
</template>
<script>
export default {
	props: ["banner", "maxBannerWidth", "maxBannerHeight", "type"],
	data() {
		return {
			bannerFrame: null,
			bannerWindow: null,
			bannerDocument: null,
			bannerBody: null,
			canvas: null
		};
	},
	computed: {
		cssVars() {
			return {
				"--p-events": this.type === "veeva" ? "all" : "none"
			};
		}
	},
	methods: {
		reloadBanner() {
			this.$refs.frame.src = this.banner.htmlPath || this.banner.indexFile;
		},
		checkCanvas(e) {
			this.bannerFrame = e.target;
			this.bannerWindow = this.bannerFrame.contentWindow;
			this.bannerDocument = this.bannerFrame.contentDocument ? this.bannerFrame.contentDocument : this.bannerFrame.contentWindow.document;
			this.bannerBody = this.bannerDocument.body;
			this.canvas = this.bannerDocument.querySelector("canvas");
			if (this.canvas && this.bannerBody) this.resizeBannerFrame();
			if (this.bannerWindow) {
				this.bannerWindow.onerror = () => {
					//handle error
				};
			}
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
			if (this.type !== "veeva") {
				this.setPositionZero(this.bannerBody);
				this.setPositionZero(this.canvas);
				this.bannerBody.style.transform = "scale(" + ratio + ")";
			} else {
				this.bannerBody.style.transformOrigin = "top left";
			}
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
		},
		grabScreen() {
			const shot = this.canvas.toDataURL("image/png");
			this.$parent.$emit("screen-grabbed", {target: {data: shot, size: {width: this.canvas.width, height: this.canvas.height}}});
		}
	},
	mounted() {
		this.$on("reload", this.reloadBanner);
		this.$on("grab-screen", this.grabScreen);
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
	pointer-events: var(--p-events);
}
</style>
