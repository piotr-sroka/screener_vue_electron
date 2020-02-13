<template>
	<div class="thumb-generator">
		<iframe :src="slide.indexFile" frameborder="0" @load="onIframeLoad"></iframe>
		<canvas ref="exportCanvas" />
	</div>
</template>

<script>
import fs from "fs";
import path from "path";

export default {
	props: ["slide"],
	data() {
		return {
			iframeCanvas: null,
			thumb: {
				full: "",
				thumb: ""
			},
			MAX_IMAGE_DIMENSION: {
				full: {
					width: 1024,
					height: 768
				},
				thumb: {
					width: 200,
					height: 150
				}
			},
			ctx: null
		};
	},
	methods: {
		onIframeLoad(e) {
			const bannerFrame = e.target;
			const bannerDocument = bannerFrame.contentDocument ? bannerFrame.contentDocument : bannerFrame.contentWindow.document;
			this.iframeCanvas = bannerDocument.querySelector("canvas");
			setTimeout(this.createThumbs, 1000);
		},
		createThumbs() {
			const dataURL = this.iframeCanvas.toDataURL("image/png");
			this.ctx = this.$refs.exportCanvas.getContext("2d");
			const fullImage = new Image();
			const thumbImage = new Image();
			fullImage.addEventListener("load", e => {
				this.resizeImage(e, "full");
			});
			fullImage.addEventListener("load", e => {
				this.resizeImage(e, "thumb");
			});
			fullImage.src = dataURL;
			thumbImage.src = dataURL;
		},
		resizeImage(e, type) {
			const image = e.target;
			const MAX_DIMENSION = type === "full" ? this.MAX_IMAGE_DIMENSION.full : this.MAX_IMAGE_DIMENSION.thumb;
			let newDimension = {
				width: image.width,
				height: image.height
			};
			let ratio = 1;
			if (image.width > MAX_DIMENSION.width) {
				ratio = MAX_DIMENSION.width / image.width;
				if (image.height * ratio > MAX_DIMENSION.height) {
					ratio = MAX_DIMENSION.height / image.height;
				}
			} else {
				ratio = MAX_DIMENSION.height / image / height;
				if (image.width * ratio > MAX_DIMENSION.width) {
					ratio = MAX_DIMENSION.width / image.width;
				}
			}
			newDimension.width = newDimension.width * ratio;
			newDimension.height = newDimension.height * ratio;
			this.$refs.exportCanvas.width = newDimension.width;
			this.$refs.exportCanvas.height = newDimension.height;
			this.ctx.drawImage(image, 0, 0, newDimension.width, newDimension.height);
			this.thumb[type] = this.$refs.exportCanvas.toDataURL("image/png").replace(/^data:image\/\w+;base64,/, "");
            const buf = new Buffer(this.thumb[type], "base64");
            const imagePath = path.resolve(this.slide.directory, `${this.slide.name}-${type}.jpg`);
            fs.writeFile(imagePath, buf, () => {
                this.$emit("thumb-generated", {type: type, image: imagePath});                
            });
		}
	}
};
</script>

<style scoped>
.thumb-generator {
	display: none;
}
</style>
