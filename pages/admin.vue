<template>
    <div class="view-container">
        <el-container class="admin-login">
            <el-main style="height: 100%;width: 100%;">
                <div v-if="!adminInfos.isCertified">
                    <el-image style="position: absolute;left: 0;top: 0;width: 100%;height: 100%;z-index: -99;"
                              src="/images/admin-top-bg.svg" fit="cover" />
                    <el-card
                             style="transform: translateY(30%);max-width: 500px;margin: 0 auto;padding: 30px 60px 60px 60px;background-color: #ffffffb3;margin-top: 50px;">
                        <h3 style="color: #ff2929;text-align: center;font-size: larger;">HUT综测收集管理员登录</h3>
                        <el-form label-position="top" label-width="100px" :model="formLabelAlign">
                            <el-form-item>
                                <template #label>
                                    <b>账号</b>
                                </template>
                                <el-input v-model="formLabelAlign.id" />
                            </el-form-item>
                            <el-form-item>
                                <template #label>
                                    <b>密码</b>
                                </template>
                                <el-input v-model="formLabelAlign.passwd" type="password" clear />
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="onSubmit">提交</el-button>
                                <el-button>
                                    <nuxt-link to="/" style="text-decoration: none;">
                                        返回首页
                                    </nuxt-link>
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </el-card>
                </div>
                <div v-else>
                    <el-descriptions title="管理信息" border>
                        <template #extra>
                            <el-button type="danger" round size="small" @click="loginOut">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </el-button>
                        </template>
                        <el-descriptions-item label="管理员id">
                            {{ adminInfos.id }}
                        </el-descriptions-item>
                        <el-descriptions-item label="管理员姓名">
                            {{ adminInfos.name }}
                        </el-descriptions-item>
                        <el-descriptions-item label="数据表个数">
                            {{ datas?.length }}
                        </el-descriptions-item>

                    </el-descriptions>
                    <!-- <el-table :data="datas">
                        <el-table-column :prop="value" :label="value" v-for="(value,index) in Object.keys(datas[0])" />
                    </el-table> -->
                    <el-divider>
                        <el-icon>
                            <star-filled />
                        </el-icon>
                    </el-divider>
                    <el-table :data="tableData" style="width: 100%;">
                        <el-table-column fixed prop="school" label="学校" />
                        <el-table-column prop="grade" label="年级(专业/-班级)" />
                        <el-table-column prop="count" label="成员数量" />
                        <el-table-column prop="json" label="JSON">
                            <template #default="scope">
                                <el-button v-if="tableData[scope.$index] != null" link type="primary" size="small"
                                           @click="getSrc(useRuntimeConfig().public.apiUrl + '/GetPublicSrc?path=' + tableData[scope.$index].json)">
                                    json数据
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="excel" label="EXCEL">
                            <template #default="scope">
                                <el-button v-if="tableData[scope.$index] != null" link type="primary" size="small"
                                           @click="getSrc(useRuntimeConfig().public.apiUrl + '/GetPublicSrc?path=' + tableData[scope.$index].excel)">
                                    excel数据
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="详细">
                            <template #default="scope">
                                <el-button v-if="tableData[scope.$index] != null" link type="danger" size="small"
                                           @click.prevent="showDetail(tableData[scope.$index].detail)">
                                    <el-tag>{{ scope.$index }} Click</el-tag>
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column fixed="right" label="开放/移除">
                            <template #default="scope">
                                <el-switch v-model="switchValue[scope.$index]" class="ml-2" inline-prompt
                                           style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                                           active-text="Y" inactive-text="N" />
                                <el-button link type="danger" size="small" @click.prevent="deleteRow(scope.$index)">
                                    移除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-dialog v-model="dialogTableVisible" title="详细" style="min-width: 95vw;">
                        <el-table :data="detail">
                            <el-table-column property="id" label="学号" />
                            <el-table-column property="name" label="姓名" />
                            <el-table-column property="result" label="加权平均分" />
                            <el-table-column property="lowOld" label="挂科(旧)" />
                            <el-table-column property="lowNew" label="挂科(新)" />
                            <el-table-column property="rank" label="排名" />
                        </el-table>
                    </el-dialog>
                    <el-button v-if="!isAdd" link type="primary" style="width: 100%;" @click="onAddNewItem">添加
                    </el-button>
                    <el-col v-if="isAdd">
                        <el-row style="margin: 20px;">
                            <el-tag><b style="color:#ff2929;">标签：</b>{{ excelLabel }}</el-tag>
                            <el-tag><b style="color:#ff2929;">是否开放收集：</b>{{ tempChecked }}</el-tag>
                            <el-button type="danger" @click="close" style="margin-left: 10px;" size="small">
                                <el-icon class="el-icon--left">
                                    <CircleCloseFilled />
                                </el-icon>
                                取消上传
                            </el-button>
                        </el-row>

                        <el-col style="margin-left: 20px;">
                            <el-upload ref="uploadRef"
                                       :action="useRuntimeConfig().public.apiUrl + '/UpLoadExcel?filename=' + excelLabel + '&isOpen=' + tempChecked"
                                       :headers="headerObj" :before-upload="allowUpload" :limit="1"
                                       :on-exceed="handleExceed" :auto-upload="true" accept=".xls,.xlsx"
                                       :on-success="onSuccess">
                                <template #trigger>
                                    <el-button type="primary">选择文件</el-button>
                                </template>
                                <template #tip>
                                    <div class="el-upload__tip text-red">
                                        限制一个文件
                                    </div>
                                </template>
                            </el-upload>
                        </el-col>
                    </el-col>
                </div>
            </el-main>

        </el-container>
        <NuxtChild></NuxtChild>
    </div>
