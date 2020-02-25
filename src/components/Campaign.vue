<template>
	<div class="campaign-box" :class="collapsed ? 'collapsed' : ''">
		<BranchHeader :title="campaign.name" :onclick="toggleBranch" :collapsed="collapsed" collapsable="true" />
		<div class="branch-content campaign-content">
			<Variant class="campaign-child" v-for="variant in variants" :key="variant.name" :variant="variant"></Variant>
			<Language class="campaign-child" v-for="language in languages" :key="language.name" :language="language"></Language>
			<Size class="campaign-child" v-for="size in sizes" :key="size.name" :size="size"></Size>
			<IndexFile class="campaign-child" v-for="indexFile in indexFiles" :key="indexFile.name" :indexFile="indexFile"></IndexFile>
		</div>
	</div>
</template>

<script>
import BranchHeader from "./BranchHeader";
import Variant from "./Variant";
import Language from "./Language";
import Size from "./Size";
import IndexFile from "./IndexFile";

export default {
	components: {
		BranchHeader,
		Variant,
		Language,
		Size,
		IndexFile
	},
	props: ["campaign"],
	data() {
		return {
			collapsed: false
		};
	},
	computed: {
		variants() {
			return this.campaign.variants || [];
		},
		languages() {
			return this.campaign.languages || [];
		},
		sizes() {
			return this.campaign.sizes || [];
		},
		indexFiles() {
			return this.campaign.indexFiles || [];
		}
	},
	methods: {
		toggleBranch() {
			this.collapsed = !this.collapsed;
		}
	},
	mounted() {
	}
};
</script>

<style scoped>
.campaign-box {
	width: 100%;
	text-align: left;
}
.title {
	width: 100%;
	background-color: #263238;
	color: #eceff1;
	padding: 20px 24px 20px 12px;
	font-weight: bold;
	cursor: pointer;
	overflow: hidden;
	white-space: nowrap;
}
.title .title-header {
	max-width: Calc(100% - 200px);
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
<style>
.branch-content {
	overflow: hidden;
	transition: all 0.2s linear;
}
.campaign-child {
	width: 100%;
}
.campaign-child > .title {
	color: #eceff1;
	width: 100%;
	padding: 12px 24px 12px 12px;
	font-size: 0.8em;
	cursor: default;
}
.variant-box > .title {
	background-color: #37474f;
}
.language-box > .title {
	background-color: #455a64;
}
.size-box > .title {
	background-color: #546e7a;
}
.language-box > .title,
.size-box > .title {
	padding: 12px 24px 12px 12px;
	font-size: 0.8em;
	color: #eceff1;
}
.variant-child > .title {
	padding-left: 24px;
}
.language-child > .title {
	padding-left: 36px;
}
.collapsed > .branch-content {
	height: 0;
}
</style>
