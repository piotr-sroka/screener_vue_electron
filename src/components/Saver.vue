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
import JSZip from "jszip";
import Regex from "../utils/Regex";

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
				this.previewURL = URL.createObjectURL(new Blob([new Uint8Array(e.data)]));
				setTimeout(() => {
					this.$refs.previewURL.click();
					URL.revokeObjectURL(this.previewURL);
				}, 500);
			});
			createPdf.postMessage(doc);
		},
		saveEachToPdf() {
			let savedFiles = 0;
			const allIndexFilesWithScreenshots = this.allIndexFiles.filter(indexFile => indexFile.screenShots.length);
			const filesToSaveLength = allIndexFilesWithScreenshots.length;
			allIndexFilesWithScreenshots.forEach(indexFile => {
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
					const pdfPath = path.join(path.dirname(indexFile.htmlPath), `${indexFile.size}_preview.pdf`);
					fs.writeFile(pdfPath, e.data, () => {
						this.$root.$emit("each-file-saved", indexFile);
						savedFiles++;
						if (savedFiles === filesToSaveLength)
							return this.$swal({
								title: "Success",
								text: "All previews for each file have been saved to PDFs.",
								icon: "success"
							});
					});
				});
				createPdf.postMessage(doc);
				this.$root.$emit("each-file-saving", indexFile);
			});
		},
		saveEachLastFrameToJpg() {
			this.saveEachLastFrame("jpg");
		},
		saveEachLastFrameToPng() {
			this.saveEachLastFrame("png");
		},
		saveEachLastFrame(type) {
			let savedFiles = 0;
			const allIndexFilesWithScreenshots = this.allIndexFiles.filter(indexFile => indexFile.screenShots.length);
			const filesToSaveLength = allIndexFilesWithScreenshots.length;
			allIndexFilesWithScreenshots.forEach(indexFile => {
				const buffer = new Buffer(indexFile.screenShots[indexFile.screenShots.length - 1].data.replace(/^data:image\/\w+;base64,/, ""), "base64");
				const filePath = path.join(path.dirname(indexFile.htmlPath), `${indexFile.size}_preview_last_frame.${type}`);
				fs.writeFile(filePath, buffer, () => {
					savedFiles++;
					if (savedFiles === filesToSaveLength) {
						return this.$swal({
							title: "Success",
							text: `All previews for each file have been saved to ${type.toUpperCase()}s.`,
							icon: "success"
						});
					}
				});
			});
		},
		async saveEachLastFrameToZip() {
			const indexFilesWithoutScreenshots = this.allIndexFiles.filter(indexFile => !indexFile.screenShots.length);
			let mode = "all";
			if (indexFilesWithoutScreenshots.length) {
				const result = await this.$swal({
					title: "Info",
					text: "Do you want to save files without any screenshot? If no, only files with screenshots will be saved.",
					icon: "info",
					showCancelButton: true,
					confirmButtonText: "Yes",
					cancelButtonColor: "#E64A19",
					cancelButtonText: "No"
				}).then(res => {
					if (res.dismiss) {
						mode = "only-with-screenshots";
					}
				});
			}
			const indexFilesToSave = mode === "all" ? this.allIndexFiles : this.allIndexFiles.filter(indexFile => indexFile.screenShots.length);
			let savedFiles = 0;
			const filesToSaveLength = indexFilesToSave.length;
			indexFilesToSave.forEach(async indexFile => {
				const zip = new JSZip();
				const dir = path.dirname(indexFile.htmlPath);
				const sentPath = path.join(indexFile.htmlPath.substring(0, indexFile.htmlPath.indexOf(indexFile.campaignName) + indexFile.campaignName.length), "HTML5", "_SENT");
				if (!fs.existsSync(sentPath)) {
					await fs.mkdirSync(sentPath);
				}
				this.getFiles(dir).then(files => {
					files.forEach(file => {
						const filePath = file.substr(file.indexOf(dir) + dir.length + 1);
						zip.file(filePath, fs.createReadStream(file));
					});
					zip.generateAsync({
						type: "nodebuffer",
						platform: process.platform,
						compression: "STORE"
					}).then(content => {
						const zipPath = `${path.join(dir, indexFile.nc_name)}.zip`;
						fs.writeFile(zipPath, content, () => {
							savedFiles++;
							if (savedFiles === filesToSaveLength) {
								return this.$swal({
									title: "Success",
									text: `All packages have been saved.`,
									icon: "success"
								});
							}
						});
					});
				});
			});
			// this.$swal({
			// 	title: "Success",
			// 	text: `All packages have been saved.`,
			// 	icon: "success"
			// }).then(result => {
			// 	console.log(result);
			// });
		},
		async getFiles(dir) {
			const dirents = await fs.promises.readdir(dir, {withFileTypes: true});
			const files = await Promise.all(
				dirents.map(dirent => {
					const res = path.resolve(dir, dirent.name);
					return dirent.isDirectory() ? this.getFiles(res) : Regex.isProperFileForZip.test(res) ? res : null;
				})
			);
			return files.flat().filter(file => file !== null);
		}
	},
	mounted() {
		this.$root.$on("save-all-to-pdf", this.saveAllToPdf);
		this.$root.$on("save-each-to-pdf", this.saveEachToPdf);
		this.$root.$on("save-each-last-frame-to-jpg", this.saveEachLastFrameToJpg);
		this.$root.$on("save-each-last-frame-to-png", this.saveEachLastFrameToPng);
		this.$root.$on("save-each-last-frame-to-zip", this.saveEachLastFrameToZip);
	},
	beforeDestroy() {
		this.$root.$off("save-all-to-pdf", this.saveAllToPdf);
		this.$root.$off("save-each-to-pdf", this.saveEachToPdf);
		this.$root.$off("save-each-last-frame-to-jpg", this.saveEachLastFrameToJpg);
		this.$root.$off("save-each-last-frame-to-png", this.saveEachLastFrameToPng);
		this.$root.$off("save-each-last-frame-to-zip", this.saveEachLastFrameToZip);
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