</template>
  
<script lang="ts" setup>
import axios from "axios";
import { ElInput, ElMessage, ElMessageBox, ElNotification, ElSwitch, ElTable, ElTableColumn, ElUpload, genFileId, UploadFile, UploadFiles, UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from "element-plus";
import { StarFilled, CircleCloseFilled, Close } from "@element-plus/icons-vue";
import { IstudentGrade } from "~~/types/types";
import FileSaver from "file-saver";
import { dataURItoBlob } from "~~/utils/index";

const formLabelAlign = reactive({
    id: '',
    passwd: '',
})

const adminInfos = reactive({
    id: "",
    name: "",
    passwd: "",
    isCertified: false,
})


const isAdd = ref(false)
const switchValue = ref([]);
watch(switchValue, async (value) => {
    tableData.value.forEach((v, i, a) => {
        v.isOpen = value[i]
    });

    await axios.post(useRuntimeConfig().public.apiUrl + "/UpdateConfig", {
        token: localStorage.getItem("token"),
        dataConfig: tableData.value
    }).then((res) => {
        ElMessage({
            type: res.data.code ? "success" : "error",
            message: res.data.message
        })
    }).catch((err) => {
        ElMessage({
            type: "error",
            message: "未知错误：" + err
        })
    })
}, { deep: true });
// 展示数据
const tableData = ref([])

const datas = ref(null)

const deleteRow = (index: number) => {
    ElMessageBox.prompt(`请于下方输入<b>${tableData.value[index].label}</b>`, '确认删除？', {
        confirmButtonText: '确认移除',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true,
        inputValidator: (v) => v == tableData.value[index].label,
        inputErrorMessage: '输入不匹配',
        draggable: true,
    })
        .then(async ({ value }) => {
            tableData.value.splice(index, 1);
            ElMessage({
                type: 'success',
                message: `成功移除:${value}`,
            });

            await axios.post(useRuntimeConfig().public.apiUrl + "/UpdateConfig", {
                token: localStorage.getItem("token"),
                dataConfig: tableData.value
            }).then((res) => {
                ElMessage({
                    type: res.data.code ? "success" : "error",
                    message: res.data.message
                })
            }).catch((err) => {
                ElMessage({
                    type: "error",
                    message: "未知错误：" + err
                })
            })

        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '取消移除',
            })
        })
}

const tempTableData = ref(null)
const tempChecked = ref(true)
const allowFileExt = ['xls', 'json', "xlsx"]

