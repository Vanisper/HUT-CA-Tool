<template>
    <el-col v-if="acRule!=null" v-for="(ruleItem,idx) in (acRule.items as IcommonRuleItems[])">
        <el-divider content-position="center">
            <el-tooltip class="box-item" effect="dark" :content="ruleItem.scoresMax!+''" placement="right">
                {{ruleItem.label}}
            </el-tooltip>
        </el-divider>
        <el-collapse :model-value="`content${idx}`">
            <el-collapse-item title="说明" class="ruleItem-description" :name="'desc'+idx">
                <div v-for="(desc) in ruleItem.description" class="ruleItem-description__content">
                    {{desc}}
                </div>
            </el-collapse-item>
            <!-- 这里有有计分的逻辑(减分制  当前项的总分数减去xxx.result的分数) -->
            <el-collapse-item :title="`内容 👼 ${ruleItem.scoresMax!+content1FormResult[idx].map(vl=>vl.result).reduce((pre,cur)=>(+pre+(+cur)),0)}`"
                              class="ruleItem-content" :name="'content'+idx">
                <!-- 这里需要取消默认的回车提交表单的事件 -->
                <el-form label-position="top" @submit.native.prevent>
                    <el-col style="margin: 5px 0;color: #f14040;">注意含有红色标记的项,点击查看详细说明（没有则是没有额外说明）</el-col>

                    <el-form-item v-for="(content,i) in ruleItem.content" class="ruleItem-content__content">
                        <template #label>
                            <div style="display: flex;align-items: center;">
                                <el-popover v-if="content.desc" placement="top-start" title="特别说明" :width="200"
                                            trigger="hover" :content="content.desc">
                                    <template #reference>
                                        <el-icon color="red" size="1.2em">
                                            <IconInfoFilled :style="{marginRight:'4px'}" />
                                        </el-icon>
                                    </template>
                                </el-popover>
                                {{content.rule}}
                                <el-tag type="danger" style="margin-left: 5px;">{{(content.scoreItem as
                                string).split("/")[0]}}{{(content.scoreItem as
                                    string).split("/")[1]=="i"?"每次":"(扣一次)"}}</el-tag>
                            </div>
                        </template>
                        <el-radio-group v-model="content1FormResult[idx][i].isCheck">
                            <el-radio label="是" />
                            <el-radio label="否" />
                        </el-radio-group>
                        <el-col v-if="content1FormResult[idx][i].isCheck=='是'">
                            <el-row>
                                <el-input type="number" v-model="content1FormResult[idx][i].callBack"
                                          placeholder="请输入数量">
                                    <template #prepend>
                                        <!-- 比较复杂的一段逻辑  最终的结果是xxx.result的值是xxx.callBack的5倍,并且还有其他限制逻辑 -->
                                        {{
                                        content1FormResult[idx][i].result
                                        =
                                        (+(content1FormResult[idx][i].callBack=
                                        ((content.scoreItem as
                                        string).split("/"))[1]=='i'
                                        ?content1FormResult[idx][i].callBack
                                        :(+content1FormResult[idx][i].callBack>1?"1":content1FormResult[idx][i].callBack)))
                                        *+((content.scoreItem as
                                        string).split("/"))[0]+""
                                        }}
                                    </template>
                                </el-input>
                            </el-row>
                        </el-col>
                    </el-form-item>

                </el-form>
            </el-collapse-item>
        </el-collapse>
    </el-col>
</template>

<script setup lang="ts">
import { IcommonRuleItems, IACRule } from '~~/types/types';
import assessmentRules from "~~/assets/datas/assessmentRules.json";
import { ElMessage, ElNotification } from 'element-plus';
import { type } from 'os';
import localForage from '~~/utils/localForage';

const props = defineProps({
    acRule: {
        type: Object,
        default: null
    },
})

const Content1FormKey = assessmentRules[0].ruleName;

const emits = defineEmits(["submitContent1"])

const content1FormResult = ref<{ isCheck: '是' | '否', callBack: string, result: string }[][]>([[]])

if (props.acRule != null) {
    if (JSON.parse(await localForage.getItem(Content1FormKey)) != null) {
        const { formResult } = JSON.parse(await localForage.getItem(Content1FormKey));
        content1FormResult.value = formResult
        ElMessage({
            message: '德育分已加载本地记录',
            type: 'info',
        })

    } else {
        // 根据表单的数量创建回收表单
        content1FormResult.value = Array.from(Array(((props.acRule as IACRule).items as IcommonRuleItems[]).length), () => new Array(((props.acRule as IACRule).items as IcommonRuleItems[]).concat.length));
        ((props.acRule as IACRule).items as IcommonRuleItems[]).forEach((value, index) => {
            value.content.forEach((val, idx) => {
                idx != 0 ? content1FormResult.value[index].push(
                    {
                        isCheck: '否',
                        callBack: "0",
                        result: "0",
                    }
                ) : content1FormResult.value[index][idx] = {
                    isCheck: '否',
                    callBack: "0",
                    result: "0",
                }
            })
        })
    }
}
const data = (props.acRule as IACRule);
const scores = data.scores;
const weighted = data.weighted;

watch(content1FormResult, (value) => {
    // 实时监听回收表单的标记情况
    value.forEach((val, index) => {
        val.forEach((v, i) => {
            // 当用户输入了小于0的数值  或者  选了否   当前项数据清零
            if (v.isCheck == '否') {
                content1FormResult.value[index][i].callBack = '0'
                content1FormResult.value[index][i].result = '0'
            }
            if (+v.callBack < 0) {
                content1FormResult.value[index][i].callBack = '0'
                content1FormResult.value[index][i].result = '0'
            }
        })
    })
    // 计算各小项结果(二元化一元)
    const resultGroup = content1FormResult.value.map((val) => (val.map(v => v.result)).reduce((pre, cur) => (+pre + (+cur)), 0))
    // 最终结果
    const resultGroupT = resultGroup.map((v, i) => data.items[i].scoresMax! + v >= 0 ? v : -data.items[i].scoresMax!)
    const result = resultGroupT.reduce((prev, next) => prev + next)

    // 向父级组件传递
    emits("submitContent1", {
        label: (props.acRule as IACRule).label,
        scores: scores,
        weighted: weighted,
        resultGroup: resultGroup.map((v, index) => ({ type: (props.acRule as IACRule).items[index].label, total: v })),
        resultGroupT: resultGroupT.map((v, index) => ({ type: (props.acRule as IACRule).items[index].label, total: v })),
        result: result + scores,
        resultT: (result + scores) * weighted,
        formResult: content1FormResult.value

    })
}, {
    immediate: true, deep: true
})

</script>