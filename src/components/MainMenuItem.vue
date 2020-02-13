<template>
	<div class="menu-item" @click="onClick">
		<img class="item-image" :src="image_url" />
	</div>
</template>

<script>
export default {
    props: ["image_url", "link"],
    methods: {
        onClick() {
            if (this.$route.path !== this.link) this.$router.push(this.link);      
        }
    }
};
</script>

<style scoped>
.menu-item {
	padding: 40px;
	box-sizing: border-box;
	cursor: pointer;
}
.item-image {
	transition: transform 0.2s linear;
	transform-origin: center;
}
.item-image:hover {
	transform: translateY(-5px);
}
.menu-item:not(:first-of-type) {
	border-left: 1px solid #009688;
}
</style>
