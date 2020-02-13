<template>
	<div class="dropzone" :class="isDragOver ? 'drag-over' : ''" @dragover.prevent.stop="onDragOver" @dragleave.prevent.stop="onDragLeave" @drop.prevent="onDrop">
		<input id="drop-input" class="drop-input" type="file" @change="onFileSelect" multiple />
		<label class="drop-input--label" for="drop-input">Drag and drop HTML5 content or click here to select html file.</label>
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
			htmlFilesPaths: [],
			tree: {
				campaigns: []
			}
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
			this.tree.campaigns = [];
			this.htmlFilesPaths = [];
			this.isDragOver = false;
			this.selectedFiles = Array.from(e.target.files || e.dataTransfer.files);
			this.checkFilesList();
		},
		onFileSelect(e) {
			this.selectedFiles = Array.from(e.target.files);
			this.checkFilesList();
		},
		checkFilesList() {
			let readDirs = 0;
			this.selectedFiles.forEach(file => {
				if (fs.lstatSync(file.path).isDirectory()) {
					this.getFiles(file.path).then(files => {
						files
							.filter(file => file !== null)
							.forEach(file => {
								if (!this.htmlFilesPaths.includes(file)) {
									this.htmlFilesPaths.push(file);
								}
							});
						readDirs++;
						if (readDirs === this.selectedFiles.length) {
							this.categorizeFiles();
						}
					});
				} else {
					if (!this.htmlFilesPaths.includes(file) && Regex.isFile.test(file.path)) {
						this.htmlFilesPaths.push(file.path);
					}
					readDirs++;
					if (readDirs === this.selectedFiles.length) {
						this.categorizeFiles();
					}
				}
			});
		},
		async getFiles(dir) {
			const dirents = await readdir(dir, {withFileTypes: true});
			const files = await Promise.all(
				dirents.map(dirent => {
					const res = resolve(dir, dirent.name);
					return dirent.isDirectory() ? this.getFiles(res) : Regex.isFile.test(res) ? res : null;
				})
			);
			return files.flat();
		},
		async categorizeFiles() {
			await this.htmlFilesPaths
				.map(htmlPath => {
					const pathFromCampaign = this.getPathFromCampaign(htmlPath.split(path.sep), this.getCampaignName(htmlPath.split(path.sep)));
					const campaignName = pathFromCampaign.find(part => Regex.isCampaign.test(part));
					const html5 = pathFromCampaign.find(part => Regex.isHtml5.test(part));
					const variant = pathFromCampaign.find(part => !Regex.isCampaign.test(part) && !Regex.isHtml5.test(part) && !Regex.isLanguage.test(part) && !Regex.isSize.test(part) && !Regex.isFile.test(part) && !Regex.isOther.test(part));
					const language = pathFromCampaign.find(part => Regex.isLanguage.test(part));
					const size = pathFromCampaign.find(part => Regex.isSize.test(part));
					const fileName = pathFromCampaign.find(part => Regex.isFile.test(part));

					const nc_campaign = `${campaignName}_`;
					const nc_html5 = html5 ? `${html5}_` : "";
					const nc_variant = variant ? `${variant}_` : "";
					const nc_size = size ? `${size}_` : "";
					const nc_language = language ? `${language}` : "";
					const nc_name = `${nc_campaign}${nc_variant}${nc_html5}${nc_size}${nc_language}`.replace(/ /g, "");
					return {campaignName, variant, language, size, fileName, htmlPath, nc_name};
				})
				.forEach(fileInfo => {
					if (!this.tree.campaigns.find(c => c.name === fileInfo.campaignName)) this.tree.campaigns.push({name: fileInfo.campaignName});
					const campaign = this.tree.campaigns.find(c => c.name === fileInfo.campaignName);
					if (fileInfo.variant) {
						if (!campaign.variants) campaign.variants = [];
						if (!campaign.variants.find(v => v.name === fileInfo.variant)) campaign.variants.push({name: fileInfo.variant});
					}
					if (fileInfo.language) {
						if (fileInfo.variant) {
							const variant = campaign.variants.find(v => v.name === fileInfo.variant);
							if (!variant.languages) variant.languages = [];
							if (!variant.languages.find(l => l.name === fileInfo.language)) variant.languages.push({name: fileInfo.language});
						} else {
							if (!campaign.languages) campaign.languages = [];
							if (!campaign.languages.find(l => l.name === fileInfo.language)) campaign.languages.push({name: fileInfo.language});
						}
					}
					if (fileInfo.size) {
						if (fileInfo.variant) {
							const variant = campaign.variants.find(v => v.name === fileInfo.variant);
							if (fileInfo.language) {
								const language = variant.languages.find(l => l.name === fileInfo.language);
								if (!language.sizes) language.sizes = [];
								if (!language.sizes.find(s => s.name === fileInfo.size)) language.sizes.push({name: fileInfo.size});
							} else {
								if (!variant.sizes) variant.sizes = [];
								if (!variant.sizes.find(s => s.name === fileInfo.size)) variant.sizes.push({name: fileInfo.size});
							}
						} else {
							if (fileInfo.language) {
								const language = campaign.languages.find(l => l.name === fileInfo.language);
								if (!language.sizes) language.sizes = [];
								if (!language.sizes.find(s => s.name === fileInfo.size)) language.sizes.push({name: fileInfo.size});
							} else {
								if (!campaign.sizes) campaign.sizes = [];
								if (!campaign.sizes.find(s => s.name === fileInfo.size)) campaign.sizes.push({name: fileInfo.size});
							}
						}
					}
					if (fileInfo.fileName) {
						if (fileInfo.variant) {
							const variant = campaign.variants.find(v => v.name === fileInfo.variant);
							if (fileInfo.language) {
								const language = variant.languages.find(l => l.name === fileInfo.language);
								if (fileInfo.size) {
									const size = language.sizes.find(s => s.name === fileInfo.size);
									if (!size.indexFiles) size.indexFiles = [];
									size.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								} else {
									if (!language.indexFiles) language.indexFiles = [];
									language.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								}
							} else {
								if (fileInfo.size) {
									const size = variant.sizes.find(s => s.name === fileInfo.size);
									if (!size.indexFiles) size.indexFiles = [];
									size.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								} else {
									if (!variant.indexFiles) variant.indexFiles = [];
									variant.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								}
							}
						} else {
							if (fileInfo.language) {
								const language = campaign.languages.find(l => l.name === fileInfo.language);
								if (fileInfo.size) {
									const size = language.sizes.find(s => s.name === fileInfo.size);
									if (!size.indexFiles) size.indexFiles = [];
									size.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								} else {
									if (!language.indexFiles) language.indexFiles = [];
									language.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								}
							} else {
								if (fileInfo.size) {
									const size = campaign.sizes.find(s => s.name === fileInfo.size);
									if (!size.indexFiles) size.indexFiles = [];
									size.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								} else {
									if (!campaign.indexFiles) campaign.indexFiles = [];
									campaign.indexFiles.push({name: fileInfo.fileName, ...fileInfo});
								}
							}
						}
					}
				});
			if (!this.tree.campaigns || !this.tree.campaigns.length)
				return this.$swal({
					title: "Ooops...",
					text: "You selected unsupported file or unsupported folder structure.",
					icon: "error"
				});
			this.$store.dispatch("createTree", this.tree);
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
	border: 3px dashed #37474F;
	margin: auto;
	display: flex;
	transition: all 0.2s linear;
}
.dropzone.drag-over {
	border-color: #78909C;
	color: #78909C;
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
