const Util = {

  must_be(object, type) {
    if (!(object instanceof type)) {
      throw new Error(`Object is not of type ${type.name}`);
    }
  }

}

export default Utility