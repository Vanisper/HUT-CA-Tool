<template>
    <el-upload v-if="fileList&&fileList!=null" :file-list="fileList" :http-request="UploadImage"
               :action="`http://192.168.56.1:3000/api/v1/UpLoad?filename=${fileBaseName}_${((new Date()).getTime())}&id=${id}&ext=${fileList[fileList.length-1]?.name.split('.')[1]}`"
               :before-upload="allowUpload" list-type="picture-card" :on-preview="handlePictureCardPreview"
               :auto-upload=true :on-remove="handleRemove" :on-success="onSuccess" :on-error="onError" drag
               style="height: 100%;">
        <el-icon>
            <Plus />
        </el-icon>
    </el-upload>
    <el-dialog v-model="dialogVisible"
               style="display: flex;justify-content: center;flex-direction: column;align-items: center;transform: translateY(-70%);top: 50%;">
        <img w-full :src="dialogImageUrl" alt="图片预览" style="width: 100%;height: 100%;object-fit: contain;" />
    </el-dialog>

</template>
  
<script lang="ts" setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, UploadFile, UploadFiles, UploadProps, UploadUserFile } from 'element-plus'
import { convertImgToBase64 } from '~~/utils';
import localForage from '~~/utils/localForage';
import getQuery from '~~/utils/getQuery';

const props = defineProps({
    fileList: {
        type: Array<UploadUserFile>,
        default: []
    },
    fileBaseName: {
        type: String,
        default: ''
    }
})

const emits = defineEmits(['updateFileLists'])
// 用户id
const id = ref(JSON.parse(await localForage.getItem("studentInfos")).id.value)


const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
    console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
    dialogImageUrl.value = uploadFile.url!
    dialogVisible.value = true
}

const onSuccess = async (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    props.fileList[props.fileList.length] = {
        name: response.data.name,
        url: await convertImgToBase64(uploadFile.url, () => { }, () => { }, true)
    }
    emits("updateFileLists", props.fileList)
}
const onError = () => {
    if ((props.fileBaseName + "_" + props.fileList.length).split("_").every(v => v != '')) {
        ElMessage({
            message: "未知错误(上传失败)<br />[qq 273266469]",
            dangerouslyUseHTMLString: true,
            type: "error"
        })
    }
    else {
        ElMessage({
            message: "请将奖项等级以及名称填写完成之后再上传证明材料",
            type: "error"
        })
    }
}
// 自定义上传事件  实际上没有上传  只是转成base64直接返回
const UploadImage = (param) => {
    const formData = new FormData()
    formData.append('file', param.file)
    const { filename, id, ext } = getQuery(param.action)
    param.onSuccess({
        data: {
            name: filename,
            id, ext,
        }
    }, {
        name: filename,
        status: 'success',
        uid: (new Date()).getDate(),
        url: window.URL.createObjectURL(param.file),
    });
}

const allowUpload = () => {
    if ((props.fileBaseName + "_" + props.fileList.length).split("_").every(v => v != '')) {

    } else {
        ElMessage({
            message: "请将奖项等级以及名称填写完成之后再上传证明材料",
            type: "error"
        })

    }
    return (props.fileBaseName + "_" + props.fileList.length).split("_").every(v => v != '')
}
</script>
  