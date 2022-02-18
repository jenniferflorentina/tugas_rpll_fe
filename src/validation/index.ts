export default {
  required: (fieldName) => (v) => !!v || `${fieldName} is required`,
  isValidEmail: () => ((v) => {
    if (v) {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(v).toLowerCase());
    }
    return true;
  }) || `E-mail is not valid`,
  minLength: (fieldName, min) => (v) => v?.length >= min || `${fieldName} more than ${min} characters`,
  maxLength: (fieldName, max) => (v) => {
    if (!v) return true;
    return v.length <= max || `${fieldName} less than ${max} characters`;
  },
  isNumber: () => (v) => {
    if (!v) return true;
    return /^[0-9]*$/.test(v) || `not a number`;
  },
};
