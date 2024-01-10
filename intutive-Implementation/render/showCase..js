import { h } from "vue";

const App = {
  render() {
    return h(
      "div",
      {
        id: "h-div",
      },
      [h("span", "world")]
    );
  },
};
// equal to
<div id="h-div">
  <span>world</span>
</div>;
// 

const App2 = {
  render() {
    // v-if manually
    return this.condition
      ? h(
          "div",
          {
            id: "h-div",
          },
          [h("span", "world")]
        )
      : h("p", "other");
  },
};

//  and equal to
<template v-if="condition">
  <div id="h-div">
    <span>world</span>
  </div>
</template>;
<template v-else>
  <p>other</p>
</template>;
// 

const App3 = {
  render() {
    // v-for manually
    return this.list.map((item) => {
      return h("div", { key: item.id }, item.text);
    });
  },
};
// equal to 
<div v-for="item in list" :key="item.id">{{item.text}}</div>
// 

const Stack = {
  render(){
    const slot = this.$slot.default() || []
    return h('div', {class:'stack'}, slot.map(child => {
      return h('div', {class:`mt-${this.$props.size}`}, [child])
    }))
  }
}

<Stack size="4">
  <div>hello</div>
  <Stack size="4">
    <div>hello</div>
    <div>hello</div>
  </Stack>
</Stack>

<div class="stack">
  <div class="mt-4">
    <div>hello</div>
  </div>
  <div class="mt-4">
    <div class="stack">
      <div class="mt-4">
        <div>hello</div>
      </div>
    </div>
  </div>
</div>

