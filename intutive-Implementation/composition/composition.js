import { reactive, ref, computed, watchEffect, watch, onMounted } from "vue";

export default {
  template:`{{count}}`,
  props:['id']
  setup(props) {
    const state = reactive({ count: 0 });
    // 自动深层监听 ，无法获取旧值
    // watchEffect(() => console.log(state.count));
    // // 这种用法就能手动模拟响应式
    // const count = ref(0);
    // const plusOne = computed(() => state.count++);
    // // 显示指定监听对象，只监听特定对象/属性，能够获取旧值,懒执行
    // watch([count, plusOne], ([count, plusOne], [oldCount, oldPlusOne]) => {});

    watchEffect(() => {
      fetch(`url${props.id}`)
        .then((res) => res.json())
        .then((data) => {
          fetchData.value = data;
        });
    });

    onMounted(() => console.log("mounted!"));
    // 返回的这部分就是所谓的模板渲染上下文
    return {
      count:ref(0),
      state,
      increment: () => {
        state.count++;
      },
    };
  },
};
