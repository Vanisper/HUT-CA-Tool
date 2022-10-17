<template>
    <el-col v-if="content!=null">
        <el-tag v-for="(tag,i) in dynamicTags" :key="tag" class="mx-1" closable :disable-transitions="false"
                @close="handleClose(tag)" @click="showDetailHandler(tag,i)" style="cursor: pointer;">
            {{ tag }}
        </el-tag>
        <itemDetail :show-sth="showSth" :visible="visible" @update-visible="updateVisible" />
        <el-row style="justify-content: center;">
            <el-col v-if="inputVisible">
                <el-row style="align-items: center;">
                    <el-row style="margin: 0 5px;">等级:</el-row>
                    <el-row v-if="selectValue">
                        <el-tag v-for="(tag) in selectValue.split('-')">{{tag}}</el-tag>
                    </el-row>
                    <el-row style="margin: 0 5px;">名称:</el-row>
                    <el-row v-if="inputValue">
                        <el-tag type="danger">{{inputValue}}</el-tag>
                    </el-row>
                    <el-row style="margin: 0 5px;">时间(段):</el-row>
                    <el-row v-if="dateValue">
                        <el-tag type="info">{{(dateValue.map(v=>dayjs(v).format("YYYY.MM.DD"))).join('-')}}</el-tag>
                    </el-row>
                    <el-row style="margin: 0 5px 0 20px;">
                        <el-button type="danger" :icon="Close" circle style="height: 20px;width: 20px;"
                                   @click="closeInput" />
                    </el-row>
                </el-row>
                <el-col style="margin: 10px;">
                    <uploadSth @update-file-lists="updateFileLists" :fileList="fileList"
                               :fileBaseName="`${contentName}_${selectValue}_${inputValue}_${(dateValue.map(v=>dayjs(v).format('YYYY.MM.DD'))).join('-')}`" />
                </el-col>
                <el-input ref="InputRef" v-model="inputValue" class="ml-1 w-20" size="default"
                          placeholder="前选等级后传材料,此填奖项名称" @keyup.enter="handleInputConfirm">
                    <template #prepend>
                        <el-select v-model="select" placeholder="Select" style="width: 115px" clearable
                                   @clear="clearSelect">

                            <el-scrollbar style="max-width: calc(100vw - 12px);" view-style="width: 100%"
                                          wrap-style="width: 100%">

                                <el-col v-for="(value, index) in content">

                                    <!-- 一级选择: 注意value的设置 -->
                                    <el-option v-if="typeof value.scoreItem=='string'" :label="selectValue"
                                               :value="selectValue"
                                               style="display: flex;flex-wrap: nowrap;justify-content: space-between;min-width: max-content;"
                                               @click.stop>
                                        <el-col @click="restore(index,-1)">
                                            <span style="flex-shrink: 0;margin-right: 5px;">
                                                <el-tooltip placement="right" :content="value.desc">{{ value.rule }}
                                                </el-tooltip>
                                            </span>
                                            <span
                                                  style="flex-shrink: 0;color: var(--el-text-color-secondary);font-size: 13px;">
                                                {{value.scoreItem.split('/')[0]}}
                                            </span>
                                        </el-col>

                                    </el-option>
                                    <!-- 两级选择：注意value的设置 -->
                                    <el-option v-else :label="selectValue" :value="selectValue"
                                               style="display: flex;flex-wrap: nowrap;justify-content: space-between;min-width: max-content;">
                                        <span style="flex-shrink: 0;margin-right: 5px;">
                                            <el-tooltip placement="right" :content="value.desc">{{ value.rule }}
                                            </el-tooltip>
                                        </span>
                                        <el-radio-group v-model="radio[index]"
                                                        style="flex-shrink: 0;color: var(--el-text-color-secondary);font-size: 13px;">
                                            <el-radio v-for="(example,idx) in value.example" :label="example"
                                                      @click="restore(index,idx)">
                                                {{example}}({{value.scoreItem[idx].split("/")[0]}})
                                            </el-radio>
                                        </el-radio-group>
                                    </el-option>
                                </el-col>

                            </el-scrollbar>
                        </el-select>
                    </template>
                    <template #append>
                        <el-button :icon="Upload" @click="handleInputConfirm" />
                    </template>
                </el-input>
                <el-date-picker v-model="dateValue" type="daterange" start-placeholder="开始时间" end-placeholder="结束时间"
                                :default-value="period">
                </el-date-picker>

            </el-col>
            <el-button v-else class="button-new-tag ml-1" size="large" @click="showInput">
                + 添加新项目
            </el-button>
        </el-row>
    </el-col>
</template>
  
<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { ElInput, ElMessage, ElMessageBox, UploadUserFile } from 'element-plus'
import { Close, Upload } from "@element-plus/icons-vue";
import { IruleContents, IcommonRuleItems, ICPResultItem } from '~~/types/types'
import uploadSth from "~~/components/Rules/items/Content3/uploadSth.vue";
import itemDetail from "~~/components/Rules/items/Content3/itemDetail.vue";
import dayjs from "dayjs";

