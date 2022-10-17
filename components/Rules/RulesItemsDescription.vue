<template>
    <el-scrollbar style="width: 100%;">
        <el-descriptions v-if="acRule!=null" class="margin-top" style="width: 100%;" :title="acRule.label" :column="3"
                         :size="size" border>
            <template #extra>
                <el-check-tag checked>{{acRule.mode}}</el-check-tag>
            </template>

            <el-descriptions-item>
                <template #label>
                    <div class="cell-item__title">
                        <el-icon :style="iconStyle">
                            <IconTrophy />
                        </el-icon>
                        总分
                    </div>
                </template>
                <el-row class="cell-item__content">{{acRule.scores}}</el-row>
            </el-descriptions-item>

            <el-descriptions-item>
                <template #label>
                    <div class="cell-item__title">
                        <el-icon :style="iconStyle">
                            <IconOpportunity />
                        </el-icon>
                        权重
                    </div>
                </template>
                <el-row class="cell-item__content">{{acRule.weighted}}</el-row>
            </el-descriptions-item>

            <el-descriptions-item>
                <template #label>
                    <div class="cell-item__title">
                        <el-icon :style="iconStyle">
                            <IconTickets />
                        </el-icon>
                        积分制度
                    </div>
                </template>
                <el-row class="cell-item__content">
                    <el-tag checked>{{acRule.mode}}</el-tag>
                </el-row>
            </el-descriptions-item>

            <el-descriptions-item>
                <template #label>
                    <div class="cell-item__title">
                        <el-icon :style="iconStyle">
                            <IconInfoFilled />
                        </el-icon>
                        说明
                    </div>
                </template>
                <el-row>
                    {{acRule.description}}
                </el-row>
            </el-descriptions-item>

        </el-descriptions>
    </el-scrollbar>
</template>
  
<script setup lang="ts">
import { computed, ref } from 'vue'

const size = ref('small')
const iconStyle = computed(() => {
    const marginMap = {
        large: '8px',
        default: '6px',
        small: '4px',
    }
    return {
        marginRight: marginMap[size.value] || marginMap.default,
    }
})


defineProps({
    acRule: {
        type: Object,
        default: null
    },
})

</script>
  
<style scoped lang="css">
.cell-item__title {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
}

.cell-item__content {
    justify-content: center;
}

.margin-top {
    margin-top: 28px;
    width: fit-content;
}
</style>
  