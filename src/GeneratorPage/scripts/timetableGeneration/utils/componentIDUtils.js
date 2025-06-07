export const getBaseComponentId = (componentId) => {
  if (!componentId) return componentId;
  const dashIndex = componentId.indexOf("-");
  return dashIndex !== -1 ? componentId.substring(0, dashIndex) : componentId;
};