const onAddNewItem = async () => {
    isAdd.value = true;
    const checked = ref<boolean>(true);
    const input1 = ref("湖南工业大学");
    const input2 = ref(""); // 年级
    const input3 = ref(""); // 专业
    const input4 = ref(""); // 其他

    await ElMessageBox({
        title: "录入该数据相关信息",
        message: () =>
            h('p', null, [
                h(ElSwitch, {
                    modelValue: checked.value,
                    'onUpdate:modelValue': (val: boolean) => {
                        checked.value = val;
                        tempChecked.value = val
                    },
                    activeText: "提交后是否立即开放收集"
                }), h(ElInput, {
                    require: true,
                    modelValue: input1.value,
                    'onUpdate:modelValue': (val: string) => {
                        input1.value = val;
                        excelLabel.value = input1.value + "_" + input2.value + "_" + input3.value + (input4.value ? "_" + input4.value : "");
                    },
                    placeholder: "学校",
                    style: "margin-bottom: 10px;margin-top: 10px;"
                }), h(ElInput, {
                    modelValue: input2.value,
                    'onUpdate:modelValue': (val: string) => {
                        input2.value = val;
                        excelLabel.value = input1.value + "_" + input2.value + "_" + input3.value + (input4.value ? "_" + input4.value : "");
                    },
                    placeholder: "年级",
                    style: "margin-bottom: 10px"
                }), h(ElInput, {
                    modelValue: input3.value,
                    'onUpdate:modelValue': (val: string) => {
                        input3.value = val;
                        excelLabel.value = input1.value + "_" + input2.value + "_" + input3.value + (input4.value ? "_" + input4.value : "");
                    },
                    placeholder: "专业",
                    style: "margin-bottom: 10px"
                }), h(ElInput, {
                    modelValue: input4.value,
                    'onUpdate:modelValue': (val: string) => {
                        input4.value = val;
                        excelLabel.value = input1.value + "_" + input2.value + "_" + input3.value + (input4.value ? "_" + input4.value : "");
                    },
                    placeholder: "其他(可填班级或其他用于分类的标签)",
                    style: "margin-bottom: 10px"
                })
            ]),
    })
        .then(({ value }) => {
            if (input1.value && input2.value && input3.value) {
                tempChecked.value = checked.value
                excelLabel.value = input1.value + "_" + input2.value + "_" + input3.value + (input4.value ? "_" + input4.value : "");
                ElMessage({
                    type: "success",
                    message: "录入成功",
                });
                ElNotification.info({
                    title: "提示",
                    dangerouslyUseHTMLString: true,
                    message: "请继续点击下方“选择文件”的按钮<br />上传<b>指定模板</b>的excel文件",
                })
                return true;
            } else {
                isAdd.value = false
                tempChecked.value = true
                excelLabel.value = ""
                ElMessage({
                    type: "info",
                    message: "请将必要的信息填写完毕",
                });
            }
        })
        .catch(() => {
            isAdd.value = false
            tempChecked.value = true
            excelLabel.value = ""
            ElMessage({
                type: "info",
                message: "取消录入",
            })
        })
}

const onAddItem = () => {
    tableData.value.push(tempTableData.value);
    switchValue.value.push(tempTableData.value.isOpen);
    tempTableData.value = null;
}

const onSubmit = async () => {
    await isAdmin(formLabelAlign.id, formLabelAlign.passwd);
}
const getSrc = async (src: string) => {
    const data = (await axios.get(src)).data;
    FileSaver.saveAs((data.prev + data.data), data.name + data.ext);
}
onMounted(async () => {
    const token = localStorage.getItem("token");
    if (token != null) {
        const tokenResult = (await axios.post(useRuntimeConfig().public.apiUrl + "/CheckToken", {
            token: token,
        })).data;
        if (tokenResult.code) {
            adminInfos.id = tokenResult.id;
            adminInfos.name = tokenResult.name;
            adminInfos.passwd = tokenResult.password;
            adminInfos.isCertified = true;
            headerObj.value = {
                "Authorization": localStorage.getItem("token")
            };
        } else {
            adminInfos.isCertified = false;
            localStorage.removeItem("token");
            ElMessage({
                type: "error",
                message: tokenResult.message,
            })
        }
    }


})
const loginOut = () => {
    localStorage.removeItem("token");
    adminInfos.isCertified = false;
    tableData.value = [];
    ElMessage({
        type: "info",
        message: "退出登录"
    })
}
const headerObj = ref();
watch(adminInfos, async (_value) => {

    if (!adminInfos.isCertified) {

    } else {
        if (localStorage.getItem("token") != null) {
            await axios.get(useRuntimeConfig().public.apiUrl + "/UserData", {
                params: { id: adminInfos.id, name: adminInfos.name, passwd: adminInfos.passwd }, headers: {
                    "Authorization": localStorage.getItem("token")
                }
            }).then(({ data }) => {
                if (data.code) {
                    headerObj.value = {
                        "Authorization": localStorage.getItem("token")
                    };
                    datas.value = data.datas

                    if (datas.value.length > 0) {
                        datas.value.forEach((value: { json: string, excel: string, label: string, isOpen: boolean, studentGrades: IstudentGrade[] }, _index: number) => {
                            let temp = {
                                label: value.label,
                                grade: value.label.split('_').length >= 3 ? `${value.label.split('_')[1]}(${value.label.split('_')[2]}${value.label.split('_').length == 4 ? "-" + value.label.split('_')[3] : ""})` : value.label,
                                school: value.label.split('_')[0],
                                count: value.studentGrades.length,
                                isOpen: value.isOpen,
                                json: value.json,
                                excel: value.excel,
                                detail: value.studentGrades
                            }

                            tempTableData.value = temp
                            onAddItem();
                        })
                    }
                } else {
                    // throw data.message;
                }
            }).catch((_error) => {
                adminInfos.isCertified = false;
                ElMessage({
                    type: "error",
                    message: "未知错误：" + _error
                })
            })
        }
    }

}, { immediate: true })

