const preSignUp = async (event: any, context: any, callback: any) => {
  console.log(event);
  console.log(process.env)
  callback(null, event);
};

const postConfirmation = async (event: any, context: any, callback: any) => {
  console.log(event);
  callback(null, event);
};

export { postConfirmation, preSignUp };
