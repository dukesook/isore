export default class Utility {

  static must_be(object, type) {
    if (!(object instanceof type)) {
      console.error('object:', object);
      // throw new Error('Excected ' + type.name + ' but got: ' + object);
      throw new Error(`Expected ${type.name} but got: ${object?.constructor?.name || typeof object}`);
    }
  }

  static must_be_function(object) {
    if (typeof object !== 'function') {
      throw new Error(`Object is not a function`);
    }
  }
  

}