const excelLabel = ref("");

const uploadRef = ref<UploadInstance>();

const handleExceed: UploadProps['onExceed'] = (files) => {
    uploadRef.value!.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadRef.value!.handleStart(file)
}


const allowUpload = () => {
    if (excelLabel.value && excelLabel.value.split("_").length >= 3) {
        return true;
    } else {
        ElMessage({
            message: "请将相关信息填写完成之后再上传数据",
            type: "error"
        })
        return false;
    }
}

const onSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    if (response.code) {
        ElMessage({
            type: "success",
            message: response.message,
        });
        let temp = {
            label: response.data.label,
            grade: response.data.label.split('_').length >= 3 ? `${response.data.label.split('_')[1]}(${response.data.label.split('_')[2]}${response.data.label.split('_').length == 4 ? "-" + response.data.label.split('_')[3] : ""})` : response.data.label,
            school: response.data.label.split('_')[0],
            count: response.data.studentGrades.length,
            isOpen: response.data.isOpen,
            json: response.data.json,
            excel: response.data.excel,
            detail: response.data.studentGrades
        }
        const reIndex = tableData.value.map(v => v.label).indexOf(response.data.label);
        if (reIndex >= 0) {
            tableData.value[reIndex] = temp
        } else {
            tempTableData.value = temp
            onAddItem();
        }
        isAdd.value = false;
        tempChecked.value = true
        excelLabel.value = "";
    } else {
        isAdd.value = false
        tempChecked.value = true
        excelLabel.value = ""
        ElMessage({
            type: "info",
            message: "取消录入",
        })
        ElMessage({
            type: "error",
            message: "上传失败：" + response.message,
        })
    }
}
const dialogTableVisible = ref(false);
const detail = ref();
const showDetail = (det: any) => {
    detail.value = det;
    dialogTableVisible.value = true;
}
const close = () => {
    isAdd.value = false
    tempChecked.value = true
    excelLabel.value = ""
    ElMessage({
        type: "info",
        message: "取消录入",
    })
}

const isAdmin = async (id: string, passwd: string) => {
    await axios.get(useRuntimeConfig().public.apiUrl + "/IsAdmin", {
        params: {
            id,
            passwd,
        }
    }).then(async ({ data }) => {
        if (data.code) {
            ElMessage({
                type: "success",
                message: data.message
            });
            localStorage.setItem("token", data.token);
            adminInfos.id = formLabelAlign.id;
            adminInfos.name = data.name;
            adminInfos.isCertified = true;
        } else {
            ElMessage({
                type: "error",
                message: data.message,
                dangerouslyUseHTMLString: true
            });
        }
    }).catch((_error) => {
        ElMessage({
            type: "error",
            message: "未知错误(接口崩啦)[联系qq 273266469]：" + _error
        });
    })
}
</script>

<style scoped>
.admin-login {
    height: 100vh;
    width: 100vw;
    justify-content: center;
    align-items: center;
}
</style>
  