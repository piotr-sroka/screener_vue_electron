<template>
	<section class="page">
		<div class="drop-zone-container">
			<DropzoneVeeva v-if="!veevaSlides.length" />
            <VeevaTree v-else />
		</div>
	</section>
</template>

<script>
import {mapGetters} from "vuex";
import DropzoneVeeva from "./DropzoneVeeva";
import VeevaTree from "./VeevaTree";

export default {
	components: {
        DropzoneVeeva,
        VeevaTree
    },
    computed: {
        ...mapGetters(["veevaSlides"])
    },
    mounted() {
        this.$store.dispatch("removeTheTrees");
    }
};
</script>

<style scoped></style>
