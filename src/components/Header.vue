<template>
	<header class="header">
		<img class="header-image" :src="image_url" alt="" />
		<router-link to="/" class="header-back"><font-awesome-icon icon="arrow-alt-circle-left" title="Back to Home" /></router-link>
	</header>
</template>

<script>
export default {
	props: ["image_url", "title"]
};
</script>

<style scoped>
.header {
	display: flex;
	padding: 12px 6px;
  padding-bottom: 34px;
	align-items: center;
  justify-content: space-between;
}
.header-image {
	max-width: 40px;
	max-height: 40px;
	object-fit: contain;
}
.header-back {
	background: none;
	border: none;
  font-size: 2em;
  color: #009688;
  outline-color: transparent;
  margin-left: auto;
  cursor: pointer;
  transition: transform .2s linear;
}
.header-back:hover {
  transform: translateX(-5px);
}
</style>
