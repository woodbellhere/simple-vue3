function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector);
      let isMounted = false;
      let odlVNode = null;

      watchEffect(function () {
        if (!isMounted) {
          odlVNode = mount(rootComponent.render(), container);
          isMounted = true;
        } else {
          const newVNode = rootComponent.render();
          patch(odlVNode, newVNode);
          odlVNode = newVNode;
        }
      });
    },
  };
}
