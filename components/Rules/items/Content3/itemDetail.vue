<template>
    <el-dialog v-if="showSth!=null" :model-value="visible" :show-close="false" draggable style="overflow: hidden;">
        <template #header="{ close, titleId, titleClass }">
            <div class="my-header">
                <h4 :id="titleId" :class="titleClass">{{(showSth as ICPResultItem).name}}</h4>
                <el-button type="danger" @click="close" style="margin-left: auto;" size="small">
                    <el-icon class="el-icon--left">
                        <CircleCloseFilled />
                    </el-icon>
                    关闭
                </el-button>
            </div>
        </template>
        <el-row>
            <el-col>证明材料</el-col>
            <el-row v-for="(value,index) in (showSth as ICPResultItem).file" style="">
                <el-image style="width: 100%; height: 100" :key="value.url" :src="value.url" lazy fit="cover"
                          :initial-index="index" :preview-src-list="(showSth as ICPResultItem).file.map(v=>v.url)"
                          @click.stop />
                <!-- <el-row style="justify-content: center;align-items: center;">
                    <el-upload :action="`http://192.168.56.1:3000/api/v1/UpLoad?filename=${value.name}&id=${id}&ext=${value.url.split('.')[value.url.split('.').length-1]}`"
                               :on-exceed="handleExceed" :on-success="update" :auto-upload=true>
                        <template #trigger>
                            <el-button type="primary" size="small">替换</el-button>
                        </template>
                    </el-upload>
                </el-row> -->
            </el-row>

        </el-row>
        <template #footer>
            <el-tag type="danger">{{(showSth as ICPResultItem).type}}</el-tag>
            <el-tag>{{(showSth as ICPResultItem).level.split('-')[0]}}</el-tag>
            <el-tag type="success">{{(showSth as ICPResultItem).level.split('-')[1]}}</el-tag>
            <el-tag v-if="(showSth as ICPResultItem).level.split('-')[1]!=(showSth as ICPResultItem).level.split('-')[(showSth as ICPResultItem).level.split('-').length-1]"
                    type="success">{{(showSth as ICPResultItem).level.split('-')[2]}}</el-tag>
            <el-tag type="info">{{(showSth as
            ICPResultItem).time.map(v=>dayjs(v).format('YYYY/MM/DD')).reduce((p,c)=>(p==c?c:p+'-'+c))}}</el-tag>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { ICPResultItem } from "~~/types/types";
import { CircleCloseFilled, Plus } from "@element-plus/icons-vue";

import dayjs from "dayjs";
import { genFileId, UploadInstance, UploadProps, UploadRawFile } from "element-plus";
import localForage from "~~/utils/localForage";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    showSth: {
        type: Object,
        default: null
    }
})
const id = ref(JSON.parse((await localForage.getItem('studentInfos'))).id.value)
const emits = defineEmits(['updateVisible'])

watch(props, (value) => {
    emits("updateVisible", value.visible)
})

const upload = ref<UploadInstance>()
const update = () => {
    console.log(1);

}
const handleExceed: UploadProps['onExceed'] = (files) => {
    upload.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    upload.value!.handleStart(file)
}
</script>

<style scoped>
.my-header {
    display: flex;
    align-items: center;
    justify-content: space-around;
}
</style>