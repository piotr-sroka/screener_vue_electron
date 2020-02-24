<template>
	<div class="grabber-frame">
		<iframe :src="slide.htmlPath || slide.indexFile" frameborder="0" @load="onIframeLoad" width="200" height="150"></iframe>
	</div>
</template>
<script>
export default {
	props: ["slide"],
	data() {
		return {
			frameWindow: null,
			frameDocument: null,
			canvas: null,
			slideContent: null,
			pagesToGrab: [],
			screenShots: []
		};
	},
	methods: {
		onIframeLoad(e) {
			this.frameWindow = e.target.contentWindow;
			this.frameDocument = e.target.contentDocument ? e.target.contentDocument : e.target.contentWindow.document;
			setTimeout(this.getConfig, 800);
		},
		getConfig() {
			const config = this.frameWindow.getConfig().slidesConfig[this.slide.name];
			this.canvas = this.frameDocument.querySelector("canvas");
			this.slideContent = this.frameWindow.getConfig().slide;
			this.addPageToGrab("slide");
			if (config.hasPopup) {
				config.popupConfig.popups.forEach(popup => {
					this.addPageToGrab("popup", this.slideContent[popup.popup]);
				});
			}
			if (config.referencePanel.references.available) {
				this.addPageToGrab("reference", this.slideContent.referencePanel.references);
			}
			if (config.referencePanel.furtherInformation.available) {
				this.addPageToGrab("reference", this.slideContent.referencePanel.furtherInformation);
			}
			if (config.referencePanel.studyDesign.available) {
				this.addPageToGrab("reference", this.slideContent.referencePanel.studyDesign);
			}
			this.grabPage(0);
		},
		addPageToGrab(type, mc) {
			if (!this.pagesToGrab.find(p => p.mc === mc)) {
				this.pagesToGrab.push({type, mc});
			}
		},
		grabSubPage(currentPage, page) {
			let currentFrame = page.mc.currentFrame;
			this.takeScreenShot();
			currentFrame++;
			if (currentFrame < page.mc.timeline.duration) {
				page.mc.gotoAndStop(currentFrame);
				setTimeout(() => {
					this.grabSubPage(currentPage, page);
				}, 50);
			} else {
				this.hideMc(page.type, page.mc);
				currentPage++;
				this.checkNextPage(currentPage);
			}
		},
		grabPage(index) {
			let currentPage = index;
			const page = this.pagesToGrab[currentPage];
			this.showMc(page.type, page.mc);
			if (!page.mc || (page.mc && page.mc.timeline.duration < 2)) {
				setTimeout(() => {
					this.takeScreenShot();
					this.hideMc(page.type, page.mc);
					currentPage++;
					this.checkNextPage(currentPage);
				}, 50);
			} else if (page.mc && page.mc.timeline.duration > 1) {
				setTimeout(() => {
					this.grabSubPage(currentPage, page);
				}, 50);
			}
		},
		checkNextPage(currentPage) {
			if (currentPage < this.pagesToGrab.length) {
				setTimeout(() => {
					this.grabPage(currentPage);
				}, 50);
			} else {
				this.$emit("grab-end");
			}
		},
		takeScreenShot() {
			const shot = this.canvas.toDataURL("image/png");
			this.screenShots.push(shot);
			this.$emit("grab-screen", {
				target: {
					data: shot,
					size: {width: this.canvas.width, height: this.canvas.height}
				}
			});
		},
		showMc(type, mc) {
			if (type === "popup") {
				mc.alpha = 1;
				mc.visible = true;
				mc.scaleX = 1;
				mc.scaleY = 1;
			}
			if (type === "reference") {
				mc.parent.y = 0;
			}
		},
		hideMc(type, mc) {
			if (type === "popup") {
				mc.alpha = 0;
				mc.visible = false;
				mc.scaleX = 0;
				mc.scaleY = 0;
			}
			if (type === "reference") {
				mc.parent.y = 1536;
			}
		}
	}
};
</script>
<style scoped>
.grabber-frame {
	display: none;
}
</style>
