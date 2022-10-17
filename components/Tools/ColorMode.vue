<template>
    <div class="color-mode">
        <div class="color-mode__wrap">
            <el-button type="warning" :icon="isNightMode?MoonNight:Sunny" circle :size="iconSize"
                       @click="()=>{isNightMode=!isNightMode}"></el-button>
            <div :class="['color-mode__background',isNightMode?'active':'']"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Sunny, MoonNight } from '@element-plus/icons-vue';
const isNightMode = ref(false);
const iconSize = "large";

</script>

<style scoped lang="css">
.color-mode {
    position: fixed;
    left: 20px;
    bottom: 20px;
}

.color-mode__background {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #000000;
    mix-blend-mode: difference;
    pointer-events: none;
    height: 100%;
    width: 100%;
    border-radius: 50%;
    /* z-index: -1; */
    transition: transform 200ms;
}

.color-mode__background.active {
    transform: scale(100);
}
</style>