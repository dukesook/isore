const Utility = {

  must_be(object, type) {
    if (!(object instanceof type)) {
      throw new Error('Excected ' + type.name + ' but got: ' + object);
    }
  },

  must_be_function(object) {
    if (typeof object !== 'function') {
      throw new Error(`Object is not a function`);
    }
  }
  

}

export default Utility