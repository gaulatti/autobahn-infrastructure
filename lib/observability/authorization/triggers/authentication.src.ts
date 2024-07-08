const preAuthentication = async (event: any, context: any, callback: any) => {
  console.log(event);
  callback(null, event);
};

const postAuthentication = async (event: any, context: any, callback: any) => {
  console.log(event);
  callback(null, event);
};

export { postAuthentication, preAuthentication };
