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
			previewURL: "",
			previewTypesToSave: [],
			savedPreviewTypes: [],
			previewsToDelete: []
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
		saveEachAllTo(type) {
			let savedFiles = 0;
			const allIndexFilesWithScreenshots = this.allIndexFiles.filter(indexFile => indexFile.screenShots.length);
			const filesToSaveLength = allIndexFilesWithScreenshots.length;
			if (!filesToSaveLength) {
				return this.$swal({
					title: "Ooops...",
					text: "There is nothing to save. Create some screenshots first.",
					icon: "warning"
				});
			}
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
				if (type === "pdf") {
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
							if (savedFiles === filesToSaveLength) {
								this.savedPreviewTypes.push("pdf");
								this.checkAllTypesToSave();
							}
							// return this.$swal({
							// 	title: "Success",
							// 	text: "All previews for each file have been saved to PDFs.",
							// 	icon: "success"
							// });
						});
					});
					createPdf.postMessage(doc);
				} else if (type === "jpg" || type === "png") {
					const buffer = new Buffer(exportCanvas.toDataURL(`image/${type}`).replace(/^data:image\/\w+;base64,/, ""), "base64");
					const filePath = path.join(path.dirname(indexFile.htmlPath), `${indexFile.size}_preview.${type}`);
					fs.writeFile(filePath, buffer, () => {
						this.$root.$emit("each-file-saved", indexFile);
						savedFiles++;
						if (savedFiles === filesToSaveLength) {
							this.savedPreviewTypes.push(type);
							this.checkAllTypesToSave();
						}
					});
				}
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
			if (!filesToSaveLength) {
				return this.$swal({
					title: "Ooops...",
					text: "There is nothing to save. Create some screenshots first.",
					icon: "warning"
				});
			}
			allIndexFilesWithScreenshots.forEach(indexFile => {
				const buffer = new Buffer(indexFile.screenShots[indexFile.screenShots.length - 1].data.replace(/^data:image\/\w+;base64,/, ""), "base64");
				const filePath = path.join(path.dirname(indexFile.htmlPath), `${indexFile.size}_preview_last_frame.${type}`);
				fs.writeFile(filePath, buffer, () => {
					savedFiles++;
					if (savedFiles === filesToSaveLength) {
						return this.$swal({
							title: "Success",
							text: `All previews have been saved.`,
							icon: "success"
						});
					}
				});
			});
		},
		async saveEachToZip() {
			const indexFilesWithoutScreenshots = this.allIndexFiles.filter(indexFile => !indexFile.screenShots.length);
			let mode = "all";
			if (indexFilesWithoutScreenshots.length) {
				const result = await this.$swal({
					title: "Info",
					text: "Do you want to save files without any screenshot? If no, only files with screenshots will be saved.",
					icon: "info",
					showCloseButton: true,
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
			const currentDate = this.generateDate();
			indexFilesToSave.forEach(async indexFile => {
				const zip = new JSZip();
				const dir = path.dirname(indexFile.htmlPath);
				const sentPath = path.join(indexFile.htmlPath.substring(0, indexFile.htmlPath.indexOf(indexFile.campaignName) + indexFile.campaignName.length), "HTML5", "_SENT");
				if (!fs.existsSync(sentPath)) {
					await fs.mkdirSync(sentPath);
				}
				const datePath = path.join(sentPath, currentDate);
				if (!fs.existsSync(datePath)) {
					await fs.mkdirSync(datePath);
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
						const zipPath = `${path.join(datePath, indexFile.nc_name)}.zip`;
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
		},
		generateDate() {
			const date = new Date();
			const year = date.getFullYear();
			const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
			const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
			const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
			const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
			return `${year}.${month}.${day} ${hour}-${minutes}`;
		},
		async saveEachAll() {
			this.getPreviewTypesToSave("all");
			let mode = "remove";
			if (this.previewsToDelete.length) {
				const result = await this.$swal({
					title: "Confirm",
					text: "Should all unselected preview types be removed?",
					icon: "question",
					showCloseButton: true,
					showCancelButton: true,
					confirmButtonText: "Yes",
					cancelButtonColor: "#E64A19",
					cancelButtonText: "No"
				}).then(res => {
					if (res.dismiss) {
						mode = "leave";
					}
				});
			}
			if (mode === "remove") {
				this.previewsToDelete.forEach(type => {
					this.deleteEach("all", type);
				});
			}
			this.previewTypesToSave.forEach(type => {
				this.saveEachAllTo(type);
			});
		},
		async saveEachLast() {
			this.getPreviewTypesToSave("last");
			let mode = "remove";
			if (this.previewsToDelete.length) {
				const result = await this.$swal({
					title: "Confirm",
					text: "Should all unselected preview types be removed?",
					icon: "question",
					showCloseButton: true,
					showCancelButton: true,
					confirmButtonText: "Yes",
					cancelButtonColor: "#E64A19",
					cancelButtonText: "No"
				}).then(res => {
					if (res.dismiss) {
						mode = "leave";
					}
				});
			}
			if (mode === "remove") {
				this.previewsToDelete.forEach(type => {
					this.deleteEach("last", type);
				});
			}
			this.previewTypesToSave.forEach(type => {
				this.saveEachLastFrame(type);
			});
		},
		getPreviewTypesToSave(type) {
			const config = JSON.parse(localStorage.getItem("eachSaveOptions"))[type];
			this.previewTypesToSave = [];
			this.savedPreviewTypes = [];
			this.previewsToDelete = [];
			for (let option in config) {
				if (config[option]) {
					this.previewTypesToSave.push(option);
				} else {
					this.previewsToDelete.push(option);
				}
			}
		},
		checkAllTypesToSave() {
			if (this.previewTypesToSave.sort().join("") === this.savedPreviewTypes.sort().join("")) {
				return this.$swal({
					title: "Success",
					text: `All previews have been saved.`,
					icon: "success"
				});
			}
		},
		deleteEach(type, ext) {
			this.allIndexFiles.forEach(indexFile => {
				const dir = path.dirname(indexFile.htmlPath);
				const fileToRemove = `${indexFile.size}_preview${type === "last" ? "_last_frame" : ""}.${ext}`;
				if (fs.existsSync(path.join(dir, fileToRemove))) {
					fs.unlinkSync(path.join(dir, fileToRemove));
				}
			});
		}
	},
	mounted() {
		this.$root.$on("save-all-to-pdf", this.saveAllToPdf);
		// this.$root.$on("save-each-to-pdf", this.saveEachToPdf);
		// this.$root.$on("save-each-last-frame-to-jpg", this.saveEachLastFrameToJpg);
		// this.$root.$on("save-each-last-frame-to-png", this.saveEachLastFrameToPng);

		this.$root.$on("save-each-all", this.saveEachAll);
		this.$root.$on("save-each-last", this.saveEachLast);
		this.$root.$on("save-each-to-zip", this.saveEachToZip);
	},
	beforeDestroy() {
		this.$root.$off("save-all-to-pdf", this.saveAllToPdf);
		// this.$root.$off("save-each-to-pdf", this.saveEachToPdf);
		// this.$root.$off("save-each-last-frame-to-jpg", this.saveEachLastFrameToJpg);
		// this.$root.$off("save-each-last-frame-to-png", this.saveEachLastFrameToPng);

		this.$root.$off("save-each-all", this.saveEachAll);
		this.$root.$off("save-each-last", this.saveEachLast);
		this.$root.$off("save-each-to-zip", this.saveEachToZip);
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
