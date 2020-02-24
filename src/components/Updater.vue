<template>
	<div class="footer-container">
		<div class="info-container" :class="isNewVersionAvailable ? 'shown' : ''">
			<font-awesome-icon class="info-icon" icon="info-circle" v-if="!isDownloading" />
			<p class="info-title" v-if="!isDownloading">New version available</p>
			<button class="info-download" @click="downloadNewVersion" v-if="!isDownloading">Download and install <font-awesome-icon class="icon" icon="download" /></button>
			<div class="info-loader" v-if="isDownloading">
				<Loader class="logging-loader" size="m-small" color="#eceff1" />
			</div>
		</div>
		<div class="info-container" :class="!isLoggedIn ? 'shown' : ''">
			<font-awesome-icon class="info-icon" icon="info-circle" />
			<p class="info-title">Log into FTP to get the newest version of app</p>
			<input class="info-input" type="text" placeholder="user" v-model="credentials.user" />
			<input class="info-input" type="password" placeholder="password" v-model="credentials.password" />
			<button class="info-login" @click="logIn" v-if="!loggingIn">Log in</button>
			<div class="info-loader" v-if="loggingIn">
				<Loader class="logging-loader" size="m-small" color="#eceff1" />
			</div>
		</div>
	</div>
</template>
<script>
import {remote} from "electron";
import path from "path";
import jsftp from "jsftp";
import Client from "ftp";
import Loader from "./Loader";
import fs from "fs";
import rimraf from "rimraf";
import http from "http";
import child from "child_process";
import {autoUpdater} from "electron-updater";

export default {
	components: {
		Loader
	},
	data() {
		return {
			actualVersionDirectory: "ps2/Screener/actual",
			host: "view.egplusww.pl",
			credentials: {
				user: "",
				password: ""
			},
			isLoggedIn: false,
			isNewVersionAvailable: false,
			loggingIn: false,
			newVersionFileURL: "",
			FTP: null,
			newVersionFileBuffer: null,
			isDownloading: false
		};
	},
	methods: {
		logIn() {
			this.loggingIn = true;
			if (!this.credentials.user.length || !this.credentials.password.length) return this.wrongCredentials();
			this.FTP = new Client();
			this.FTP.on("ready", () => {
				this.FTP.list(this.actualVersionDirectory, (err, list) => {
					if (err) return this.wrongCredentials();
					const credentials = JSON.stringify(this.credentials);
					localStorage.setItem("credentials", credentials);
					setTimeout(() => {
						this.checkIfNewVersion(list[0]);
					}, 1500);
				});
			});
			this.FTP.connect({
				host: this.host,
				user: this.credentials.user,
				password: this.credentials.password
			});
		},
		wrongCredentials() {
			this.loggingIn = false;
			return this.$swal({
				title: "Ooops...",
				text: "Please provide proper credentials.",
				icon: "error"
			});
		},
		checkIfNewVersion(file) {
			this.loggingIn = false;
			this.isLoggedIn = true;
			const actualVersion = file.name.substring(file.name.search(/\d/), file.name.search(".exe"));
			const appVersion = remote.app.getVersion();
			if (appVersion !== actualVersion) {
				setTimeout(() => {
					this.isNewVersionAvailable = true;
					this.newVersionFileURL = file;
				}, 1500);
			}
		},
		downloadNewVersion() {
			this.isDownloading = true;
			const appPath = remote.app.getPath("userData");
			const tempDir = path.join(appPath, "installer");
			if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
			this.FTP.get(`${this.actualVersionDirectory}/${this.newVersionFileURL.name}`, (err, stream) => {
				if (err) console.log(err);
				const encodedFileName = this.newVersionFileURL.name.replace(/ /g, "_");
				const newVersionFilePath = path.join(tempDir, encodedFileName);
				stream.once("close", () => {
					this.FTP.end();
					setTimeout(() => {
						this.tryToInstall(tempDir, encodedFileName);
					}, 2000);
				});
				stream.pipe(fs.createWriteStream(newVersionFilePath));
			});
		},
		tryToInstall(dir, newVersionFileName) {
			const batFile = path.join(dir, "installer.bat");
			fs.writeFileSync(batFile, `start /d "${dir}" ${newVersionFileName}`);
			child.execFile(batFile, (err, data) => {
				if (err) {
					return this.$swal({
						title: "Ooops...",
						text: "I cannot open downloaded file. Please reopen app and try to download again.",
						icon: "error"
					});
				}
			});
		}
	},
	mounted() {
		const tempDir = path.join(remote.app.getPath("userData"), "installer");
		if (fs.existsSync(tempDir)) {
			rimraf.sync(tempDir);
		}
		if (localStorage.getItem("credentials")) {
			const credentials = JSON.parse(localStorage.getItem("credentials"));
			this.credentials.user = credentials.user;
			this.credentials.password = credentials.password;
			this.logIn();
		}
	}
};
</script>
<style scoped>
.footer-container {
	width: 100%;
	height: 100%;
	position: relative;
}
.info-container {
	position: absolute;
	top: 100%;
	width: 100%;
	height: 100%;
	background-color: #00bfa5;
	transition: top 0.2s linear;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 0 24px;
	color: #eceff1;
}
.info-container.shown {
	top: 0;
}
.info-icon {
	font-size: 1.4em;
	animation: pulse 1s linear infinite;
}
.info-title {
	font-size: 1em;
	margin: 0 12px;
}
.info-download,
.info-login {
	background: none;
	outline: none;
	border: 1px solid #eceff1;
	color: #eceff1;
	padding: 6px 12px;
	cursor: pointer;
	transition: all 0.2s linear;
}
.info-download .icon {
	margin-left: 12px;
}
.info-download:hover {
	background-color: #eceff1;
	color: #00bfa5;
}
.info-input {
	padding: 6px 12px;
	background: none;
	border: 1px solid #eceff1;
	color: #eceff1;
	margin-right: 12px;
	outline: none;
	transition: all 0.2s linear;
}
.info-input:focus {
	background-color: #eceff1;
	color: #00bfa5;
}
.info-input::placeholder {
	color: #eceff1;
}
.info-login {
	min-width: 64px;
}
.info-loader {
	min-width: 64px;
	text-align: center;
}
.logging-loader {
	margin-right: 0;
}
@keyframes pulse {
	0% {
		transform: scale(1, 1);
	}
	50% {
		transform: scale(1.2, 1.2);
	}
	100% {
		transform: scale(1, 1);
	}
}
</style>
