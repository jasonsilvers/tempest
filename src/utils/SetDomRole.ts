const setDomRole = (prefix: string, modifier?: string) => {
  if (modifier) {
    return `${prefix.replace(' ', '_').toLowerCase()}_${modifier.replace(' ', '_').toLowerCase()}`;
  } else {
    return `${prefix.replace(' ', '_').toLowerCase()}`;
  }
};

export default setDomRole;
