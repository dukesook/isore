const Utility = {

  must_be(object, type) {
    if (!(object instanceof type)) {
      throw new Error(`Object is not of type ${type.name}`);
    }
  },

  must_be_function(object) {
    if (typeof object !== 'function') {
      throw new Error(`Object is not a function`);
    }
  }
  

}

export default Utility