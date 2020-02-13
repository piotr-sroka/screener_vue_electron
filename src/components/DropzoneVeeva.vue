<template>
	<div class="dropzone" :class="isDragOver ? 'drag-over' : ''" @dragover.prevent.stop="onDragOver" @dragleave.prevent.stop="onDragLeave" @drop.prevent="onDrop">
		<input id="drop-input" class="drop-input" type="file" @change="onFileSelect" webkitdirectory />
		<label class="drop-input--label" for="drop-input">Drag and drop folder with Veeva presentation slides or click here to select.</label>
	</div>
</template>

<script>
import fs, {stat} from "fs";
import path from "path";
import Regex from "../utils/Regex";
const {resolve} = require("path");
const {readdir} = require("fs").promises;

export default {
	data() {
		return {
			isDragOver: false,
			selectedFiles: [],
			veevaSlideFiles: [],
			veevaSlides: []
		};
	},
	methods: {
		onDragOver() {
			this.isDragOver = true;
		},
		onDragLeave() {
			this.isDragOver = false;
		},
		onDrop(e) {
			this.isDragOver = false;
			this.veevaSlides = [];
			this.selectedFiles = Array.from(e.target.files || e.dataTransfer.files);
			this.checkFilesList();
		},
		onFileSelect(e) {
			this.selectedFiles = Array.from(e.target.files);
			this.checkFilesList();
		},
		checkFilesList() {
			this.getFiles(this.selectedFiles[0].path).then(filesPaths => {
				const uniqueFilesPaths = filesPaths.filter(filePath => filePath !== null);
				uniqueFilesPaths.forEach(filePath => {
					if (!this.veevaSlideFiles.includes(filePath)) {
						this.veevaSlideFiles.push(filePath);
					}
				});
				this.categorizeFiles();
			});
		},
		categorizeFiles() {
			this.veevaSlideFiles.forEach(filePath => {
				const filePathParts = filePath.split(path.sep);
				const fileDirectory = filePathParts.slice(0, filePathParts.length - 1).join(path.sep);
				const slideName = filePathParts[filePathParts.length - 2];
				if (!this.veevaSlides.find(slide => slide.name === slideName)) {
					this.veevaSlides.push({name: slideName});
				}
				const veevaSlide = this.veevaSlides.find(slide => slide.name === slideName);
				if (slideName === path.parse(filePath).name) {
					if (!veevaSlide.indexFile) {
						const indexFileName = filePathParts[filePathParts.length - 1];
						if (Regex.isFile.test(filePath)) {
							veevaSlide.indexFile = filePath;
							veevaSlide.directory = fileDirectory;
						}
					}
				}
				if (Regex.isVeevaThumb.test(filePath)) {
					veevaSlide.thumb = filePath;
				}
			});
			const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: "base"});
			const sortedVeevaSlides = this.veevaSlides.sort((a, b) => collator.compare(a.name, b.name));
			if (!sortedVeevaSlides || !sortedVeevaSlides.length)
				return this.$swal({
					title: "Ooops...",
					text: "You selected unsupported folder structure.",
					icon: "error"
				});
			this.$store.dispatch("createVeevaTree", sortedVeevaSlides);
		},
		async getFiles(dir) {
			const dirents = await readdir(dir, {withFileTypes: true});
			const files = await Promise.all(
				dirents.map(dirent => {
					const res = resolve(dir, dirent.name);
					return dirent.isDirectory() ? this.getFiles(res) : Regex.isFile.test(res) || Regex.isVeevaThumb.test(res) ? res : null;
				})
			);
			return files.flat();
		},
		getCampaignName(pathParts) {
			return pathParts.find(part => Regex.isCampaign.test(part));
		},
		getPathFromCampaign(pathParts, campaignName) {
			return pathParts.slice(pathParts.indexOf(campaignName));
		}
	}
};
</script>

<style scoped>
.dropzone {
	width: 80%;
	height: 200px;
	border: 3px dashed #37474f;
	margin: auto;
	display: flex;
	transition: all 0.2s linear;
}
.dropzone.drag-over {
	border-color: #78909c;
	color: #78909c;
}
.drop-input {
	position: absolute;
	left: -99999999999999px;
}
.drop-input--label {
	content: "Drag and drop HTML5 content or click here to select.";
	margin: auto;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
