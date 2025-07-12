// 判断组件是否需要更新
export const shouldUpdateComponent = (prevVNode, nextVNode) => {
  const { props: prevProps } = prevVNode;
  const { props: nextProps } = nextVNode;

  // 判断 props 属性值是否相同
  for (const key in nextProps) {
    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  return false;
};
