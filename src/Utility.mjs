export default class Utility {

  static must_be(object, type) {
    if (typeof type !== 'function') {
      throw new Error(`Invalid type argument: ${type}`);
    }
  
    const actualType = (object instanceof Object) ? object.constructor.name : typeof object;
    const expectedType = type.name || type; // Handle cases where type is a string like 'number'
  
    if (!(object instanceof type) && typeof object !== expectedType.toLowerCase()) {
      console.error('object:', object);
      throw new Error(`Expected ${expectedType} but got: ${actualType}`);
    }
  }
  

  static must_be_function(object) {
    if (typeof object !== 'function') {
      throw new Error(`Object is not a function`);
    }
  }
  

}
