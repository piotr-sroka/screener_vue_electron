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

const createPdf = new CreatePdfWorker();

export default {
	data() {
		return {
			previewURL: ""
		};
	},
	computed: {
		...mapGetters(["allScreenShots"])
	},
	methods: {
		saveAllToPdf() {
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
		}
	},
	mounted() {
		this.$root.$on("save-all-to-pdf", this.saveAllToPdf);
	}
};
</script>
<style scoped>
.preview-url {
	display: none;
}
</style>