const props = defineProps({
    content: {
        type: Array<IruleContents>,
        default: null
    },
    contentName: {
        type: String,
        required: true
    },
    history: {
        type: Array<ICPResultItem>,
        default: undefined
    },
    scoresMax: {
        type: Number,
        default: undefined
    }

})

const emits = defineEmits(['returnItem'])
const result = ref<ICPResultItem[]>(props.history != undefined ? [...props.history] : [])

const period = [
    dayjs(new Date(2021, 8, 1)).format("YYYY/MM/DD"),
    dayjs(new Date(2022, 7, 31)).format("YYYY/MM/DD"),
]

const dateValue = ref(period)

// 记录奖项等级
const select = ref('')
const selectValue = ref('')
// 根据实际的二级分类的数量创建单选记录框(  "" && v.example[0]  前面的  "" &&  可以去掉  去掉的话就是初始化了值)
// 当前逻辑下应该初始化成空字符串
const radio = ref(props.content == null ? [] : props.content.map(v => ("" && v.example[0])))

const inputValue = ref('')

const dynamicTags = ref(props.history != undefined ? props.history.map(value => value.name) : [])
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()
const fileList = ref<UploadUserFile[]>([])

const updateFileLists = (value: any) => {
    fileList.value = JSON.parse(JSON.stringify(value))
}


const handleClose = async (tag: string) => {
    await ElMessageBox.confirm(
        '确认删除此项?',
        '警告',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
            result.value.splice(result.value.map(v => v.name).indexOf(tag), 1)
            emits("returnItem", {
                type: props.contentName,
                data: result.value
            })
            ElMessage({
                type: 'success',
                message: '已删除此项',
            })
        })
        .catch((e) => {
            console.log(e);

            ElMessage({
                type: 'info',
                message: '取消删除',
            })
        })
}

const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
        InputRef.value!.input!.focus()
    })
}
// 奖项详情相关参数
const visible = ref(false)
const showSth = ref<ICPResultItem>()
const showDetailHandler = (tag: string, i: number) => {
    if (!visible.value) {
        visible.value = true
        showSth.value = result.value[i]
    } else {
        visible.value = false
    }
}
const updateVisible = (value: boolean) => {
    visible.value = value
}
const closeInput = () => {
    inputVisible.value = false
    inputValue.value = ''
    selectValue.value = ""
    select.value = ""
}

const restore = (index: number, idx: number) => {
    if (idx != -1) {
        selectValue.value = props.content[index].rule + "-" + props.content[index].example[idx] + "-" + props.content[index].scoreItem[idx].split('/')[0];

    } else {
        selectValue.value = props.content[index].rule + "-" + (props.content[index].scoreItem as string).split('/')[0];
    }
}

const clearSelect = () => {
    selectValue.value = ""
}


const handleInputConfirm = () => {

    if (inputValue.value) {
        if (fileList.value.length == 0) {
            ElMessage({
                type: "error",
                message: "请上传证明材料！",
            })
            return;
        }
        if (select.value) {
            if (result.value.length != 0 && props.scoresMax != undefined) {
                if (result.value.map(v => +v.level.split('-')[v.level.split('-').length - 1]).reduce((a, b) => (a + b)) + (+select.value.split('-')[select.value.split('-').length - 1]) > props.scoresMax) {
                    ElMessage({
                        type: "error",
                        message: `超出该项的最大分值了！（${props.scoresMax}分）<br /><br />你可以选择删掉其他项目换成该项目以达到得分最大化<br /><br />也可以放弃填报该项目`,
                        dangerouslyUseHTMLString: true
                    })
                    return;
                }
            }
            // 储存信息
            dynamicTags.value.push(inputValue.value)
            result.value.push({
                "type": props.contentName,
                "level": select.value,
                "name": inputValue.value,
                "time": [...dateValue.value],
                "file": [...fileList.value]
            })
            emits("returnItem", {
                type: props.contentName,
                data: result.value
            })
            inputVisible.value = false
            inputValue.value = ''
            selectValue.value = ""
            select.value = ""
            fileList.value = []
        } else {
            ElMessage({
                type: "info",
                message: "请选择奖项等级",
            })
        }
    } else {
        if (select.value) {
            if (fileList.value.length == 0) {
                ElMessage({
                    type: "error",
                    message: "请上传证明材料！",
                })
                return;
            }
            ElMessage({
                type: "info",
                message: "请输入奖项名称",
            })
        } else {
            if (fileList.value.length != 0) {
                ElMessage({
                    type: "error",
                    message: "请填写完表单",
                })
                return;
            }
            ElMessage({
                type: "info",
                message: "你没有输入内容",
            })
            inputVisible.value = false
            inputValue.value = ''
            selectValue.value = ""
            select.value = ""
            fileList.value = []
        }
    }
}
watch(result, (value) => {
    if (value.length != 0 && props.scoresMax != undefined) {
        if (value.map(v => +v.level.split('-')[v.level.split('-').length - 1]).reduce((a, b) => (a + b)) > props.scoresMax) {

        }
    }
}, { immediate: true, deep: true })

</script>
  