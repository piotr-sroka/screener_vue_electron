<template>
	<a class="preview-url" :href="previewURL" download="preview.pdf" ref="previewURL">Click Here</a>
</template>
<script>
import {mapGetters} from "vuex";
import pdfMake from "pdfmake/build/pdfmake";
import fs from "fs";
import path from "path";
import {remote} from "electron";
import CreatePdfWorker from "worker-loader!../utils/CreatePdf.worker";

export default {
	data() {
		return {
			previewURL: ""
		};
	},
	computed: {
		...mapGetters(["allScreenShots", "allIndexFiles"])
	},
	methods: {
		saveAllToPdf() {
			const createPdf = new CreatePdfWorker();
			const doc = {
				pageSize: {
					width: this.allScreenShots[0].size.width + 100,
					height: this.allScreenShots[0].size.height + 100
				},
				content: []
			};
			this.allScreenShots.forEach((screenShot, index) => {
				const orientation = screenShot.size.width >= screenShot.size.height ? "landscape" : "portrait";
				doc.content.push({image: screenShot.data});
			});
			createPdf.addEventListener("message", e => {
				this.$root.$emit("pdf-saved");
				this.previewURL = URL.createObjectURL(e.data);
				setTimeout(() => {
					this.$refs.previewURL.click();
					URL.revokeObjectURL(this.previewURL);
				}, 500);
			});
			createPdf.postMessage(doc);
		},
		saveEachToPdf() {
			this.allIndexFiles.forEach(indexFile => {
				if (indexFile.screenShots.length) {
					const exportCanvas = document.createElement("CANVAS");
					const exportCtx = exportCanvas.getContext("2d");
					const size = {width: +indexFile.size.split("x")[0], height: +indexFile.size.split("x")[1]};
					const pageSize = {width: size.width, height: size.height};
					const orientation = size.width >= size.height ? "vertical" : "horizontal";
					if (orientation === "vertical") {
						pageSize.width = pageSize.width + 100;
						pageSize.height = (pageSize.height + 50) * indexFile.screenShots.length + 50;
					} else {
						pageSize.width = (pageSize.width + 50) * indexFile.screenShots.length + 50;
						pageSize.height = pageSize.height + 100;
					}
					if (orientation === "vertical") {
						exportCanvas.width = size.width;
						exportCanvas.height = (indexFile.screenShots.length - 1) * (size.height + 50) + size.height;
					} else {
						exportCanvas.width = (indexFile.screenShots.length - 1) * (size.width + 50) + size.width;
						exportCanvas.height = size.height;
					}
					indexFile.screenShots.forEach((screenShot, index) => {
						const img = new Image();
						img.src = screenShot.data;
						if (orientation === "vertical") {
							exportCtx.drawImage(img, 0, (screenShot.size.height + 50) * index, screenShot.size.width, screenShot.size.height);
						} else {
							exportCtx.drawImage(img, (screenShot.size.width + 50) * index, 0, screenShot.size.width, screenShot.size.height);
						}
					});
					const doc = {
						pageSize: {
							width: pageSize.width,
							height: pageSize.height
						},
						content: [{image: exportCanvas.toDataURL("image/png")}]
					};
					const createPdf = new CreatePdfWorker();
					createPdf.addEventListener("message", e => {
						this.previewURL = URL.createObjectURL(e.data);
						setTimeout(() => {
							this.$refs.previewURL.click();
							URL.revokeObjectURL(this.previewURL);
						}, 500);
					});
					createPdf.postMessage(doc);
				}
			});
		}
	},
	mounted() {
		this.$root.$on("save-all-to-pdf", this.saveAllToPdf);
		this.$root.$on("save-each-to-pdf", this.saveEachToPdf);
	},
	beforeDestroy() {
		this.$root.$off("save-all-to-pdf", this.saveAllToPdf);
		this.$root.$off("save-each-to-pdf", this.saveEachToPdf);
	}
};
</script>
<style scoped>
.preview-url {
	display: none;
}
.export-canvas {
	display: none;
}
</style>
