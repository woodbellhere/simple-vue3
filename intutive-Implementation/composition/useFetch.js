const { createApp, ref, watchEffect } = "vue";

function useFetch(getUrl) {
  const data = ref(null);
  const error = ref(null);
  const isPending = ref(false);

  watchEffect(() => {
    isPending.value = true;
    data.value = null;
    error.value = null;
    fetch(getUrl())
      .then((res) => res.json())
      .then((_data) => {
        setTimeout(() => {
          data.value = _data;
          isPending.value = false;
        }, 1000);
      })
      .catch((err) => {
        err.value = err;
        isPending.value = false;
      });
  });
}
const Post = {
  template: `
  <div v-if="isPending">loading...</div>
  <div v-else-if="data">{{data}}</div>
  <div v-else-if="error">Something went wrong: {{error.message}}</div>
  `,
  setup(props) {
    const { data, error, isPending } = useFetch(
      () => `https://jsonplaceholder.typeicode.com/todos/${props.id}`
    );
    return {
      data,
      error,
      isPending,
    };
  },
};

const App = {
  components: { Post },
  data() {
    return {
      id: 1,
    };
  },
  template: `
  <button @click="id++">change ID</button>
  <Post :id="id"/>
  `,
};

createApp(App).mount("#app");
