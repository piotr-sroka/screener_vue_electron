<template>
	<div class="grabber-frame">
		<iframe :src="slidePath" frameborder="0" @load="onIframeLoad" width="200" height="150"></iframe>
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
			screenShots: [],
			baseDelay: 50
		};
	},
	computed: {
		slidePath() {
			let slidePath = this.slide.htmlPath || this.slide.indexFile;
			if (process.platform === "darwin") slidePath = `file://${slidePath}`;
			return slidePath;
		}
	},
	methods: {
		onIframeLoad(e) {
			this.frameWindow = e.target.contentWindow;
			this.frameDocument = e.target.contentDocument ? e.target.contentDocument : e.target.contentWindow.document;
			setTimeout(this.getConfig, 800);
		},
		getReferencePanelFramesConfig(type, config) {
			if (type === "slide") {
				const refConfig = {};
				if (config.referencePanel.references.available) {
					refConfig.references = [];
					refConfig.references.push(config.referencePanel.references.frame);
				}
				if (config.referencePanel.studyDesign.available) {
					refConfig.studyDesign = [];
					refConfig.studyDesign.push(config.referencePanel.studyDesign.frame);
				}
				if (config.referencePanel.furtherInformation.available) {
					refConfig.furtherInformation = [];
					refConfig.furtherInformation.push(config.referencePanel.furtherInformation.frame);
				}
				if (refConfig.references !== null || refConfig.studyDesign !== null || refConfig.furtherInformation !== null) return refConfig;
				return null;
			}
			if (type === "popup") {
				if (!config.referencePanelFrames) return null;
				const {references, studyDesign, furtherInformation} = config.referencePanelFrames;
				return {references, studyDesign, furtherInformation};
			}
		},
		getConfig() {
			const config = this.frameWindow.getConfig().slidesConfig[this.slide.name];
			this.canvas = this.frameDocument.querySelector("canvas");
			this.slideContent = this.frameWindow.getConfig().slide;
			this.pagesToGrab = [];
			this.addPageToGrab("slide", this.slideContent, this.getReferencePanelFramesConfig("slide", config));
			if (config.hasPopup) {
				config.popupConfig.popups.forEach(popup => {
					this.addPageToGrab("popup", this.slideContent[popup.popup], this.getReferencePanelFramesConfig("popup", popup));
				});
			}
			this.grabPage(0);
		},
		addPageToGrab(type, mc, refConfig) {
			if (!this.pagesToGrab.find(p => p.mc === mc)) {
				const pageConfig = {type, mc};
				if (refConfig) pageConfig.refConfig = refConfig;
				this.pagesToGrab.push(pageConfig);
			}
		},
		grabSubPage(currentPage, page) {
			let currentFrame = page.mc.currentFrame;
			this.takeScreenShot();
			this.checkReferences(page, currentFrame).then(result => {
				setTimeout(() => {
					currentFrame++;
					if (currentFrame < page.mc.timeline.duration) {
						page.mc.gotoAndStop(currentFrame);
						setTimeout(() => {
							this.grabSubPage(currentPage, page);
						}, result.delay);
					} else {
						this.hideMc(page.type, page.mc);
						currentPage++;
						this.checkNextPage(currentPage);
					}
				}, result.delay);
			});
		},
		grabRefs(type, page, frame) {
			this.showMc("reference", this.slideContent.referencePanel[type], page.refConfig[type][frame]);
			setTimeout(() => {
				this.takeScreenShot();
				this.hideMc("reference", this.slideContent.referencePanel[type]);
			}, this.baseDelay);
		},
		checkReferences(page, frame) {
			let delay = this.baseDelay;
			if (page.refConfig) {
				for (let ref in page.refConfig) {
					if (page.refConfig[ref] !== null && page.refConfig[ref] !== undefined && page.refConfig[ref][frame] !== null) {
						const currentDelay = delay;
						setTimeout(() => {
							this.grabRefs(ref, page, frame);
						}, currentDelay);
						delay += this.baseDelay * 3;
					}
				}
			}
			return new Promise((resolve, reject) => {
				resolve({delay});
			});
		},
		grabPage(index) {
			let currentPage = index;
			const page = this.pagesToGrab[currentPage];
			if (page.type === "slide") {
				this.takeScreenShot();
				this.checkReferences(page, 0).then(result => {
					setTimeout(() => {
						currentPage++;
						this.checkNextPage(currentPage);
					}, result.delay);
				});
			}
			if (page.type === "popup") {
				this.showMc("popup", page.mc);
				setTimeout(() => {
					this.grabSubPage(currentPage, page);
				}, this.baseDelay);
			}
			return;
			this.showMc(page.type, page.mc);
			if (!page.mc || (page.mc && page.mc.timeline.duration < 2) || page.type === "reference") {
				setTimeout(() => {
					this.takeScreenShot();
					this.hideMc(page.type, page.mc);
					currentPage++;
					this.checkNextPage(currentPage);
				}, this.baseDelay);
			} else if (page.mc && page.mc.timeline.duration > 1) {
				setTimeout(() => {
					this.grabSubPage(currentPage, page);
				}, this.baseDelay);
			}
		},
		checkNextPage(currentPage) {
			if (currentPage < this.pagesToGrab.length) {
				setTimeout(() => {
					this.grabPage(currentPage);
				}, this.baseDelay);
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
		showMc(type, mc, frame) {
			if (type === "popup") {
				mc.alpha = 1;
				mc.visible = true;
				mc.scaleX = 1;
				mc.scaleY = 1;
			}
			if (type === "reference") {
				if (mc.parent["references"]) mc.parent["references"].visible = false;
				if (mc.parent["studyDesign"]) mc.parent["studyDesign"].visible = false;
				if (mc.parent["furtherInformation"]) mc.parent["furtherInformation"].visible = false;
				mc.visible = true;
				mc.gotoAndStop(frame);
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
