/* eslint-disable @typescript-eslint/no-explicit-any */
type ServerData = {
  name: string;
  [key: string]: any;
};

export const diffBetweenEnumAndServer = (enumValues: string[], serverData: ServerData[]) => {
  return enumValues.filter((value) => {
    return !serverData.some((data) => {
      return value === data.name;
    });
  });
};

export const diffBetweenServerAndEnum = (enumValues: string[], serverData: ServerData[]) => {
  return enumValues.filter((value) => {
    return serverData.some((data) => {
      return value === data.name;
    });
  });
};
