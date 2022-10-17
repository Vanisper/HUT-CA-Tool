<template>
    <el-col v-if="acRule!=null" v-for="(ruleItem,idx) in (acRule.items as Array<IcommonRuleItems|IcomplexRuleItems>)">
        <el-divider content-position="center">
            <el-tooltip class="box-item" effect="dark" :content="ruleItem.scoresMax!+''" placement="right">
                {{ruleItem.label}}
            </el-tooltip>
        </el-divider>
        <el-collapse :model-value="`content${idx}`">
            <el-collapse-item title="说明（只有上学年期间(2021.9.1~2022.8.31)的奖项才可填报）" class="ruleItem-description"
                              :name="'desc'+idx">
                <div v-for="(desc) in ruleItem.description" class="ruleItem-description__content">
                    {{desc}}
                </div>
            </el-collapse-item>
            <!-- &&content3FormResult[content3FormResult.map(v=>v[0].type).indexOf(ruleItem.label)]?content3FormResult[content3FormResult.map(v=>v[0].type).indexOf(ruleItem.label)].map(v=>v.level.split('-')[v.level.split('-').length-1]).reduce((a,b)=>(+a+(+b)+'')):''-->
            <el-collapse-item :title="`内容 👼 ${content3FormResult!=null?(content3FormResult[content3FormResult.map(v=>v[0].type).indexOf(ruleItem.label)]?content3FormResult[content3FormResult.map(v=>v[0].type).indexOf(ruleItem.label)].map(v=>+v.level.split('-')[v.level.split('-').length-1]).reduce((a,b)=>a+b):0):''}`"
                              class="ruleItem-content" :name="'content'+idx">
                <AddItem v-if="!ruleItem.isBasic" :content="(ruleItem as IcommonRuleItems).content"
                         :history="(content3FormResult!=null&&!(content3FormResult.length==1&&content3FormResult[0].length==0)&&!(content3FormResult.length==1&&content3FormResult[0].length==undefined))?content3FormResult[content3FormResult.map(val => val[0].type).indexOf(ruleItem.label)]:undefined"
                         :contentName="ruleItem.label" :scores-max="ruleItem.scoresMax" @return-item="returnItems" />
                <el-col v-else>该项为全体加分项,已自动添加</el-col>
            </el-collapse-item>
        </el-collapse>


    </el-col>

</template>
  
<script lang="ts" setup>
import { IACRule, IcommonRuleItems, IcomplexRuleItems, ICPResultItem } from '~~/types/types';
import AddItem from './Content3/addItem.vue';
import assessmentRules from "~~/assets/datas/assessmentRules.json";
import { dayjs, ElMessage } from 'element-plus';
import localForage from '~~/utils/localForage';

const props = defineProps({
    acRule: {
        type: Object,
        default: null
    },
})
const Content3FormKey = assessmentRules[2].ruleName;
const content3FormResult = ref<ICPResultItem[][]>()
const emits = defineEmits(["submitContent3"])

if (props.acRule != null) {
    const base = (props.acRule.items.filter((val: IcomplexRuleItems) => val.isBasic).map((v: IcomplexRuleItems): ICPResultItem => {
        return {
            type: v.label,
            name: v.label,
            level: "全体默认分数-" + v.scoresMax,
            time: [dayjs(new Date(2021, 8, 1)).format("YYYY/MM/DD"), dayjs(new Date(2022, 7, 31)).format("YYYY/MM/DD")],
            file: []
        }
    }));
    if (JSON.parse(await localForage.getItem(Content3FormKey)) != null) {
        const { formResult } = JSON.parse(await localForage.getItem(Content3FormKey));
        content3FormResult.value = formResult
        if (base.length > 0) {
            try {
                emits("submitContent3", {
                    label: (props.acRule as IACRule)?.label,
                    formResult: content3FormResult.value,
                    result: content3FormResult.value.map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b),
                    resultT: content3FormResult.value.map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b) * (props.acRule as IACRule).weighted,
                    resultGroup: content3FormResult.value.map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
                    resultGroupT: content3FormResult.value.map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
                    scores: (props.acRule as IACRule).scores,
                    weighted: (props.acRule as IACRule).weighted
                });
            } catch (error) {
                // 创新分不存在
                emits("submitContent3", {
                    label: (props.acRule as IACRule)?.label,
                    formResult: [base],
                    result: [base].map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b),
                    resultT: [base].map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b) * (props.acRule as IACRule).weighted,
                    resultGroup: [base].map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
                    resultGroupT: [base].map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
                    scores: (props.acRule as IACRule).scores,
                    weighted: (props.acRule as IACRule).weighted
                });
            }
            // [base].push([base])
        }
        ElMessage({
            message: '创新分已加载本地记录',
            type: 'info',
        })
    } else {
        // 根据表单的数量创建回收表单
        content3FormResult.value = [base];
        emits("submitContent3", {
            label: (props.acRule as IACRule)?.label,
            formResult: [base],
            result: [base].map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b),
            resultT: [base].map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b) * (props.acRule as IACRule).weighted,
            resultGroup: [base].map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
            resultGroupT: [base].map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
            scores: (props.acRule as IACRule).scores,
            weighted: (props.acRule as IACRule).weighted
        });
    }
}



// 有子组件回馈数据  就奖数据整合一下  然后反馈给index
const returnItems = (value: {
    type: string;
    data: ICPResultItem[]
}) => {
    if (content3FormResult.value == null) {
        content3FormResult.value = [value.data]
    }
    else {
        try {
            const index = content3FormResult.value.map(v => v[0].type).indexOf(value.type)
            if (index == -1) {
                // 没有就push
                content3FormResult.value.push(value.data)
            } else {
                // 有就替换(update)
                if (value.data.length == 0) {
                    // 空就去除
                    content3FormResult.value.splice(index, 1)
                } else {
                    content3FormResult.value[index] = value.data
                }
            }
        } catch (error) {
            if (value.data.length == 0) {
                content3FormResult.value = [...content3FormResult.value.filter(v => v.length > 0 && v)]
            }
        }
    }
    try {
        emits("submitContent3", {
            label: (props.acRule as IACRule)?.label,
            formResult: content3FormResult.value,
            result: content3FormResult.value.map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b),
            resultT: content3FormResult.value.map(val => (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c))).reduce((a, b) => a + b) * (props.acRule as IACRule).weighted,
            resultGroup: content3FormResult.value.map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
            resultGroupT: content3FormResult.value.map(val => ({ type: val[0].type, total: (val.map(v => +v.level.split('-')[v.level.split('-').length - 1])).reduce((p, c) => (p + c)) })),
            scores: (props.acRule as IACRule).scores,
            weighted: (props.acRule as IACRule).weighted
        });
    } catch (error) {
        // 被删完了
        emits("submitContent3", {
            label: (props.acRule as IACRule)?.label,
            formResult: null,
            result: 0,
            resultT: 0 * (props.acRule as IACRule).weighted,
            resultGroup: null,
            resultGroupT: null,
            scores: (props.acRule as IACRule).scores,
            weighted: (props.acRule as IACRule).weighted
        });
    }

}

</script>
  